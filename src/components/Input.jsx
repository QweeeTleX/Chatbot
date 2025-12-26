import { useState } from "react";
import "../styles/input.css";

export default function Input({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="input-box">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите сообщение..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }
         
        }
      />
      <button onClick={handleSend}>Отправить</button>
    </div>
  );
}
