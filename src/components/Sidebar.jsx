import { useState } from "react";
import "../styles/sidebar.css";


export default function Sidebar({ chats, activeChatId, onSelectChat, onCreateChat, onRenameChat, onTogglePinChat, onDeleteChat, theme, onToggleTheme }) {

	const [editingChatId, setEditingChatId] = useState(null);

	const [editingTitle, setEditingTitle] = useState("");

	const saveTitle = (chatId) => {
		const trimmed = editingTitle.trim();
		if (!trimmed) return;

		onRenameChat(chatId, trimmed);
		setEditingChatId(null);
	};

	return (
		<div className="sidebar">
			<h2>Чаты</h2>
			<button className="theme-toggle" onClick={onToggleTheme}>
				{theme === "dark" ? "🌙 Тёмная" : "☀️ Светлая"}
			</button>
			<button className="new-chat" onClick={onCreateChat}>+ Новый чат</button>

			<ul>
				{chats.map((chat) => (
					<li
						key={chat.id}
						className={`chat-item 
							${chat.id === activeChatId ? "active" : ""}
						  ${chat.pinned ? "pinned" : ""}
							`}
							onClick={() => onSelectChat(chat.id)}
					>
								{editingChatId === chat.id ? (
									<input
										className="chat-title-input"
										value={editingTitle}
										onChange={(e) => setEditingTitle(e.target.value)}
										onClick={(e) => e.stopPropagation()}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												saveTitle(chat.id);
											}
										}}
										onBlur={() => {
											saveTitle(chat.id);
										}}
										/>
								) : (
									<span className="chat-title">{chat.name}</span>
										
								)}

								<div className="chat-actions">
									<span className="chat-action"
									onClick={(e) => {
										e.stopPropagation();
										setEditingChatId(chat.id);
										setEditingTitle(chat.name);
									}}
									>
										✏️ 
									</span>

									<span className="chat-action"
									onClick={(e) => {
										e.stopPropagation();
										onTogglePinChat(chat.id);
									}}
									>
										{chat.pinned ? "📌" : "📍"}
										</span>


									<span className="chat-action danger"
									onClick={(e) => {
										e.stopPropagation();
										onDeleteChat(chat.id);
									}}
									>
										🗑️
										</span>
								</div>
							</li>
				))}
			</ul>
		</div>
	);
}




/*export default function Sidebar() {
	return (
		<div className="sidebar">
			<h2>Чаты</h2>
			<button className="new-chat">+ Новый чат</button>

			<ul>
				<li className="chat-item active">Чат 1</li>
				<li className="chat-item">Чат 2</li>
			</ul>
		</div>
	);
}
*/

