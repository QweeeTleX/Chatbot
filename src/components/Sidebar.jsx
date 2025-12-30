import "../styles/sidebar.css";


export default function Sidebar({ chats, activeChatId, onSelectChat, onCreateChat }) {
	return (
		<div className="sidebar">
			<h2>Чаты</h2>
			<button className="new-chat" onClick={onCreateChat}>+ Новый чат</button>

			<ul>
				{chats.map((chat) => (
					<li
						key={chat.id}
						className={`chat-item ${
							chat.id === activeChatId ? "active" : ""
							}`}
							onClick={() => onSelectChat(chat.id)}
					>
								<span className="chat-title">{chat.name}</span>

								<div className="chat-actions">
									<span className="chat-action">✏️ Переименовать</span>
									<span className="chat-action">📌 Закрепить</span>
									<span className="chat-action">🗑️ Удалить</span>
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

