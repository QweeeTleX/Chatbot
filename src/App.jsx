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
              text: "Привет, чем могу помочь?",
              sender: "bot",
              timestamp: Date.now(),
            },

          ],
        },
    ];
  });


  const [activeChatId, setActiveChatId] = useState(() => {
    return Number(localStorage.getItem("activeChatId")) || 1;
  });

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
        messages: [{ text: "Привет, чем могу помочь?", sender: "bot"}],
      };
      
      setActiveChatId(newId);


      return [...prevChats, newChat];
    });

  };
  

  const sendMessage = (text) => {
    setChats((prevChats) =>
      prevChats.map((chat) => 
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { 
                  id: crypto.randomUUID(),
                  text,
                  sender: "user",
                  timestamp: Date.now(),
                },
                { id: crypto.randomUUID(),
                  text: "Заглушка ответа хули",
                  sender: "bot",
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

  const sortedChats = [...chats].sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });


  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  return (
    <div className="app">
      <Sidebar
        chats={sortedChats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onCreateChat={createNewChat}
        onRenameChat={renameChat}
        onTogglePinChat={togglePinChat}
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
