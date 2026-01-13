import { useState, useRef } from "react";
import "../styles/input.css";

export default function Input({ onSend }) {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);

  const fileInputRef = useRef(null);

  const MAX_IMAGES = 10;

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const slots = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, slots);

    toAdd.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleSend = () => {
    if (!text.trim() && images.length === 0) return;

    let message;

    if (text.trim() && images.length === 1) {
      message = {
        type: "mixed",
        content: {
          text,
          image: images[0],
        },
      };
    } else if (text.trim() && images.length > 1) {
      message = {
        type: "mixed",
        content: {
          text,
          images,
        },
      };
    } else if (images.length === 1) {
      message = {
        type: "image",
        content: images[0],
      };
    } else if (images.length > 1) {
      message = {
        type: "images",
        content: images,
      };
    } else {
      message = {
        type: "text",
        content: text,
      };
    }

    onSend(message);

    setText("");
    setImages([]);
  };

  return (
    <div className="input-wrapper">

      {images.length > 0 && (
        <div className="input-preview">
          {images.map((img, index) => (
            <div className="image-preview" key={index}>
              <img src={img} alt={`preview-${index}`} />
              <button
                className="image-preview-close"
                onClick={() =>
                  setImages((prev) => prev.filter((_, i) => i !== index))
                }
              >
                ✕
              </button>
            </div>
          ))}
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
        multiple
        ref={fileInputRef}
        onChange={handleImageChange}
        hidden
      />
    </div>
  );
}
