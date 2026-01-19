import Input from "./Input";
import "../styles/emptyState.css";

export default function EmptyState({ onSend, isStreaming, onStop }) {
  return (
    <div className="empty-state">
      <h1 className="empty-title">Начните первый диалог с ChatMock</h1>

      <div className="empty-input">
        <Input onSend={onSend} isStreaming={isStreaming} onStop={onStop} />
      </div>
    </div>
  );
}
