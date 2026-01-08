import "../styles/message.css";


export default function Message({ sender, type, content }) {
  return (
    <div className={`message ${sender} ${type}`}>
      {type === "text" && (
        <div className="message-text">
          {content}
        </div>
      )}

      {type === "image" && (
        <img
          src={content}
          alt="attachment"
          className="message-image"
        />
      )}
    </div>
  );
}



