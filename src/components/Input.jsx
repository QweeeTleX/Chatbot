import { useState, useRef } from "react";
import "../styles/input.css";

export default function Input({ onSend, isStreaming = false, onStop }) {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);

  const fileInputRef = useRef(null);

  const MAX_IMAGES = 10;
  const canSend = Boolean(text.trim()) || images.length > 0;

  const handlePickImage = () => {
    if (isStreaming) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    if (isStreaming) return;

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

  const handlePrimaryAction = () => {
    if (isStreaming) {
      onStop?.();
      return;
    }
    handleSend();
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
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="input-row">
        <button
          className="attach-btn"
          onClick={handlePickImage}
          title="Прикрепить изображение"
          disabled={isStreaming}
        >
          <svg
            className="attach-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12 5v14M5 12h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <textarea
          value={text}
          disabled={isStreaming}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите сообщение..."
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <button
          onClick={handlePrimaryAction}
          className={`send-btn ${isStreaming ? "streaming" : ""}`}
          disabled={!isStreaming && !canSend}
          title={
            isStreaming
              ? "\u041E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u0442\u0440\u0438\u043C\u0438\u043D\u0433"
              : "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C"
          }
        >
          {isStreaming ? ("\u25A0") : (
            <svg
              className="send-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12 19V5M12 5l-5 5M12 5l5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
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
