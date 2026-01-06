import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import "./styles/app.css";

function App() {
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");

    return saved
    ? JSON.parse(saved)
    : [
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
  });


  const [activeChatId, setActiveChatId] = useState(() => {
    return Number(localStorage.getItem("activeChatId")) || 1;
  });

  const [deletedChat, setDeletedChat] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  const [theme, setTheme] = useState (() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);

  }, [theme]);

  useEffect(() => {
    localStorage.setItem("activeChatId", activeChatId);
  }, [activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const createNewChat = () => {
    let newId = 1;

    setChats((prevChats) => {
      newId = 
        prevChats.length > 0
        ? prevChats[prevChats.length - 1].id + 1
        : 1;

      const newChat = {
        id: newId,
        name: `Чат ${newId}`,
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
      };
      
      setActiveChatId(newId);


      return [...prevChats, newChat];
    });

  };
  

  const sendMessage = (message) => {
    setChats((prevChats) =>
      prevChats.map((chat) => 
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,

                { 
                  id: crypto.randomUUID(),
                  sender: "user",
                  type: message.type,
                  content: message.content,
                  timestamp: Date.now(),
                },

                { id: crypto.randomUUID(),
                  sender: "bot",
                  type: "text",
                  content:
                    message.type === "image"
                    ? "Анализирую изображение и генерирую ответ..."
                    : "Заглушка ответа В)",
                timestamp: Date.now(),
               },

              ],
          }
        : chat
      )
    );
  };


  const renameChat = (chatId, newName) => {
    setChats((prevChats) => 
      prevChats.map((chat) =>
        chat.id === chatId
          ? {...chat, name: newName }
          : chat
        )
      );
  };

  const togglePinChat = (chatId) => {
    setChats((prevChats) => 
      prevChats.map((chat) =>
        chat.id === chatId
          ? {...chat, pinned: !chat.pinned }
          : chat
        )
      );
  };

  const deleteChat = (chatId) => {
    setChats((prevChats) => {
      const index = prevChats.findIndex((chat) => chat.id === chatId);
      if (index === -1) return prevChats;

      const chatToDelete = prevChats[index];


      /*
      const chatToDelete = prevChats.find((chat) => chat.id === chatId);
      if (!chatToDelete) return prevChats;

      const index = prevChats.findIndex((chat) => chat.id === chatId);
      const chatToDelete = prevChats[index];
      */

      setDeletedChat({ chat: chatToDelete, index });


      if (undoTimer) {
        clearTimeout(undoTimer);
      }

      const timer = setTimeout(() => {
        setDeletedChat(null);
        setUndoTimer(null);
      }, 5000);

      setUndoTimer(timer);

      const filtered = prevChats.filter((chat) => chat.id !== chatId);


      if (chatId === activeChatId) {
        const nextChat = filtered[0];
        setActiveChatId(nextChat ? nextChat.id : null);
      }

      return filtered;
    });
  };

  const undoDeleteChat = () => {
    if (!deletedChat) return;

    const { chat, index } = deletedChat;

    setChats((prevChats) => [
      ...prevChats.slice(0, index),
      chat,
      ...prevChats.slice(index),
    ]);

    setDeletedChat(null);

    if (undoTimer) {
      clearTimeout(undoTimer);
      setUndoTimer(null);
    

    /*
    setChats((prevChats) => [deletedChat, ...prevChats]);

    setDeletedChat(null);

    if (undoTimer) {
      clearTimeout(undoTimer);
      setUndoTimer(null);

      */
    }
  };

  const sortedChats = [...chats].sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });


  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  return (
    <div className={`app ${theme}`}>
      <Sidebar
        chats={sortedChats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onCreateChat={createNewChat}
        onRenameChat={renameChat}
        onTogglePinChat={togglePinChat}
        onDeleteChat={deleteChat}
        theme={theme}
        onToggleTheme={() =>
          setTheme((prev) => (prev === "dark" ? "light" : "dark"))
        }
        />
        
        <div className="chat-area">
        {activeChat && (
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
