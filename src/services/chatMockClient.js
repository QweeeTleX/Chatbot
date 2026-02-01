import { chatMockCredentials, chatMockDefaults } from "../config/credentials";

const API_BASE = `${chatMockCredentials.baseUrl?.replace(/\/+$/, "") || "http://127.0.0.1:8000"}/v1`;

const textDecoder = new TextDecoder();

const buildHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  const { apiKey, login, password } = chatMockCredentials;

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  if (login && password) {
    const encoded = btoa(`${login}:${password}`);
    headers["X-ChatMock-Auth"] = encoded;
    headers["X-ChatMock-Login"] = login;
  }

  return headers;
};

const normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return part;
  }
  if (Array.isArray(part)) {
    return part
      .map((item) => normalizeContentPart(item))
      .filter(Boolean)
      .join("");
  }
  if (part?.text) {
    return part.text;
  }
  if (part?.content) {
    return normalizeContentPart(part.content);
  }
  return "";
};

const buildContentForApi = (message) => {
  if (!message) return "";

  const { type, content } = message;

  if (type === "text") {
    if (typeof content === "string") return content;
    return typeof content === "number" ? String(content) : "";
  }

  if (type === "image") {
    return [
      {
        type: "image_url",
        image_url: { url: content },
      },
    ];
  }

  if (type === "images" && Array.isArray(content)) {
    return content.map((url) => ({
      type: "image_url",
      image_url: { url },
    }));
  }

  if (type === "mixed" && content) {
    const parts = [];
    if (content.text) {
      parts.push({ type: "text", text: content.text });
    }
    const imgs = [];
    if (content.image) imgs.push(content.image);
    if (Array.isArray(content.images)) imgs.push(...content.images);
    imgs.forEach((url) => {
      parts.push({ type: "image_url", image_url: { url } });
    });
    return parts.length ? parts : "";
  }

  return typeof content === "string" ? content : "";
};

const toApiMessages = (history) =>
  (history || []).map((msg) => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: buildContentForApi(msg),
  }));

const stripThinkTags = (text) => {
  if (!text) return "";
  const withoutBlocks = text.replace(/<think[\s\S]*?<\/think>/gi, "");
  const withoutTags = withoutBlocks.replace(/<\/?think[^>]*>/gi, "");
  return withoutTags.replace(/\s+/g, " ").trim();
};

export const fetchChatMockModels = async () => {
  const res = await fetch(`${API_BASE}/models`, {
    method: "GET",
    headers: buildHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to load models: ${res.status}`);
  }

  const data = await res.json();
  const raw = Array.isArray(data?.data) ? data.data : [];
  const models = raw
    .map((m) => m?.id)
    .filter(Boolean)
    .map((id) => String(id));

  return models.length ? models : [chatMockDefaults.fallbackModel];
};

export const streamChatMockCompletion = async ({
  model,
  history,
  signal,
  onToken,
  timeoutMs = 45000,
}) => {
  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(),
    signal,
    body: JSON.stringify({
      model: model || chatMockDefaults.fallbackModel,
      stream: true,
      temperature: 0.4,
      messages: toApiMessages(history),
      stream_options: { include_usage: false },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ChatMock error ${res.status}: ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Streaming is not supported in this browser/runtime.");
  }

  const timer = timeoutMs
    ? setTimeout(() => {
        try {
          if (signal && !signal.aborted && reader?.cancel) {
            reader.cancel("timeout");
          }
        } catch {}
      }, timeoutMs)
    : null;

  let buffer = "";
  let full = "";
  let inThink = false;
  let placeholderShown = false;

  while (true) {
    if (signal?.aborted) {
      throw new Error("stream aborted");
    }

    let readResult;
    try {
      readResult = await reader.read();
    } catch (err) {
      break;
    }

    const { value, done } = readResult;
    buffer += textDecoder.decode(value || new Uint8Array(), { stream: !done });

    const segments = buffer.split("\n\n");
    buffer = segments.pop() || "";

    for (const segment of segments) {
      const lines = segment.split("\n").filter(Boolean);
      for (const line of lines) {
        const trimmed = line.replace(/^data:\s*/, "");
        if (!trimmed) continue;
        if (trimmed === "[DONE]") {
          return full;
        }

        let parsed;
        try {
          parsed = JSON.parse(trimmed);
        } catch (err) {
          console.error("Failed to parse ChatMock chunk", err, trimmed);
          continue;
        }

        if (parsed?.error) {
          const msg = parsed.error?.message || "Unknown ChatMock error";
          throw new Error(msg);
        }

        const delta = parsed?.choices?.[0]?.delta;
        if (!delta) continue;
        const rawPart = delta.content ?? delta.reasoning_content;
        const content = normalizeContentPart(rawPart);
        if (!content) continue;

        let cursor = 0;
        while (cursor < content.length) {
          if (inThink) {
            const closeIdx = content.indexOf("</think>", cursor);
            if (closeIdx === -1) {
              // still reasoning, skip chunk but show placeholder once
              if (!placeholderShown) {
                onToken?.({ type: "set", text: "Думаю..." });
                placeholderShown = true;
              }
              cursor = content.length;
              break;
            }
            // closing tag found
            inThink = false;
            cursor = closeIdx + "</think>".length;
            if (placeholderShown) {
              onToken?.({ type: "set", text: "" });
              placeholderShown = false;
            }
            // continue to process the remainder after </think>
            continue;
          }

          const openIdx = content.indexOf("<think", cursor);
          if (openIdx === -1) {
            const chunkText = content.slice(cursor);
            if (chunkText.trim()) {
              const piece = full ? chunkText : chunkText.replace(/^\s+/, "");
              full += piece;
              onToken?.({ type: "append", text: piece });
            }
            break;
          }

          // text before <think>
          const before = content.slice(cursor, openIdx);
          if (before.trim()) {
            const piece = full ? before : before.replace(/^\s+/, "");
            full += piece;
            onToken?.({ type: "append", text: piece });
          }

          // enter think
          const closeTagStart = content.indexOf(">", openIdx);
          inThink = true;
          cursor = closeTagStart === -1 ? content.length : closeTagStart + 1;
          if (!placeholderShown) {
            onToken?.({ type: "set", text: "Думаю..." });
            placeholderShown = true;
          }
        }
      }
    }

    if (done) break;
  }

  if (timer) clearTimeout(timer);

  return full;
};

export const requestChatTitle = async ({ model, history, timeoutMs = 12000 }) => {
  const prompt =
    "Ты генератор названий чатов. Используй только контекст сообщений ниже, выбери одно короткое (до 6 слов) нейтральное название на русском. Не используй кавычки, имена, почты, ссылки или личные данные. Ответь только названием без пояснений.";

  const payload = {
    model: "gpt-5",
    stream: false,
    max_tokens: 32,
    temperature: 0.1,
    messages: [
      { role: "system", content: prompt },
      ...toApiMessages(history).slice(-10),
    ],
  };

  const controller = new AbortController();
  const timer = timeoutMs
    ? setTimeout(() => {
        try {
          controller.abort("title-timeout");
        } catch {}
      }, timeoutMs)
    : null;

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
    signal: controller.signal,
  }).finally(() => {
    if (timer) clearTimeout(timer);
  });

  if (!res.ok) {
    throw new Error(`Failed to generate title: ${res.status}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  const text = normalizeContentPart(content);
  const cleaned = stripThinkTags(text);
  return cleaned
    ? cleaned.trim().replace(/^["'«»]+|["'«»]+$/g, "")
    : null;
};
