const escapeHtml = (str = "") =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export function renderMarkdown(text = "") {
  if (!text) return "";
  let out = escapeHtml(text);

  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  // Simple lists
  out = out.replace(/^\s*[-*]\s+(.*)$/gim, "<li>$1</li>");
  out = out.replace(/(<li>.*<\/li>)/gis, "<ul>$1</ul>");

  // Paragraph breaks
  out = out.replace(/\n{2,}/g, "</p><p>");
  out = `<p>${out}</p>`;
  out = out.replace(/<p>\s*<\/p>/g, "");

  return out;
}
