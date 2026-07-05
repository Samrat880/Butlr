import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";

import { env } from "~/env";
import { corsair } from "~/server/corsair";
import {
  buildConfirmationBlock,
  buildButlrSystemPrompt,
  guardUserInput,
  hasUserConfirmed,
  assistantAskedForConfirmation,
  SCOPE_HELP_REPLY,
  TOOLS_REQUIRING_CONFIRMATION,
} from "~/server/services/cave-guardrails";
import {
  encodeRawEmail,
  getHeader,
  parseEmailAddress,
  summarizeMessage,
} from "~/server/services/gmail-mail";
import { createCalendarEvent } from "~/server/services/google-calendar-event";
import { scheduleMeetingAndNotify, buildMeetingNotifyBody } from "~/server/services/meeting-invite";
import {
  finalizeEmailBody,
  type EmailSender,
} from "~/server/services/email-signature";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ButlrUserContext = EmailSender;

const ASSISTANT_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_emails",
      description:
        "Search Gmail using a query (from:, subject:, keyword, is:unread, etc.).",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Gmail search query" },
          maxResults: { type: "number", description: "Default 10" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_recent_emails",
      description: "List the most recent inbox messages from Gmail.",
      parameters: {
        type: "object",
        properties: {
          maxResults: { type: "number", description: "Default 10" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_email",
      description:
        "Read the full content of a specific email by message ID (from search/list results).",
      parameters: {
        type: "object",
        properties: {
          messageId: { type: "string" },
        },
        required: ["messageId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_email_draft",
      description:
        "Compose and save an email draft without sending. Use when user wants to review first.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string" },
          subject: { type: "string" },
          body: { type: "string" },
          cc: { type: "string" },
        },
        required: ["to", "subject", "body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_email",
      description:
        "Send a new email immediately. Do not use this for meeting invites when attendeeEmails were used in scheduling; that email is sent automatically with the Meet link.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string" },
          subject: { type: "string" },
          body: { type: "string" },
          cc: { type: "string" },
        },
        required: ["to", "subject", "body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reply_to_email",
      description: "Reply to an existing email thread by message ID.",
      parameters: {
        type: "object",
        properties: {
          messageId: { type: "string" },
          body: { type: "string", description: "Reply message text" },
        },
        required: ["messageId", "body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_calendar_events",
      description:
        "Get calendar events between two ISO datetimes. Use for today, this week, or custom ranges.",
      parameters: {
        type: "object",
        properties: {
          timeMin: { type: "string", description: "ISO 8601 start" },
          timeMax: { type: "string", description: "ISO 8601 end" },
        },
        required: ["timeMin", "timeMax"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "schedule_calendar_event",
      description:
        "Schedule calendar events. When attendeeEmails are provided, Butlr automatically creates Google Meet and sends one email to attendees with the Meet link. For focus blocks or solo events, omit attendeeEmails.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string", description: "Event title" },
          description: { type: "string" },
          location: { type: "string" },
          startDateTime: { type: "string", description: "ISO 8601 start" },
          endDateTime: { type: "string", description: "ISO 8601 end" },
          timeZone: {
            type: "string",
            description: "IANA timezone e.g. Asia/Kolkata",
          },
          attendeeEmails: {
            type: "array",
            items: { type: "string" },
          },
          addGoogleMeet: {
            type: "boolean",
            description:
              "When true, creates a Google Meet link for the event. Use when user mentions Meet, video call, or virtual meeting.",
          },
        },
        required: ["summary", "startDateTime", "endDateTime"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "schedule_meeting_and_notify",
      description:
        "Book a calendar meeting with Google Meet and send one email to attendees that includes the Meet link. Use when the user wants to schedule a meeting and notify someone by email. One confirmation covers both the calendar event and the email.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string", description: "Event title" },
          description: { type: "string" },
          location: { type: "string" },
          startDateTime: { type: "string", description: "ISO 8601 start" },
          endDateTime: { type: "string", description: "ISO 8601 end" },
          timeZone: {
            type: "string",
            description: "IANA timezone e.g. Asia/Kolkata",
          },
          attendeeEmails: {
            type: "array",
            items: { type: "string" },
            description: "Required. People to invite on calendar and email.",
          },
          notifySubject: {
            type: "string",
            description: "Email subject. Defaults to meeting title and time.",
          },
          notifyBody: {
            type: "string",
            description:
              "Full email body. Sign with the user's real name from context. Never use [Your Name] placeholders.",
          },
          addGoogleMeet: {
            type: "boolean",
            description: "Default true. Creates a Google Meet link.",
          },
        },
        required: ["summary", "startDateTime", "endDateTime", "attendeeEmails"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_calendar_event",
      description: "Update an existing calendar event by event ID.",
      parameters: {
        type: "object",
        properties: {
          eventId: { type: "string" },
          summary: { type: "string" },
          description: { type: "string" },
          startDateTime: { type: "string" },
          endDateTime: { type: "string" },
          timeZone: { type: "string" },
        },
        required: ["eventId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cancel_calendar_event",
      description: "Cancel/delete a calendar event by event ID.",
      parameters: {
        type: "object",
        properties: {
          eventId: { type: "string" },
        },
        required: ["eventId"],
      },
    },
  },
];

function startAndEndOfToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function defaultTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const text = asString(value);
  return text || undefined;
}

type ToolExecutionContext = {
  lastMeetLink?: string;
  sender: EmailSender;
};

async function executeTool(
  tenantId: string,
  name: string,
  args: Record<string, unknown>,
  context: ToolExecutionContext,
) {
  const tenant = corsair.withTenant(tenantId);

  switch (name) {
    case "search_emails": {
      const query = asString(args.query);
      const maxResults = Number(args.maxResults ?? 10);
      const result = await tenant.gmail.api.messages.list({
        q: query,
        maxResults,
      });
      const messages = result.messages ?? [];
      const detailed = await Promise.all(
        messages.slice(0, maxResults).map(async (message) => {
          if (!message.id) return message;
          const full = await tenant.gmail.api.messages.get({
            id: message.id,
            format: "metadata",
            metadataHeaders: ["From", "To", "Subject", "Date"],
          });
          return summarizeMessage(full);
        }),
      );
      return detailed;
    }
    case "list_recent_emails": {
      const maxResults = Number(args.maxResults ?? 10);
      const result = await tenant.gmail.api.messages.list({
        maxResults,
        labelIds: ["INBOX"],
      });
      const messages = result.messages ?? [];
      const detailed = await Promise.all(
        messages.map(async (message) => {
          if (!message.id) return message;
          const full = await tenant.gmail.api.messages.get({
            id: message.id,
            format: "metadata",
            metadataHeaders: ["From", "To", "Subject", "Date"],
          });
          return summarizeMessage(full);
        }),
      );
      return detailed;
    }
    case "read_email": {
      const message = await tenant.gmail.api.messages.get({
        id: asString(args.messageId),
        format: "full",
      });
      return summarizeMessage(message);
    }
    case "create_email_draft": {
      const body = finalizeEmailBody(asString(args.body), context.sender);
      const raw = encodeRawEmail({
        to: asString(args.to),
        subject: asString(args.subject),
        body,
        cc: optionalString(args.cc),
      });
      const draft = await tenant.gmail.api.drafts.create({
        draft: { message: { raw } },
      });
      return {
        draftId: draft.id,
        messageId: draft.message?.id,
        threadId: draft.message?.threadId,
        status: "draft_saved",
      };
    }
    case "send_email": {
      let body = finalizeEmailBody(asString(args.body), context.sender);
      if (
        context.lastMeetLink &&
        !/https?:\/\//i.test(body) &&
        /\b(meet|video call|google meet)\b/i.test(body)
      ) {
        body = buildMeetingNotifyBody(
          body,
          context.lastMeetLink,
          asString(args.subject),
          "",
          context.sender,
        );
      }

      const raw = encodeRawEmail({
        to: asString(args.to),
        subject: asString(args.subject),
        body,
        cc: optionalString(args.cc),
      });
      const sent = await tenant.gmail.api.messages.send({ raw });
      return {
        messageId: sent.id,
        threadId: sent.threadId,
        status: "sent",
      };
    }
    case "reply_to_email": {
      const original = await tenant.gmail.api.messages.get({
        id: asString(args.messageId),
        format: "full",
      });
      const subject =
        getHeader(original.payload, "Subject")?.replace(/^Re:\s*/i, "") ??
        "No subject";
      const from = getHeader(original.payload, "From") ?? "";
      const toAddress = parseEmailAddress(from);
      const messageIdHeader = getHeader(original.payload, "Message-ID");
      const references = getHeader(original.payload, "References");

      const raw = encodeRawEmail({
        to: toAddress,
        subject: `Re: ${subject}`,
        body: finalizeEmailBody(asString(args.body), context.sender),
        inReplyTo: messageIdHeader,
        references: references
          ? `${references} ${messageIdHeader ?? ""}`.trim()
          : messageIdHeader,
      });

      const sent = await tenant.gmail.api.messages.send({
        raw,
        threadId: original.threadId,
      });

      return {
        messageId: sent.id,
        threadId: sent.threadId,
        status: "reply_sent",
      };
    }
    case "get_calendar_events": {
      let timeMin = asString(args.timeMin);
      let timeMax = asString(args.timeMax);

      if (timeMin === "today") {
        const { start, end } = startAndEndOfToday();
        timeMin = start.toISOString();
        timeMax = end.toISOString();
      }

      const events = await tenant.googlecalendar.api.events.getMany({
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 50,
      });

      return (events.items ?? []).map((event) => ({
        id: event.id,
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: event.start,
        end: event.end,
        hangoutLink: event.hangoutLink,
        htmlLink: event.htmlLink,
      }));
    }
    case "schedule_calendar_event": {
      const timeZone =
        optionalString(args.timeZone) ?? defaultTimeZone();
      const attendeeEmails = Array.isArray(args.attendeeEmails)
        ? args.attendeeEmails.map((email) => asString(email)).filter(Boolean)
        : [];
      const addGoogleMeet =
        args.addGoogleMeet === true ||
        (attendeeEmails.length > 0 && args.addGoogleMeet !== false);

      if (attendeeEmails.length > 0) {
        const result = await scheduleMeetingAndNotify(tenantId, {
          summary: asString(args.summary),
          description: optionalString(args.description),
          location: optionalString(args.location),
          startDateTime: asString(args.startDateTime),
          endDateTime: asString(args.endDateTime),
          timeZone,
          attendeeEmails,
          notifySubject: optionalString(args.notifySubject),
          notifyBody:
            optionalString(args.notifyBody) ?? optionalString(args.description),
          addGoogleMeet,
          sender: context.sender,
        });
        context.lastMeetLink = result.hangoutLink;
        return result;
      }

      const result = await createCalendarEvent(tenantId, {
        summary: asString(args.summary),
        description: optionalString(args.description),
        location: optionalString(args.location),
        startDateTime: asString(args.startDateTime),
        endDateTime: asString(args.endDateTime),
        timeZone,
        addGoogleMeet,
      });
      if (result.hangoutLink) context.lastMeetLink = result.hangoutLink;
      return result;
    }
    case "schedule_meeting_and_notify": {
      const timeZone =
        optionalString(args.timeZone) ?? defaultTimeZone();
      const attendeeEmails = Array.isArray(args.attendeeEmails)
        ? args.attendeeEmails.map((email) => asString(email)).filter(Boolean)
        : [];

      const result = await scheduleMeetingAndNotify(tenantId, {
        summary: asString(args.summary),
        description: optionalString(args.description),
        location: optionalString(args.location),
        startDateTime: asString(args.startDateTime),
        endDateTime: asString(args.endDateTime),
        timeZone,
        attendeeEmails,
        notifySubject: optionalString(args.notifySubject),
        notifyBody: optionalString(args.notifyBody),
        addGoogleMeet: args.addGoogleMeet !== false,
        sender: context.sender,
      });
      context.lastMeetLink = result.hangoutLink;
      return result;
    }
    case "update_calendar_event": {
      const timeZone = optionalString(args.timeZone) ?? defaultTimeZone();
      const updated = await tenant.googlecalendar.api.events.update({
        id: asString(args.eventId),
        event: {
          summary: optionalString(args.summary),
          description: optionalString(args.description),
          start: args.startDateTime
            ? { dateTime: asString(args.startDateTime), timeZone }
            : undefined,
          end: args.endDateTime
            ? { dateTime: asString(args.endDateTime), timeZone }
            : undefined,
        },
      });
      return {
        id: updated.id,
        summary: updated.summary,
        htmlLink: updated.htmlLink,
        status: "updated",
      };
    }
    case "cancel_calendar_event": {
      await tenant.googlecalendar.api.events.delete({
        id: asString(args.eventId),
      });
      return { eventId: asString(args.eventId), status: "cancelled" };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function executeToolWithGuardrails(
  tenantId: string,
  name: string,
  args: Record<string, unknown>,
  history: ChatMessage[],
  confirmationGranted: { value: boolean },
  context: ToolExecutionContext,
) {
  if (TOOLS_REQUIRING_CONFIRMATION.has(name)) {
    if (!confirmationGranted.value) {
      if (!hasUserConfirmed(history) || !assistantAskedForConfirmation(history)) {
        return buildConfirmationBlock(name, args);
      }
      confirmationGranted.value = true;
    }
  }

  return executeTool(tenantId, name, args, context);
}

export async function runCaveAssistant(
  tenantId: string,
  history: ChatMessage[],
  sender: ButlrUserContext = {},
): Promise<{ reply: string; actions: string[]; guarded?: boolean }> {
  if (!env.OPENAI_API_KEY) {
    throw new Error(
      "OpenAI is not configured. Add OPENAI_API_KEY to your environment.",
    );
  }

  const guard = guardUserInput(history);
  if (!guard.allowed) {
    return { reply: guard.message, actions: [], guarded: true };
  }

  if (guard.intent === "help") {
    return { reply: SCOPE_HELP_REPLY, actions: [], guarded: true };
  }

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const actions: string[] = [];
  const tz = defaultTimeZone();
  const today = startAndEndOfToday();
  const todayRange = `${today.start.toISOString()} to ${today.end.toISOString()}`;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: buildButlrSystemPrompt(tz, todayRange, sender),
    },
    ...history.map(
      (message) =>
        ({
          role: message.role,
          content: message.content,
        }) satisfies ChatCompletionMessageParam,
    ),
  ];

  const confirmationGranted = { value: false };
  const toolContext: ToolExecutionContext = { sender };

  for (let step = 0; step < 10; step++) {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: ASSISTANT_TOOLS,
      tool_choice: "auto",
      temperature: 0.3,
    });

    const choice = response.choices[0];
    if (!choice) {
      throw new Error("No response from OpenAI");
    }

    const assistantMessage = choice.message;
    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls;
    if (!toolCalls?.length) {
      const reply =
        assistantMessage.content?.trim() ??
        "I couldn't generate a response. Please try again.";
      return { reply, actions };
    }

    for (const toolCall of toolCalls) {
      if (toolCall.type !== "function") continue;

      let parsedArgs: Record<string, unknown> = {};
      try {
        parsedArgs = JSON.parse(toolCall.function.arguments) as Record<
          string,
          unknown
        >;
      } catch {
        parsedArgs = {};
      }

      let result: unknown;
      try {
        result = await executeToolWithGuardrails(
          tenantId,
          toolCall.function.name,
          parsedArgs,
          history,
          confirmationGranted,
          toolContext,
        );
        if (
          result &&
          typeof result === "object" &&
          "blocked" in result &&
          (result as { blocked?: boolean }).blocked
        ) {
          // Confirmation required — do not count as completed action
        } else {
          actions.push(toolCall.function.name);
        }
      } catch (error) {
        result = {
          error:
            error instanceof Error
              ? error.message
              : "Tool execution failed. Check Integrations are authenticated.",
        };
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  return {
    reply:
      "I hit the maximum number of steps for this request. Try breaking it into smaller tasks.",
    actions,
  };
}
