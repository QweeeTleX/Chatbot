import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import EmptyState from "./components/EmptyState";
import Footer from "./components/Footer";
import { DEFAULT_CHAT_NAME, useChats } from "./hooks/useChats";
import {
  fetchChatMockModels,
  requestChatTitle,
  streamChatMockCompletion,
} from "./services/chatMockClient";
import { chatMockDefaults } from "./config/credentials";
import "./styles/app.css";

function App() {
  const {
    chats,
    activeChatId,
    setActiveChatId,
    createChatWithMessages,
    renameChat,
    togglePinChat,
    deleteChat: deleteChatFromHook,
    addMessage,
    updateMessage,
    insertChatAt,
  } = useChats();

  const [deletedChat, setDeletedChat] = useState(null);
  const undoTimerRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState(null);
  const [selectedModel, setSelectedModel] = useState(
    chatMockDefaults.fallbackModel
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("general");

  const [streamState, setStreamState] = useState({
    status: "idle",
    controller: null,
  });

  const chatsRef = useRef(chats);
  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  useEffect(() => {
    const loadModels = async () => {
      try {
        const list = await fetchChatMockModels();
        setModels(list);
        setSelectedModel((prev) =>
          prev && list.includes(prev)
            ? prev
            : list[0] || chatMockDefaults.fallbackModel
        );
        setModelsError(null);
      } catch (err) {
        setModelsError(err.message || "Не удалось загрузить список моделей");
        setModels([chatMockDefaults.fallbackModel]);
        setSelectedModel(chatMockDefaults.fallbackModel);
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const isStreaming = streamState.status === "streaming";

  const stopStreaming = () => {
    if (streamState.controller) {
      streamState.controller.abort();
    }
    setStreamState({ status: "idle", controller: null });
  };

  const handleSelectChat = (chatId) => {
    if (isStreaming) stopStreaming();
    setActiveChatId(chatId);
  };

  const ensureChatTitle = async (chatId, history, opts = {}) => {
    const retries = opts.retries ?? 3;
    const delay = opts.delay ?? 60;
    const timeoutMs = opts.timeoutMs ?? 8000;

    let chat = chatsRef.current.find((c) => c.id === chatId);
    for (let i = 0; i < retries && !chat; i++) {
      await wait(delay);
      chat = chatsRef.current.find((c) => c.id === chatId);
    }

    if (chat && chat.name && chat.name !== DEFAULT_CHAT_NAME) return;

    try {
      const generatedTitle = await requestChatTitle({
        model: "gpt-5",
        history,
        timeoutMs,
      });
      if (generatedTitle) renameChat(chatId, generatedTitle);
    } catch (err) {
      console.warn("Не удалось получить название чата из ChatMock", err);
    }
  };

  const sendMessage = async (message) => {
    if (!message) return;
    if (isStreaming) return;

    const userMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      type: message.type,
      content: message.content,
      timestamp: Date.now(),
    };

    let targetChatId = activeChatId;
    let historyForApi = [];
    let prevCount = 0;

    if (!targetChatId) {
      targetChatId = createChatWithMessages([userMessage]);
      historyForApi = [userMessage];
      prevCount = 0;
    } else {
      const existingChat =
        chatsRef.current.find((c) => c.id === targetChatId) || null;
      const prevMessages = existingChat?.messages || [];
      prevCount = prevMessages.length;
      historyForApi = [...prevMessages, userMessage];
      addMessage(targetChatId, userMessage);
    }

    if (prevCount === 0) {
      try {
        await ensureChatTitle(targetChatId, [userMessage], { timeoutMs: 8000 });
      } catch (err) {
        console.warn("Не удалось сгенерировать название перед ответом", err);
      }
      await wait(2000);
    }

    const botMessageId = crypto.randomUUID();
    let botContent = "";
    addMessage(targetChatId, {
      id: botMessageId,
      sender: "bot",
      type: "text",
      content: "",
      timestamp: Date.now(),
      pending: true,
    });

    const controller = new AbortController();
    const hardTimeout = setTimeout(() => {
      if (!controller.signal.aborted) controller.abort("timeout");
    }, 50000);
    setStreamState({ status: "streaming", controller });

    try {
      const fullText = await streamChatMockCompletion({
        model: selectedModel,
        history: historyForApi,
        signal: controller.signal,
        timeoutMs: 45000,
        onToken: (event) => {
          updateMessage(targetChatId, botMessageId, (prev) => {
            if (typeof event === "string") {
              botContent = `${botContent}${event}`;
              return { content: `${prev.content || ""}${event}` };
            }

            if (event?.type === "set") {
              botContent = event.text || "";
              return { content: event.text || "" };
            }

            if (event?.type === "append") {
              botContent = `${botContent}${event.text || ""}`;
              return { content: `${prev.content || ""}${event.text || ""}` };
            }

            return prev;
          });
        },
      });

      botContent = fullText || botContent;

      updateMessage(targetChatId, botMessageId, (prev) => ({
        content: fullText || prev.content,
        pending: false,
      }));
    } catch (err) {
      if (controller.signal.aborted) {
        updateMessage(targetChatId, botMessageId, (prev) => ({
          content: prev.content || "",
          pending: false,
          interrupted: true,
        }));
      } else {
        updateMessage(targetChatId, botMessageId, {
          content: `Ошибка ответа: ${err.message}`,
          pending: false,
          error: true,
        });
      }
    } finally {
      const titleHistory = [
        ...historyForApi,
        { sender: "bot", type: "text", content: botContent },
      ];
      try {
        await ensureChatTitle(targetChatId, titleHistory, { timeoutMs: 8000 });
      } catch (err) {
        console.warn("Не удалось присвоить название чату", err);
      }
      clearTimeout(hardTimeout);
      setStreamState({ status: "idle", controller: null });
    }
  };

  const handleNewChat = () => {
    if (isStreaming) stopStreaming();
    setActiveChatId(null);
  };

  const closeSettings = () => setSettingsOpen(false);

  const deleteChat = (chatId) => {
    if (isStreaming && chatId === activeChatId) {
      stopStreaming();
    }

    const index = chats.findIndex((chat) => chat.id === chatId);
    if (index === -1) return;

    const chatToDelete = chats[index];
    setDeletedChat({ chat: chatToDelete, index });

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    undoTimerRef.current = setTimeout(() => {
      setDeletedChat(null);
      undoTimerRef.current = null;
    }, 5000);

    deleteChatFromHook(chatId);
  };

  const undoDeleteChat = () => {
    if (!deletedChat) return;

    const { chat, index } = deletedChat;
    insertChatAt(chat, index);

    setActiveChatId(chat.id);

    setDeletedChat(null);

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  };

  const sortedChats = [...chats].sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });

  return (
    <div className={`app ${theme} ${settingsOpen ? "settings-open" : ""}`}>
      <div className="classic-layout">
        <Sidebar
          chats={sortedChats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onCreateChat={handleNewChat}
          onRenameChat={renameChat}
          onTogglePinChat={togglePinChat}
          onDeleteChat={deleteChat}
          theme={theme}
          onToggleTheme={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((v) => !v)}
        />

        <div className="chat-area">
          <div className="chat-shell">
            <div className="chat-controls">
              <div className="model-select">
                <span className="control-label">Модель</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={modelsLoading}
                >
                  {models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <button
                  className="settings-btn"
                  onClick={() => setSettingsOpen(true)}
                  title="Настройки"
                  type="button"
                >
                  <span className="settings-gear" aria-hidden>
                    ⚙
                  </span>
                </button>
                {modelsLoading && (
                  <span className="control-note">Загружаем список…</span>
                )}
                {modelsError && (
                  <span className="control-error">{modelsError}</span>
                )}
              </div>

              <div className="control-actions">
                {isStreaming ? (
                  <button className="stop-btn" onClick={stopStreaming}>
                    Остановить поток
                  </button>
                ) : (
                  <span className="control-note">Готов отвечать</span>
                )}
              </div>
            </div>

            {!activeChat || activeChat.messages.length === 0 ? (
              <EmptyState
                onSend={sendMessage}
                isStreaming={isStreaming}
                onStop={stopStreaming}
              />
            ) : (
              <Chat
                chatId={activeChatId}
                messages={activeChat.messages}
                onSend={sendMessage}
                isStreaming={isStreaming}
                onStop={stopStreaming}
              />
            )}
          </div>
        </div>
      </div>

      {deletedChat && (
        <div className="undo-toast">
          <span>Чат удален</span>
          <button onClick={undoDeleteChat}>Отменить</button>
        </div>
      )}

      <Footer />

      {settingsOpen && (
        <div className="settings-overlay" onClick={closeSettings}>
          <div
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-side">
              <button className="settings-close" onClick={closeSettings} type="button">
                ✕
              </button>
              <div className="settings-nav">
                <button
                  className={`settings-item ${settingsTab === "account" ? "active" : ""}`}
                  onClick={() => setSettingsTab("account")}
                  type="button"
                >
                  Учетная запись
                </button>
                <button
                  className={`settings-item ${settingsTab === "general" ? "active" : ""}`}
                  onClick={() => setSettingsTab("general")}
                  type="button"
                >
                  Общее
                </button>
                <button
                  className={`settings-item ${settingsTab === "notifications" ? "active" : ""}`}
                  onClick={() => setSettingsTab("notifications")}
                  type="button"
                >
                  Уведомления
                </button>
              </div>
            </div>
            <div className="settings-content">
              {settingsTab === "general" && (
                <>
                  <h3>Общее</h3>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label">Тема</div>
                      <div className="settings-muted">Переключить светлую/темную</div>
                    </div>
                    <button
                      className="theme-icon-btn"
                      onClick={() =>
                        setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                      }
                      type="button"
                      title="Сменить тему"
                    >
                      {theme === "dark" ? "🌙" : "☀️"}
                    </button>
                  </div>
                </>
              )}

              {settingsTab === "account" && (
                <>
                  <h3>Учетная запись</h3>
                  <div className="settings-placeholder">
                    Раздел будет доступен позже.
                  </div>
                </>
              )}

              {settingsTab === "notifications" && (
                <>
                  <h3>Уведомления</h3>
                  <div className="settings-placeholder">
                    Настройки уведомлений появятся позже.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
