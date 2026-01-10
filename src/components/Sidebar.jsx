import { useState } from "react";
import "../styles/sidebar.css";

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onRenameChat,
  onTogglePinChat,
  onDeleteChat,
  theme,
  onToggleTheme,
  collapsed,
  onToggleCollapse,
}) {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const saveTitle = (chatId) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) return;

    onRenameChat(chatId, trimmed);
    setEditingChatId(null);
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-logo">
        <span className="logo-icon">☄️</span>
        <span
          className="collapse-toggle"
          onClick={onToggleCollapse}
          title={collapsed ? "Развернуть" : "Свернуть"}
        >
          {collapsed ? "➡️" : "⬅️"}
        </span>
      </div>

      {!collapsed && (
        <div className="sidebar-header">
          <h2>Чаты</h2>
          <button className="theme-toggle" onClick={onToggleTheme}>
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
      )}

      <div className="sidebar-action" onClick={onCreateChat}>
        <span className="sidebar-action-icon">＋</span>
        {!collapsed && (
          <span className="sidebar-action-text">Новый чат</span>
        )}
      </div>

      {!collapsed && (
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
                    if (e.key === "Enter") saveTitle(chat.id);
                  }}
                  onBlur={() => saveTitle(chat.id)}
                />
              ) : (
                <span className="chat-title">{chat.name}</span>
              )}

              <div className="chat-actions">
                <span
                  className="chat-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingChatId(chat.id);
                    setEditingTitle(chat.name);
                  }}
                >
                  ✏️
                </span>

                <span
                  className="chat-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePinChat(chat.id);
                  }}
                >
                  {chat.pinned ? "📌" : "📍"}
                </span>

                <span
                  className="chat-action danger"
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
      )}
    </div>
  );
}
