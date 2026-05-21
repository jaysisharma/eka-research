/**
 * Minimal zero-dependency Markdown → HTML renderer.
 * Handles: h1-h3, bold, italic, inline code, code blocks,
 *          blockquotes, ul, ol, hr, links, paragraphs.
 */
export function renderMarkdown(md: string): string {
  if (!md?.trim()) return "";

  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inline = (s: string) =>
    esc(s)
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/<u>(.+?)<\/u>/g, "<u>$1</u>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      );

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    const hm = line.match(/^(#{1,3})\s+(.*)/);
    if (hm) {
      const lvl = hm[1].length;
      out.push(`<h${lvl}>${inline(hm[2])}</h${lvl}>`);
      i++; continue;
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      out.push("<hr />");
      i++; continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const bqLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        bqLines.push(lines[i].slice(2));
        i++;
      }
      out.push(`<blockquote>${inline(bqLines.join(" "))}</blockquote>`);
      continue;
    }

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(esc(lines[i]));
        i++;
      }
      i++;
      const langAttr = lang ? ` data-lang="${esc(lang)}"` : "";
      out.push(`<pre${langAttr}><code>${codeLines.join("\n")}</code></pre>`);
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].slice(2))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\d+\.\s/, ""))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++; continue;
    }

    // Paragraph
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith(">") &&
      !lines[i].startsWith("```") &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(pLines.join(" "))}</p>`);
  }

  return out.join("\n");
}
