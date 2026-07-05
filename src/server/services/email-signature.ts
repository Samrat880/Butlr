export type EmailSender = {
  name?: string | null;
  email?: string | null;
};

export function resolveSenderName(sender: EmailSender) {
  const fromName = sender.name?.trim();
  if (fromName) return fromName;

  const local = sender.email?.split("@")[0]?.trim();
  if (!local) return undefined;

  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const PLACEHOLDER_SIGNATURE =
  /\[your name\]|\[name\]|\{\{senderName\}\}|\[signature\]/gi;

export function finalizeEmailBody(body: string, sender: EmailSender) {
  const senderName = resolveSenderName(sender);
  let text = body.trim();

  if (senderName) {
    text = text.replace(PLACEHOLDER_SIGNATURE, senderName);
  } else {
    text = text.replace(PLACEHOLDER_SIGNATURE, "").trim();
  }

  if (!senderName) return text;

  const signoffMatch = /(\n\n(?:Best|Thanks|Thank you|Regards|Cheers|Sincerely),?\s*)$/i.exec(
    text,
  );
  if (signoffMatch) {
    const afterSignoff = text.slice(signoffMatch.index! + signoffMatch[0].length).trim();
    if (!afterSignoff || PLACEHOLDER_SIGNATURE.test(afterSignoff)) {
      text = `${text.slice(0, signoffMatch.index)}${signoffMatch[1]}${senderName}`;
    }
  } else if (!text.includes(senderName)) {
    text = `${text}\n\nBest,\n${senderName}`;
  }

  return text.trim();
}

export function suggestMeetingEmailSubjects(summary: string, when: string) {
  const shortTitle = summary.trim() || "Catch up";
  return [
    `${shortTitle} - ${when}`,
    `Google Meet: ${shortTitle}`,
    `Let's connect - ${when}`,
  ];
}
