import { useState, useRef, useEffect } from "react";
import Message from "./Message";
import Input from "./Input";
import "../styles/chat.css";

export default function Chat() {
  const [messages, setMessages] = useState([
    { text: "Привет! Чем могу помочь?", sender: "bot" },
  ]);


  const somethingRef = useRef(null);

  useEffect(() => {
    if (somethingRef.current) {
      somethingRef.current.scrollIntoView({behavior: "smooth"});
    }
  },  [messages]);

  const sendMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      { text, sender: "user" },
      { text: "Это заглушка ответа 🤖", sender: "bot" },
    ]);
  };

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((msg, i) => (
          <Message key={i} {...msg} />
        ))}
        <div ref={somethingRef}></div>
      </div>
      <Input onSend={sendMessage} />
    </div>
  );
}
