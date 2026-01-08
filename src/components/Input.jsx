import { useState, useRef } from "react";
import "../styles/input.css";

export default function Input({ onSend }) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    e.target.value = "";
  };

const handleSend = () => {
  if (!text.trim() && !imagePreview) return;

  let message;

  if (text.trim() && imagePreview) {
    message = {
      type: "mixed",
      content: {
        text,
        image: imagePreview,
      },
    };
  } else if (imagePreview) {
    message = {
      type: "image",
      content: imagePreview,
    };
  } else {
    message = {
      type: "text",
      content: text,
    };
  }

  onSend(message);

  setText("");
  setImagePreview(null);
};

return (
  <div className="input-wrapper">
    {imagePreview && (
      <div className="input-preview">
        <div className="image-preview">
          <img src={imagePreview} alt="preview" />
          <button
            className="image-preview-close"
            onClick={() => setImagePreview(null)}
          >
            ✕
          </button>
        </div>
      </div>
    )}

    <div className="input-row">
      <button className="attach-btn" onClick={handlePickImage}>
        📎
      </button>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Введите сообщение..."
        rows={1}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      <button onClick={handleSend} className="send-btn">
        ➤
      </button>
    </div>

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
