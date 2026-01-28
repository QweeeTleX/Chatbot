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

  const codeBlocks = [];
  const stashCodeBlock = (lang = "", code = "") => {
    const index = codeBlocks.length;
    const language = lang ? ` class="language-${lang}"` : "";
    codeBlocks.push(`<pre><code${language}>${code}</code></pre>`);
    return `{{CODE_BLOCK_${index}}}`;
  };

  out = out.replace(/```([\w-]+)?[ \t]*\r?\n?([\s\S]*?)```/g, (_, lang = "", code = "") =>
    stashCodeBlock(lang, code)
  );

  out = out.replace(/(?:^|\n)((?:[ \t]{4,}.*(?:\r?\n|$))+)/g, (match, block) => {
    const code = block
      .replace(/^\n/, "")
      .split(/\r?\n/)
      .map((line) => line.replace(/^[ \t]{4}/, ""))
      .join("\n")
      .replace(/\n$/, "");
    return `\n${stashCodeBlock("", code)}`;
  });

  out = out.replace(/`([^`\n]+)`/g, "<code>$1</code>");
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
  out = out.replace(/{{CODE_BLOCK_(\d+)}}/g, (_, i) => codeBlocks[Number(i)] || "");
  out = out.replace(/<p>\s*(<pre>[\s\S]*?<\/pre>)\s*<\/p>/g, "$1");

  return out;
}
