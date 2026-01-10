import { useEffect, useState } from "react";

const default_chats = [
  {
    id: crypto.randomUUID(),
    name: "Чат 1",
    pinned: false,
    messages: [
      {
        id: crypto.randomUUID(),
        sender: "bot",
        type: "text",
        content: "Привет, чем могу помочь?",
        timestamp: Date.now(),
      },
    ],
  },
];

export function useChats() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length ? parsed : default_chats;
    } catch {
      return default_chats;
    }
  });

  // activeChatId инициализируется сразу валидным значением
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
        name: "Чат",
        pinned: false,
        messages: [],
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
				name: "Чат",
				pinned: false,
				messages: [],
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
				name: "Чат",
				pinned: false,
				messages,
			},
		]);

		setActiveChatId(newId);
		return newId;
	};

  const renameChat = (chatId, name) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, name } : chat
      )
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
    insertChatAt,
  };
}
