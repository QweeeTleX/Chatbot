import { useEffect, useState } from "react";

const default_chats = [
	{
		id: 1,
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
		return saved ? JSON.parse(saved) : default_chats;
	});

	const [activeChatId, setActiveChatId] = useState(() => {
		return Number(localStorage.getItem("activeChatId")) || 1;
	});


	useEffect(() => {
		localStorage.setItem("chats", JSON.stringify(chats));
	}, [chats]);

	useEffect(() => {
		localStorage.setItem("activeChatId", activeChatId);
	}, [activeChatId]);


	const createChat = () => {
		setChats((prev) => {
			const newId = 
				prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;

			setActiveChatId(newId);	

			return [
				...prev,
				{
					id: newId,
					name: `Чат ${newId}`,
					pinned: false,
					messages: [],
				},
			];	
		});
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
				chat.id === chatId
					? { ...chat, pinned: !chat.pinned }
					: chat
			)
		);
	};

	const deleteChat = (chatId) => {
		setChats((prev) => prev.filter((c) => c.id !== chatId));
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
		renameChat,
		togglePinChat,
		deleteChat,
		addMessage,
		insertChatAt
	};
}






