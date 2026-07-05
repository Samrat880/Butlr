"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowUp,
  CalendarCheck,
  CalendarX,
  Check,
  Inbox,
  MailCheck,
  MailOpen,
  PenLine,
  Reply,
  Search,
  Sparkles,
} from "lucide-react";

import { api } from "~/trpc/react";

type Message = {
  role: "user" | "assistant";
  content: string;
  actions?: string[];
};

const SUGGESTIONS = [
  "Summarize today's inbox",
  "What's on my calendar today?",
  "Find my next free slot",
  "Draft a reply to my latest email",
  "Schedule a focus block tomorrow morning",
];

const ACTION_LABELS: Record<string, { label: string; icon: typeof Check }> = {
  search_emails: { label: "Searched Gmail", icon: Search },
  list_recent_emails: { label: "Checked inbox", icon: Inbox },
  read_email: { label: "Read email", icon: MailOpen },
  create_email_draft: { label: "Draft saved", icon: PenLine },
  send_email: { label: "Email sent", icon: MailCheck },
  reply_to_email: { label: "Reply sent", icon: Reply },
  get_calendar_events: { label: "Checked calendar", icon: CalendarCheck },
  schedule_calendar_event: { label: "Event created", icon: CalendarCheck },
  schedule_meeting_and_notify: { label: "Meeting booked & emailed", icon: MailCheck },
  update_calendar_event: { label: "Event updated", icon: CalendarCheck },
  cancel_calendar_event: { label: "Event cancelled", icon: CalendarX },
};

function ActionChips({ actions }: { actions: string[] }) {
  if (actions.length === 0) return null;
  const unique = [...new Set(actions)];
  return (
    <div className="mb-2.5 flex flex-wrap gap-1.5">
      {unique.map((action) => {
        const meta = ACTION_LABELS[action] ?? { label: action, icon: Check };
        return (
          <span key={action} className="butlr-action-chip">
            <meta.icon className="size-3" />
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  return (
    <div className="butlr-msg flex gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--butlr-blue)]/15">
        <Sparkles className="size-3.5 text-[var(--butlr-blue)]" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <ActionChips actions={message.actions ?? []} />
        <div className="butlr-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ message }: { message: Message }) {
  return (
    <div className="butlr-msg flex justify-end">
      <div className="max-w-[85%] rounded-[20px] rounded-br-md bg-[var(--butlr-blue)] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white">
        {message.content}
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="butlr-msg flex items-center gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--butlr-blue)]/15">
        <Sparkles className="size-3.5 text-[var(--butlr-blue)]" />
      </span>
      <span className="flex items-center gap-2 text-sm text-[var(--butlr-muted)]">
        <span className="flex gap-1">
          <span className="butlr-thinking-dot" />
          <span className="butlr-thinking-dot [animation-delay:150ms]" />
          <span className="butlr-thinking-dot [animation-delay:300ms]" />
        </span>
        Working on it
      </span>
    </div>
  );
}

export function BatcaveChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSentRef = useRef<Message[] | null>(null);

  const usage = api.billing.getUsage.useQuery();

  const send = api.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, actions: data.actions },
      ]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, send.isPending]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || send.isPending) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const payload = nextMessages.map(({ role, content }) => ({
      role,
      content,
    }));
    lastSentRef.current = nextMessages;
    send.mutate({ messages: payload });
  }

  function retry() {
    if (!lastSentRef.current || send.isPending) return;
    send.mutate({
      messages: lastSentRef.current.map(({ role, content }) => ({
        role,
        content,
      })),
    });
  }

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  const promptLimit =
    usage.data?.tier.id === "free"
      ? (usage.data.tier.limits.promptsLifetime ?? 2) -
        usage.data.usage.promptsLifetime
      : (usage.data?.tier.limits.promptsPerMonth ?? 200) -
        (usage.data?.usage.promptsThisMonth ?? 0);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col lg:h-[calc(100vh-2rem)]">
      <header className="flex items-center justify-between px-4 py-3 md:px-8">
        <h1 className="text-sm font-medium text-[var(--butlr-muted)]">
          Email &amp; Calendar
        </h1>
        {usage.data ? (
          <span className="text-xs text-[var(--butlr-muted)]">
            {Math.max(0, promptLimit)} prompts left
          </span>
        ) : null}
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 md:px-8"
      >
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col">
          {isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-[var(--butlr-blue)]/15">
                <Sparkles className="size-6 text-[var(--butlr-blue)]" />
              </span>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                How can I help today?
              </h2>
              <p className="mt-2 max-w-sm text-sm text-[var(--butlr-muted)]">
                I manage your Gmail and Google Calendar. Ask me to search,
                draft, summarize, or schedule.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={send.isPending}
                    onClick={() => submit(suggestion)}
                    className="butlr-chip hover:border-[var(--butlr-blue)]/40 hover:text-[var(--butlr-text)] disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-7 py-6">
              {messages.map((message, index) =>
                message.role === "assistant" ? (
                  <AssistantMessage
                    key={`assistant-${index}`}
                    message={message}
                  />
                ) : (
                  <UserMessage key={`user-${index}`} message={message} />
                ),
              )}
              {send.isPending ? <ThinkingIndicator /> : null}
              {send.error && !send.isPending ? (
                <div className="butlr-msg flex items-start justify-between gap-4 rounded-2xl border border-[var(--butlr-rose)]/25 bg-[var(--butlr-rose)]/10 px-4 py-3">
                  <p className="text-sm text-[var(--butlr-text)]">
                    {send.error.message}
                  </p>
                  <button
                    type="button"
                    onClick={retry}
                    className="shrink-0 text-sm font-medium text-[var(--butlr-blue)] transition-opacity duration-150 hover:opacity-80"
                  >
                    Retry
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 md:px-8 md:pb-6">
        <form
          className="mx-auto w-full max-w-2xl"
          onSubmit={(event) => {
            event.preventDefault();
            submit(input);
          }}
        >
          <div className="butlr-composer flex items-end gap-2 p-2 pl-4">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                autoGrow(event.target);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit(input);
                }
              }}
              placeholder="Ask Butlr about your email or calendar"
              rows={1}
              disabled={send.isPending}
              className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed placeholder:text-[var(--butlr-muted)] focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={send.isPending || !input.trim()}
              className="butlr-send-btn"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-[var(--butlr-muted)]">
            Butlr previews sends and calendar changes before they go out.
          </p>
        </form>
      </div>
    </div>
  );
}
