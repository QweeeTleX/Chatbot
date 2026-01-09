import { useEffect, useState } from "react";
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
  createChat,
  renameChat,
  togglePinChat,
  deleteChat: deleteChatFromHook,
  addMessage,
  insertChatAt,
} = useChats();


  const [deletedChat, setDeletedChat] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  const [theme, setTheme] = useState (() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);

  }, [theme]);


  const activeChat = chats.find((c) => c.id === activeChatId);


  const sendMessage = (message) => {
    if (!activeChatId) return;


    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      type: message.type,
      content: message.content,
      timestamp: Date.now(),
    };

    addMessage(activeChatId, userMessage);

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

    addMessage(activeChatId, botMessage);
  };

  const deleteChat = (chatId) => {
    const index = chats.findIndex((chat) => chat.id === chatId);
    if (index === -1) return;

    const chatToDelete = chats[index];
    setDeletedChat({ chat: chatToDelete, index });

    if (undoTimer) clearTimeout(undoTimer);

    const timer = setTimeout(() => {
      setDeletedChat(null);
      setUndoTimer(null);
    }, 5000);

    setUndoTimer(timer);

    deleteChatFromHook(chatId);

    if (chatId === activeChatId) {
      const filtered = chats.filter((c) => c.id !== chatId);
      const nextChat = filtered[0];
      setActiveChatId(nextChat ? nextChat.id : null);
    }
  };

  const undoDeleteChat = () => {
    if (!deletedChat) return;

    const { chat, index } = deletedChat;
    insertChatAt(chat, index);

    setDeletedChat(null);

    if (undoTimer) {
      clearTimeout(undoTimer);
      setUndoTimer(null);
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
        onCreateChat={createChat}
        onRenameChat={renameChat}
        onTogglePinChat={togglePinChat}
        onDeleteChat={deleteChat}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === "dark" ? "light" : "dark"))
        }
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



/*function App() {
  return (
    <div className="app">
      <Sidebar />
      <Chat />
    </div>
  );
}

export default App;
*/
