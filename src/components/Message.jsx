import "../styles/message.css";

export default function Message({ sender, type, content }) {
  return (
    <div className={`message ${sender} ${type}`}>

      {type === "text" && (
        <div className="message-text">{content}</div>
      )}


      {type === "image" && (
        <img
          src={content}
          alt="attachment"
          className="message-image"
        />
      )}


      {type === "images" && (
        <div className="message-images">
          {content.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`attachment-${index}`}
              className="message-image"
            />
          ))}
        </div>
      )}

      {type === "mixed" && (
        <>

          {content.image && (
            <img
              src={content.image}
              alt="attachment"
              className="message-image"
            />
          )}


          {content.images && (
            <div className="message-images">
              {content.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`attachment-${index}`}
                  className="message-image"
                />
              ))}
            </div>
          )}


          {content.text && (
            <div className="message-text">
              {content.text}
            </div>
          )}
        </>
      )}
    </div>
  );
}
