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
								{chat.name}
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

