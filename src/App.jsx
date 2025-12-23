import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import "./styles/app.css";

function App() {
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Чат 1",
      messages: [{ text: "Привет! Чем могу помочь?", sender: "bot"}],
    },
    {
      id: 2,
      name: "Чат 2",
      messages: [{ text: "Это второй чат", sender: "bot" }],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState(1);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const sendMessage = (text) => {
    setChats((prevChats) =>
      prevChats.map((chat) => 
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { text, sender: "user" },
                {text: "Заглушка ответа хули", sender: "bot" },
              ],
          }
        : chat
      )
    );
  };

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        />
        <Chat
          key={activeChatId}
          messages={activeChat.messages}
          onSend={sendMessage}
          />
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
