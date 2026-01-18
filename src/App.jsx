import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import EmptyState from "./components/EmptyState";
import { useChats } from "./hooks/useChats";
import Footer from "./components/Footer";
import "./styles/app.css";

function App() {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    createChatWithMessages,
    renameChat,
    togglePinChat,
    deleteChat: deleteChatFromHook,
    addMessage,
    insertChatAt,
  } = useChats();

  const [deletedChat, setDeletedChat] = useState(null);
  const undoTimerRef = useRef(null);
 
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const sendMessage = (message) => {
    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      type: message.type,
      content: message.content,
      timestamp: Date.now(),
    };

    const botMessage = {
      id: crypto.randomUUID(),
      sender: "bot",
      type: "text",
      content:
        message.type === "image"
          ? "Анализирую изображение и генерирую ответ..."
          : "Заглушка ответа В)",
      timestamp: Date.now(),    
    };


    if (!activeChatId) {
      createChatWithMessages([userMessage, botMessage]);
      return;
    }

    addMessage(activeChatId, userMessage);
    addMessage(activeChatId, botMessage);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  const deleteChat = (chatId) => {
    const index = chats.findIndex((chat) => chat.id === chatId);
    if (index === -1) return;

    const chatToDelete = chats[index];
    setDeletedChat({ chat: chatToDelete, index });

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    undoTimerRef.current = setTimeout(() => {
      setDeletedChat(null);
      undoTimerRef.current = null;
    }, 5000);

    deleteChatFromHook(chatId);
  };

  const undoDeleteChat = () => {
    if (!deletedChat) return;

    const { chat, index } = deletedChat;
    insertChatAt(chat, index);

   
    setActiveChatId(chat.id);

    setDeletedChat(null);

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  const sortedChats = [...chats].sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });

  return (
    <div className={`app ${theme}`}>
      <Sidebar
        chats={sortedChats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onCreateChat={handleNewChat}
        onRenameChat={renameChat}
        onTogglePinChat={togglePinChat}
        onDeleteChat={deleteChat}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === "dark" ? "light" : "dark"))
        }
        collapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
      />

      <div className="chat-area">
        {!activeChat || activeChat.messages.length === 0 ? (
          <EmptyState onSend={sendMessage} />
        ) : (
          <Chat
            chatId={activeChatId}
            messages={activeChat.messages}
            onSend={sendMessage}
          />
        )}
      </div>

      {deletedChat && (
        <div className="undo-toast">
          <span>Чат удалён</span>
          <button onClick={undoDeleteChat}>Отменить</button>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default App;
