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
  collapsed,
  onToggleCollapse,
}) {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const getChatTimestamp = (chat) =>
    chat.createdAt ||
    (chat.messages && chat.messages.length ? chat.messages[0]?.timestamp : 0) ||
    Date.now();

  const getDayKey = (ts) => {
    const date = new Date(ts);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  };

  const formatDayLabel = (ts) => {
    const date = new Date(ts);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const dayKey = getDayKey(ts);
    if (dayKey === today.getTime()) return "Сегодня";
    if (dayKey === yesterday.getTime()) return "Вчера";

    const withYear = date.getFullYear() !== today.getFullYear();
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      ...(withYear ? { year: "numeric" } : {}),
    }).format(date);
  };

  const chatItems = [];
  let lastDayKey = null;
  chats.forEach((chat) => {
    const ts = getChatTimestamp(chat);
    const dayKey = getDayKey(ts);
    if (dayKey !== lastDayKey) {
      chatItems.push({ type: "label", key: `label-${dayKey}`, text: formatDayLabel(ts) });
      lastDayKey = dayKey;
    }
    chatItems.push({ type: "chat", key: chat.id, chat });
  });

  const saveTitle = (chatId) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) return;

    onRenameChat(chatId, trimmed);
    setEditingChatId(null);
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-logo">
        <span className="logo-icon" onClick={() => onSelectChat(null)} title="Перейти на главный экран">☄️</span>
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
          {chatItems.map((item) => {
            if (item.type === "label") {
              return (
                <li key={item.key} className="chat-date">
                  {item.text}
                </li>
              );
            }

            const chat = item.chat;
            return (
              <li
                key={item.key}
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
            );
          })}</ul>
      )}
    </div>
  );
}



