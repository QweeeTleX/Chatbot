import "../styles/message.css";

export default function Message({ type = "text", text, src, sender }) {
	if (type === "image") {
		return (
			<div className={`message ${sender}`}>
				<img src={src} alt="attachment" className="message-image" />
			</div>
		);
	}
	return <div className={`message ${sender}`}>{text}</div>;
}


