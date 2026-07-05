type MessagePart = {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: MessagePart[];
  headers?: Array<{ name?: string; value?: string }>;
};

export function encodeRawEmail(params: {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  inReplyTo?: string;
  references?: string;
}) {
  const lines = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=utf-8",
  ];

  if (params.cc) lines.push(`Cc: ${params.cc}`);
  if (params.inReplyTo) lines.push(`In-Reply-To: ${params.inReplyTo}`);
  if (params.references) lines.push(`References: ${params.references}`);

  const mime = `${lines.join("\r\n")}\r\n\r\n${params.body}`;
  return Buffer.from(mime, "utf-8").toString("base64url");
}

export function getHeader(
  payload: MessagePart | undefined,
  name: string,
): string | undefined {
  return payload?.headers?.find(
    (header) => header.name?.toLowerCase() === name.toLowerCase(),
  )?.value;
}

export function extractEmailBody(payload?: MessagePart): string {
  if (!payload) return "";

  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }

  if (payload.parts?.length) {
    const plain = payload.parts.find((part) => part.mimeType === "text/plain");
    if (plain?.body?.data) {
      return Buffer.from(plain.body.data, "base64").toString("utf-8");
    }

    for (const part of payload.parts) {
      const nested = extractEmailBody(part);
      if (nested) return nested;
    }
  }

  return "";
}

export function parseEmailAddress(value: string) {
  const angleMatch = /<([^>]+)>/.exec(value);
  return (angleMatch?.[1] ?? value).trim();
}

export function summarizeMessage(message: {
  id?: string;
  threadId?: string;
  snippet?: string;
  payload?: MessagePart;
}) {
  const payload = message.payload;
  return {
    id: message.id,
    threadId: message.threadId,
    snippet: message.snippet,
    subject: getHeader(payload, "Subject"),
    from: getHeader(payload, "From"),
    to: getHeader(payload, "To"),
    date: getHeader(payload, "Date"),
    body: extractEmailBody(payload).slice(0, 4000),
  };
}
