# Chatbot + ChatMock

UI now streams replies from a running ChatMock instance. Chat titles are generated through ChatMock as well, and the reply model is chosen on the client.

## Quick start

1) Install deps:
```bash
npm install
```
2) Configure ChatMock access in `src/config/credentials.js` – fill `baseUrl`, `apiKey` (optional), `login`, and `password`.
3) Log in to ChatMock and start the server (runs at `http://127.0.0.1:8000` by default):
```bash
cd ../ChatMock
python chatmock.py login
python chatmock.py serve
```
4) Run the UI:
```bash
npm run dev
```

## Usage notes
- Messages stream token-by-token from ChatMock; use the stop button to abort a response.
- Chat names are requested from ChatMock after the first assistant reply if the chat still has the default name.
- The model dropdown in the top bar lists `/v1/models` from ChatMock; the selected value is used for both replies and title generation.
