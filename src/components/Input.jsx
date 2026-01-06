import { useState, useRef } from "react";
import "../styles/input.css";

export default function Input({ onSend }) {
  const [text, setText] = useState("");
  const [ imagePreview, setImagePreview ] = useState(null);

  const fileInputRef = useRef(null);

  const handlePickImage = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  }

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="input-box">
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="preview" />
          <button onClick={() => setImagePreview(null)}>✕</button>
        </div>
      )}
      
      <button className="attach-btn" onClick={handlePickImage}>
        📎
      </button>

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
      <button onClick={handleSend} className="send-btn">➤</button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          hidden
        />  

    </div>
  );
}
