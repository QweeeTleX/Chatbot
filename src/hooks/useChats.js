import { useEffect, useState } from "react";

export const DEFAULT_CHAT_NAME = "Новый чат";
const defaultChats = [];

export function useChats() {
  const normalizeChats = (list) =>
    list.map((chat) => {
      const fallbackCreatedAt =
        chat.messages && chat.messages.length
          ? chat.messages[0]?.timestamp || Date.now()
          : Date.now();
      return chat.createdAt ? chat : { ...chat, createdAt: fallbackCreatedAt };
    });

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length
        ? normalizeChats(parsed)
        : defaultChats;
    } catch {
      return defaultChats;
    }
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const saved = localStorage.getItem("activeChatId");
    const initial = saved && saved !== "null" ? saved : null;

    if (initial && chats.some((c) => c.id === initial)) {
      return initial;
    }

    return chats.length ? chats[0].id : null;
  });

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem("activeChatId", activeChatId ?? "null");
  }, [activeChatId]);

  const createChat = () => {
    const newId = crypto.randomUUID();

    setChats((prev) => [
      ...prev,
      {
        id: newId,
        name: DEFAULT_CHAT_NAME,
        pinned: false,
        messages: [],
        createdAt: Date.now(),
      },
    ]);

    setActiveChatId(newId);
  };

  const createChatAndGetId = () => {
    const newId = crypto.randomUUID();

    setChats((prev) => [
      ...prev,
      {
        id: newId,
        name: DEFAULT_CHAT_NAME,
        pinned: false,
        messages: [],
        createdAt: Date.now(),
      },
    ]);

    setActiveChatId(newId);
    return newId;
  };

  const createChatWithMessages = (messages) => {
    const newId = crypto.randomUUID();

    setChats((prev) => [
      ...prev,
      {
        id: newId,
        name: DEFAULT_CHAT_NAME,
        pinned: false,
        messages,
        createdAt:
          messages && messages.length
            ? messages[0]?.timestamp || Date.now()
            : Date.now(),
      },
    ]);

    setActiveChatId(newId);
    return newId;
  };

  const renameChat = (chatId, name) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, name } : chat))
    );
  };

  const togglePinChat = (chatId) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat
      )
    );
  };

  const deleteChat = (chatId) => {
    setChats((prev) => {
      const idx = prev.findIndex((c) => c.id === chatId);
      if (idx === -1) return prev;

      const next = prev.filter((c) => c.id !== chatId);

      setActiveChatId((currentActiveId) => {
        if (currentActiveId !== chatId) return currentActiveId;

        const candidate = next[idx] || next[idx - 1] || null;
        return candidate ? candidate.id : null;
      });

      return next;
    });
  };

  const addMessage = (chatId, message) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    );
  };

  const insertChatAt = (chat, index) => {
    setChats((prev) => [
      ...prev.slice(0, index),
      chat,
      ...prev.slice(index),
    ]);
  };

  const updateMessage = (chatId, messageId, updater) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        return {
          ...chat,
          messages: chat.messages.map((msg) =>
            msg.id === messageId
              ? typeof updater === "function"
                ? { ...msg, ...updater(msg) }
                : { ...msg, ...updater }
              : msg
          ),
        };
      })
    );
  };

  return {
    chats,
    activeChatId,
    setActiveChatId,
    createChat,
    createChatAndGetId,
    createChatWithMessages,
    renameChat,
    togglePinChat,
    deleteChat,
    addMessage,
    updateMessage,
    insertChatAt,
  };
}
