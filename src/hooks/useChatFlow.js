import { useEffect, useRef, useState } from "react";
import { DEFAULT_CHAT_NAME } from "./useChats";
import {
  requestChatTitle,
  streamChatMockCompletion,
} from "../services/chatMockClient";

export function useChatFlow({
	chats,
	activeChatId,
	createChatWithMessages,
	renameChat,
	addMessage,
	updateMessage,
	selectedModel,
}) {
	  const [streamState, setStreamState] = useState({
    status: "idle",
    controller: null,
  });

	const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

	const wait = (ms) => new Promise((res) => setTimeout(res, ms));

	const isStreaming = streamState.status === "streaming";

  const stopStreaming = () => {
    if (streamState.controller) {
      streamState.controller.abort();
    }
    setStreamState({ status: "idle", controller: null });
  };

	const ensureChatTitle = async (chatId, history, opts = {}) => {
    const retries = opts.retries ?? 3;
    const delay = opts.delay ?? 60;
    const timeoutMs = opts.timeoutMs ?? 8000;

    let chat = chatsRef.current.find((c) => c.id === chatId);
    for (let i = 0; i < retries && !chat; i++) {
      await wait(delay);
      chat = chatsRef.current.find((c) => c.id === chatId);
    }

    if (chat && chat.name && chat.name !== DEFAULT_CHAT_NAME) return;

    try {
      const generatedTitle = await requestChatTitle({
        model: "gpt-5",
        history,
        timeoutMs,
      });
      if (generatedTitle) renameChat(chatId, generatedTitle);
    } catch (err) {
      console.warn("Не удалось получить название чата из ChatMock", err);
    }
  };

  const sendMessage = async (message) => {
    if (!message) return;
    if (isStreaming) return;

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      type: message.type,
      content: message.content,
      timestamp: Date.now(),
    };

    let targetChatId = activeChatId;
    let historyForApi = [];
    let prevCount = 0;

    if (!targetChatId) {
      targetChatId = createChatWithMessages([userMessage]);
      historyForApi = [userMessage];
      prevCount = 0;
    } else {
      const existingChat =
        chatsRef.current.find((c) => c.id === targetChatId) || null;
      const prevMessages = existingChat?.messages || [];
      prevCount = prevMessages.length;
      historyForApi = [...prevMessages, userMessage];
      addMessage(targetChatId, userMessage);
    }

    if (prevCount === 0) {
      try {
        await ensureChatTitle(targetChatId, [userMessage], { timeoutMs: 8000 });
      } catch (err) {
        console.warn("Не удалось сгенерировать название перед ответом", err);
      }
      await wait(2000);
    }

    const botMessageId = crypto.randomUUID();
    let botContent = "";
    addMessage(targetChatId, {
      id: botMessageId,
      sender: "bot",
      type: "text",
      content: "",
      timestamp: Date.now(),
      pending: true,
    });

    const controller = new AbortController();
    const hardTimeout = setTimeout(() => {
      if (!controller.signal.aborted) controller.abort("timeout");
    }, 50000);
    setStreamState({ status: "streaming", controller });

    try {
      const fullText = await streamChatMockCompletion({
        model: selectedModel,
        history: historyForApi,
        signal: controller.signal,
        timeoutMs: 45000,
        onToken: (event) => {
          updateMessage(targetChatId, botMessageId, (prev) => {
            if (typeof event === "string") {
              botContent = `${botContent}${event}`;
              return { content: `${prev.content || ""}${event}` };
            }

            if (event?.type === "set") {
              botContent = event.text || "";
              return { content: event.text || "" };
            }

            if (event?.type === "append") {
              botContent = `${botContent}${event.text || ""}`;
              return { content: `${prev.content || ""}${event.text || ""}` };
            }

            return prev;
          });
        },
      });

      botContent = fullText || botContent;

      updateMessage(targetChatId, botMessageId, (prev) => ({
        content: fullText || prev.content,
        pending: false,
      }));
    } catch (err) {
      if (controller.signal.aborted) {
        updateMessage(targetChatId, botMessageId, (prev) => ({
          content: prev.content || "",
          pending: false,
          interrupted: true,
        }));
      } else {
        updateMessage(targetChatId, botMessageId, {
          content: `Ошибка ответа: ${err.message}`,
          pending: false,
          error: true,
        });
      }
    } finally {
      const titleHistory = [
        ...historyForApi,
        { sender: "bot", type: "text", content: botContent },
      ];
      try {
        await ensureChatTitle(targetChatId, titleHistory, { timeoutMs: 8000 });
      } catch (err) {
        console.warn("Не удалось присвоить название чату", err);
      }
      clearTimeout(hardTimeout);
      setStreamState({ status: "idle", controller: null });
    }
  };

	return { isStreaming, stopStreaming, sendMessage };
}




