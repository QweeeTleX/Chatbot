import {  useRef, useEffect } from "react";
import Message from "./Message";
import Input from "./Input";
import "../styles/chat.css";

export default function Chat({ messages, onSend }) {
  const somethingRef = useRef(null);

  useEffect(() => {
    if (somethingRef.current) {
      somethingRef.current.scrollIntoView({behavior: "smooth"});
    }
  },  [messages]);



  return (
    <div className="chat">
      <div className="messages">
        {messages.map((msg, i) => (
          <Message key={i} {...msg} />
        ))}
        <div ref={somethingRef}></div>
      </div>
      <Input onSend={onSend} />
    </div>
  );
}
