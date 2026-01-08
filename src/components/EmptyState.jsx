import Input from "./Input";
import "../styles/emptyState.css";

export default function EmptyState({ onSend }) {
	return (
		<div className="empty-state">
			<h1 className="empty-title">Какая задача у нас сегодня?</h1>

			<div className="empty-input">
				<Input onSend={onSend} />
			</div>
		</div>
	);
}