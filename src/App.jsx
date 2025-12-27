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
          messages: [
            { text: "Привет, чем могу помочь?", sender: "bot"},

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
        messages: [{ text: "Привет, чем могу помочь?", sender: "bot"}],
      };
      
      return [...prevChats, newChat];
    });

    setActiveChatId(newId);
  };
  

  const sendMessage = (text) => {
    setChats((prevChats) =>
      prevChats.map((chat) => 
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { text, sender: "user" },
                { text: "Заглушка ответа хули", sender: "bot" },
              ],
          }
        : chat
      )
    );
  };

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onCreateChat={createNewChat}
        />

        {activeChat && (
        <Chat
          chatId={activeChatId}
          messages={activeChat.messages}
          onSend={sendMessage}
          />
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
