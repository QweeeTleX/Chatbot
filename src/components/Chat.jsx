import { useRef, useEffect } from "react";
import Message from "./Message";
import Input from "./Input";
import "../styles/chat.css";

export default function Chat({ chatId, messages, onSend, isStreaming, onStop }) {
  const somethingRef = useRef(null);

  const scrollPositions = useRef({});

  const handleScroll = () => {
    const el = somethingRef.current;
    if (!el) return;

    const isAtBottom = 
      el.scrollHeight - el.scrollTop - el.clientHeight < 20;

    scrollPositions.current[chatId] = {
      scrollTop: el.scrollTop,
      isAtBottom,
    };  
  };

  useEffect (() => {
    const el = somethingRef.current;
    if (!el) return;


    const saved = scrollPositions.current[chatId];

    
    if (saved) {
      el.scrollTop = saved.scrollTop;
    } else {
      el.scrollTop = el.scrollHeight;
    }    
    


  }, [chatId]);


  useEffect(() => {
    const el = somethingRef.current;
    if (!el) return;
    const saved = scrollPositions.current[chatId];
    if (saved && saved.isAtBottom) {
      el.scrollTop = el.scrollHeight;
    } 

  }, [messages, chatId]);



  return (
    <div className="chat">
      <div onScroll={handleScroll} ref={somethingRef} className="messages">
        {messages.map((msg) => (
          <Message key={msg.id} {...msg} />
        ))}
        
      </div>
      <Input onSend={onSend} isStreaming={isStreaming} onStop={onStop} />
    </div>
  );
}
