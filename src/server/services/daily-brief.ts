import OpenAI from "openai";

import { env } from "~/env";
import { corsair } from "~/server/corsair";

export type CalendarEventItem = {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  hangoutLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

export type EmailThreadItem = {
  id: string;
  entityId: string;
  snippet?: string;
  createdAt?: string;
};

export type GithubActivity = {
  login?: string;
  repositories: Array<{
    name?: string;
    fullName?: string;
    htmlUrl?: string;
    updatedAt?: string;
  }>;
};

export type IntegrationError = {
  integration: string;
  message: string;
};

export type DailyBrief = {
  date: string;
  tenantId: string;
  calendar: CalendarEventItem[];
  emails: EmailThreadItem[];
  github: GithubActivity | null;
  summary: string;
  errors: IntegrationError[];
};

function startAndEndOfToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatEventTime(event: CalendarEventItem) {
  const value = event.start?.dateTime ?? event.start?.date;
  if (!value) return "All day";
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildTemplateSummary(brief: Omit<DailyBrief, "summary">) {
  const lines: string[] = [];
  lines.push(`Here is your day for ${brief.date}.`);

  if (brief.calendar.length > 0) {
    lines.push(
      `You have ${brief.calendar.length} calendar event${brief.calendar.length === 1 ? "" : "s"}:`,
    );
    for (const event of brief.calendar.slice(0, 5)) {
      const meet = event.hangoutLink ? " (Google Meet)" : "";
      lines.push(
        `- ${formatEventTime(event)} — ${event.summary ?? "Untitled"}${meet}`,
      );
    }
  } else {
    lines.push("No calendar events scheduled for today.");
  }

  if (brief.emails.length > 0) {
    lines.push(
      `${brief.emails.length} recent email thread${brief.emails.length === 1 ? "" : "s"} synced.`,
    );
    const preview = brief.emails[0]?.snippet?.slice(0, 120);
    if (preview) lines.push(`Latest: ${preview}...`);
  }

  if (brief.github?.login) {
    lines.push(
      `GitHub: ${brief.github.repositories.length} recently updated repositor${brief.github.repositories.length === 1 ? "y" : "ies"} for ${brief.github.login}.`,
    );
  }

  if (brief.errors.length > 0) {
    lines.push(
      `Some integrations need attention: ${brief.errors.map((e) => e.integration).join(", ")}.`,
    );
  }

  return lines.join("\n");
}

async function generateAiSummary(brief: Omit<DailyBrief, "summary">) {
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a concise executive assistant for working professionals. Summarize the user's day in 4-6 bullet points. Mention meetings, important emails, and GitHub activity. Keep it actionable.",
      },
      {
        role: "user",
        content: JSON.stringify({
          date: brief.date,
          calendar: brief.calendar,
          emails: brief.emails,
          github: brief.github,
          errors: brief.errors,
        }),
      },
    ],
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content ?? buildTemplateSummary(brief);
}

export async function getDailyBrief(
  tenantId: string,
  options?: {
    userId?: string;
    onAiPrompt?: () => Promise<void>;
  },
): Promise<DailyBrief> {
  const tenant = corsair.withTenant(tenantId);
  const { start, end } = startAndEndOfToday();
  const errors: IntegrationError[] = [];

  let calendar: CalendarEventItem[] = [];
  try {
    const events = await tenant.googlecalendar.api.events.getMany({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 25,
    });
    calendar = events.items ?? [];
  } catch (error) {
    errors.push({
      integration: "googlecalendar",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  let emails: EmailThreadItem[] = [];
  try {
    const threads = await tenant.gmail.db.threads.list({ limit: 10 });
    emails = threads.map((thread) => ({
      id: thread.id,
      entityId: thread.entity_id,
      snippet: typeof thread.data?.snippet === "string" ? thread.data.snippet : undefined,
      createdAt:
        thread.data?.createdAt instanceof Date
          ? thread.data.createdAt.toISOString()
          : typeof thread.data?.createdAt === "string"
            ? thread.data.createdAt
            : undefined,
    }));
  } catch (error) {
    errors.push({
      integration: "gmail",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  let github: GithubActivity | null = null;
  try {
    const user = await tenant.github.api.users.getAuthenticated({});
    const repositories = await tenant.github.api.repositories.list({
      type: "owner",
      sort: "updated",
      direction: "desc",
      perPage: 5,
    });

    github = {
      login: user.login,
      repositories: (repositories ?? []).map((repo) => ({
        name: repo.name,
        fullName: repo.fullName,
        htmlUrl: repo.htmlUrl,
        updatedAt:
          repo.updatedAt instanceof Date
            ? repo.updatedAt.toISOString()
            : typeof repo.updatedAt === "string"
              ? repo.updatedAt
              : undefined,
      })),
    };
  } catch (error) {
    errors.push({
      integration: "github",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  const baseBrief = {
    date: start.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    tenantId,
    calendar,
    emails,
    github,
    errors,
  };

  const summary = env.OPENAI_API_KEY
    ? await (async () => {
        await options?.onAiPrompt?.();
        return generateAiSummary(baseBrief);
      })()
    : buildTemplateSummary(baseBrief);

  return { ...baseBrief, summary };
}
