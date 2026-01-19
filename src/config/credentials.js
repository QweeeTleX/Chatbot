export const chatMockCredentials = {
  /**
   * Base URL of the ChatMock server without the /v1 suffix.
   * Example: "http://127.0.0.1:8000"
   */
  baseUrl: "http://127.0.0.1:8000",
  /**
   * Optional API key if you enabled bearer auth on the ChatMock side.
   * ChatMock ignores it by default but we still send it to keep parity with the OpenAI client.
   */
  apiKey: "replace-with-chatmock-api-key",
  /**
   * Basic auth credentials that will be sent with every request.
   * Leave placeholders and update locally – this file isolates the secrets from the rest of the UI.
   */
  login: "replace-with-login",
  password: "replace-with-password",
};

export const chatMockDefaults = {
  fallbackModel: "gpt-5",
};
