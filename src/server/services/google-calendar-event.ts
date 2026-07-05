import { randomUUID } from "crypto";

import { env } from "~/env";
import { corsair } from "~/server/corsair";

export type ScheduleEventArgs = {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  attendeeEmails?: string[];
  addGoogleMeet?: boolean;
  calendarId?: string;
};

type CalendarEventResponse = {
  id?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  htmlLink?: string;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
  };
};

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.AUTH_GOOGLE_ID,
      client_secret: env.AUTH_GOOGLE_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Token refresh failed: ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function getAccessToken(tenantId: string) {
  const tenant = corsair.withTenant(tenantId);
  let accessToken = await tenant.googlecalendar.keys.get_access_token();
  const refreshToken = await tenant.googlecalendar.keys.get_refresh_token();
  if (!refreshToken) {
    throw new Error("Google Calendar is not connected.");
  }
  if (!accessToken) {
    accessToken = await refreshAccessToken(refreshToken);
    await tenant.googlecalendar.keys.set_access_token(accessToken);
  }
  return { accessToken, refreshToken };
}

function extractMeetLink(event: CalendarEventResponse) {
  if (event.hangoutLink) return event.hangoutLink;
  const video = event.conferenceData?.entryPoints?.find(
    (entry) => entry.entryPointType === "video",
  );
  return video?.uri;
}

async function createEventWithGoogleMeet(
  tenantId: string,
  args: ScheduleEventArgs,
) {
  const tenant = corsair.withTenant(tenantId);
  const calendarId = args.calendarId ?? "primary";
  const attendees = args.attendeeEmails?.map((email) => ({ email }));
  const { accessToken, refreshToken } = await getAccessToken(tenantId);

  const body = {
    summary: args.summary,
    description: args.description,
    location: args.location,
    start: { dateTime: args.startDateTime, timeZone: args.timeZone },
    end: { dateTime: args.endDateTime, timeZone: args.timeZone },
    attendees,
    conferenceData: {
      createRequest: {
        requestId: randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  );
  url.searchParams.set("conferenceDataVersion", "1");
  if (attendees?.length) {
    url.searchParams.set("sendUpdates", "all");
  }

  async function post(token: string) {
    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  let res = await post(accessToken);
  if (res.status === 401) {
    const newToken = await refreshAccessToken(refreshToken);
    await tenant.googlecalendar.keys.set_access_token(newToken);
    res = await post(newToken);
  }

  if (!res.ok) {
    throw new Error(`Calendar API error: ${await res.text()}`);
  }

  const created = (await res.json()) as CalendarEventResponse;
  let hangoutLink = extractMeetLink(created);

  if (!hangoutLink && created.id) {
    hangoutLink = await fetchMeetLinkForEvent(
      tenantId,
      calendarId,
      created.id,
      accessToken,
      refreshToken,
    );
  }

  return {
    id: created.id,
    summary: created.summary,
    start: created.start,
    end: created.end,
    htmlLink: created.htmlLink,
    hangoutLink,
    status: "scheduled",
  };
}

async function fetchMeetLinkForEvent(
  tenantId: string,
  calendarId: string,
  eventId: string,
  accessToken: string,
  refreshToken: string,
) {
  const tenant = corsair.withTenant(tenantId);
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
  );
  url.searchParams.set("conferenceDataVersion", "1");

  async function get(token: string) {
    return fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  let res = await get(accessToken);
  if (res.status === 401) {
    const newToken = await refreshAccessToken(refreshToken);
    await tenant.googlecalendar.keys.set_access_token(newToken);
    res = await get(newToken);
  }

  if (!res.ok) return undefined;

  const event = (await res.json()) as CalendarEventResponse;
  return extractMeetLink(event);
}

export async function createCalendarEvent(
  tenantId: string,
  args: ScheduleEventArgs,
) {
  const tenant = corsair.withTenant(tenantId);
  const attendees = args.attendeeEmails?.map((email) => ({ email }));

  if (args.addGoogleMeet) {
    return createEventWithGoogleMeet(tenantId, args);
  }

  const created = await tenant.googlecalendar.api.events.create({
    event: {
      summary: args.summary,
      description: args.description,
      location: args.location,
      start: {
        dateTime: args.startDateTime,
        timeZone: args.timeZone,
      },
      end: {
        dateTime: args.endDateTime,
        timeZone: args.timeZone,
      },
      attendees,
    },
  });

  return {
    id: created.id,
    summary: created.summary,
    start: created.start,
    end: created.end,
    htmlLink: created.htmlLink,
    hangoutLink: created.hangoutLink,
    status: "scheduled",
  };
}
