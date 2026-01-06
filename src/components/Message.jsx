import "../styles/message.css";

export default function Message({ sender, type, content }) {
	return (
		<div className={`message ${sender}`}>
			{type === "text" && <span>{content}</span>}

			{type === "image" && (
				<img
					src={content}
					alt="sent"
					className="message-image"
					/>
			)}
		</div>
	);
}	

