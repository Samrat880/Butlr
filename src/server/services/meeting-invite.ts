import { corsair } from "~/server/corsair";
import {
  finalizeEmailBody,
  type EmailSender,
  suggestMeetingEmailSubjects,
} from "~/server/services/email-signature";
import { encodeRawEmail } from "~/server/services/gmail-mail";
import { createCalendarEvent } from "~/server/services/google-calendar-event";

export type ScheduleMeetingAndNotifyArgs = {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  attendeeEmails: string[];
  notifySubject?: string;
  notifyBody?: string;
  addGoogleMeet?: boolean;
  sender?: EmailSender;
};

function formatMeetingTime(
  startDateTime: string,
  endDateTime: string,
  timeZone: string,
) {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  const date = start.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone,
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
  const endTime = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
  return `${date}, ${startTime} to ${endTime}`;
}

export function buildMeetingNotifyBody(
  notifyBody: string | undefined,
  meetLink: string | undefined,
  summary: string,
  when: string,
  sender?: EmailSender,
) {
  const trimmedBody = notifyBody?.trim();
  const base =
    trimmedBody && trimmedBody.length > 0
      ? trimmedBody
      : `Hi,\n\nI've scheduled "${summary}" for ${when}.\n\nLooking forward to it!`;

  const signed = sender ? finalizeEmailBody(base, sender) : base;

  if (!meetLink) return signed;

  const withPlaceholder = signed
    .replace(/\{\{meet(ing)?Link\}\}/gi, meetLink)
    .replace(/\[meet(ing)? link\]/gi, meetLink);

  if (withPlaceholder.includes(meetLink)) return withPlaceholder;

  return `${withPlaceholder}\n\nJoin Google Meet: ${meetLink}`;
}

export { suggestMeetingEmailSubjects };

export async function scheduleMeetingAndNotify(
  tenantId: string,
  args: ScheduleMeetingAndNotifyArgs,
) {
  if (!args.attendeeEmails.length) {
    throw new Error("At least one attendee email is required.");
  }

  const event = await createCalendarEvent(tenantId, {
    summary: args.summary,
    description: args.description,
    location: args.location,
    startDateTime: args.startDateTime,
    endDateTime: args.endDateTime,
    timeZone: args.timeZone,
    attendeeEmails: args.attendeeEmails,
    addGoogleMeet: args.addGoogleMeet ?? true,
  });

  let meetLink = event.hangoutLink;
  if (!meetLink && event.id) {
    const tenant = corsair.withTenant(tenantId);
    const full = await tenant.googlecalendar.api.events.get({ id: event.id });
    meetLink =
      full.hangoutLink ??
      full.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === "video",
      )?.uri;
  }

  const when = formatMeetingTime(
    args.startDateTime,
    args.endDateTime,
    args.timeZone,
  );

  if (!meetLink) {
    throw new Error(
      "Calendar event was created but Google Meet link is missing. Try again or check Calendar permissions.",
    );
  }

  const trimmedSubject = args.notifySubject?.trim();
  const subject =
    trimmedSubject && trimmedSubject.length > 0
      ? trimmedSubject
      : suggestMeetingEmailSubjects(args.summary, when)[0]!;
  const body = buildMeetingNotifyBody(
    args.notifyBody,
    meetLink,
    args.summary,
    when,
    args.sender,
  );

  const tenant = corsair.withTenant(tenantId);
  const raw = encodeRawEmail({
    to: args.attendeeEmails.join(", "),
    subject,
    body,
  });
  const sent = await tenant.gmail.api.messages.send({ raw });

  return {
    ...event,
    hangoutLink: meetLink,
    emailSent: true,
    emailMessageId: sent.id,
    emailThreadId: sent.threadId,
    notifySubject: subject,
    notifyBody: body,
    attendeesNotified: args.attendeeEmails,
  };
}
