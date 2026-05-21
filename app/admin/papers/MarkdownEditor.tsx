"use client";

import { useRef, useState, useCallback } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus,
  Link as LinkIcon, Eye, EyeOff, AlignLeft,
} from "lucide-react";
import styles from "./editor.module.css";

/* ── Tiny markdown renderer (no deps) ──────────────────────────────────
   Handles: h1-h3, bold, italic, code, blockquote, ul, ol,
            hr, links, paragraphs. Good enough for paper content.
──────────────────────────────────────────────────────────────────────── */
function renderMarkdown(md: string): string {
  if (!md) return "";

  const lines = md.split("\n");
  const out: string[] = [];
  let i = 0;

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const inlineHtml = (s: string) =>
    esc(s)
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g,     "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g,         "<em>$1</em>")
      .replace(/_(.+?)_/g,           "<em>$1</em>")
      .replace(/`(.+?)`/g,           "<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    const hm = line.match(/^(#{1,3})\s+(.*)/);
    if (hm) {
      const lvl = hm[1].length;
      out.push(`<h${lvl}>${inlineHtml(hm[2])}</h${lvl}>`);
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
      out.push(`<blockquote>${inlineHtml(bqLines.join(" "))}</blockquote>`);
      continue;
    }

    // Fenced code block
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(esc(lines[i]));
        i++;
      }
      i++;
      out.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(`<li>${inlineHtml(lines[i].slice(2))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inlineHtml(lines[i].replace(/^\d+\.\s/, ""))}</li>`);
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
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" &&
           !lines[i].startsWith("#") && !lines[i].startsWith(">") &&
           !lines[i].startsWith("```") && !/^[-*]\s/.test(lines[i]) &&
           !/^\d+\.\s/.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
      paraLines.push(lines[i]);
      i++;
    }
    out.push(`<p>${inlineHtml(paraLines.join(" "))}</p>`);
  }

  return out.join("\n");
}

/* ── Toolbar action helpers ─────────────────────────────────────────── */

function wrap(
  ta: HTMLTextAreaElement,
  prefix: string,
  suffix = prefix,
  defaultText = "text",
): string {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const selected = value.slice(s, e) || defaultText;
  const before = value.slice(0, s);
  const after  = value.slice(e);
  const newVal = `${before}${prefix}${selected}${suffix}${after}`;
  const newCursor = s + prefix.length + selected.length + suffix.length;
  setTimeout(() => {
    ta.focus();
    ta.setSelectionRange(newCursor, newCursor);
  }, 0);
  return newVal;
}

function wrapLine(
  ta: HTMLTextAreaElement,
  prefix: string,
  defaultText = "Text here",
): string {
  const { selectionStart: s, value } = ta;
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const lineEnd   = value.indexOf("\n", s);
  const end       = lineEnd === -1 ? value.length : lineEnd;
  const line      = value.slice(lineStart, end);
  const newLine   = line.startsWith(prefix) ? line.slice(prefix.length) : `${prefix}${line || defaultText}`;
  return value.slice(0, lineStart) + newLine + value.slice(end);
}

/* ── Toolbar button ─────────────────────────────────────────────────── */

interface TBtnProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

function TBtn({ label, icon, onClick, active }: TBtnProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`${styles.toolBtn} ${active ? styles.toolBtnActive : ""}`}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder }: Props) {
  const [preview, setPreview] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const act = useCallback((fn: (ta: HTMLTextAreaElement) => string) => {
    const ta = taRef.current;
    if (!ta) return;
    onChange(fn(ta));
  }, [onChange]);

  /* Toolbar actions */
  const bold        = () => act((ta) => wrap(ta, "**", "**", "bold text"));
  const italic      = () => act((ta) => wrap(ta, "*", "*", "italic text"));
  const underline   = () => act((ta) => wrap(ta, "<u>", "</u>", "underlined"));
  const h1          = () => act((ta) => wrapLine(ta, "# "));
  const h2          = () => act((ta) => wrapLine(ta, "## "));
  const h3          = () => act((ta) => wrapLine(ta, "### "));
  const ul          = () => act((ta) => wrapLine(ta, "- "));
  const ol          = () => act((ta) => wrapLine(ta, "1. "));
  const blockquote  = () => act((ta) => wrapLine(ta, "> "));
  const codeInline  = () => act((ta) => wrap(ta, "`", "`", "code"));
  const codeBlock   = () => act((ta) => wrap(ta, "\n```\n", "\n```\n", "code here"));
  const hr          = () => act((ta) => {
    const v = ta.value;
    const s = ta.selectionStart;
    return v.slice(0, s) + "\n\n---\n\n" + v.slice(s);
  });
  const link = () => {
    const url = prompt("Enter URL:");
    if (!url) return;
    act((ta) => {
      const { selectionStart: s, selectionEnd: e, value: v } = ta;
      const label = v.slice(s, e) || "link text";
      return v.slice(0, s) + `[${label}](${url})` + v.slice(e);
    });
  };

  /* Word/char stats */
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const chars  = value.length;

  return (
    <div className={styles.editor}>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <TBtn label="Bold (Ctrl+B)"       icon={<Bold size={14} />}          onClick={bold} />
          <TBtn label="Italic (Ctrl+I)"     icon={<Italic size={14} />}        onClick={italic} />
          <TBtn label="Underline"           icon={<UnderlineIcon size={14} />}  onClick={underline} />
        </div>
        <div className={styles.toolDivider} />
        <div className={styles.toolGroup}>
          <TBtn label="Heading 1"  icon={<Heading1 size={14} />} onClick={h1} />
          <TBtn label="Heading 2"  icon={<Heading2 size={14} />} onClick={h2} />
          <TBtn label="Heading 3"  icon={<Heading3 size={14} />} onClick={h3} />
        </div>
        <div className={styles.toolDivider} />
        <div className={styles.toolGroup}>
          <TBtn label="Bullet list"   icon={<List size={14} />}        onClick={ul} />
          <TBtn label="Numbered list" icon={<ListOrdered size={14} />} onClick={ol} />
        </div>
        <div className={styles.toolDivider} />
        <div className={styles.toolGroup}>
          <TBtn label="Blockquote"   icon={<Quote size={14} />} onClick={blockquote} />
          <TBtn label="Inline code"  icon={<Code size={14} />}  onClick={codeInline} />
          <TBtn label="Code block"   icon={<AlignLeft size={14} />} onClick={codeBlock} />
          <TBtn label="Link"         icon={<LinkIcon size={14} />}  onClick={link} />
          <TBtn label="Divider (HR)" icon={<Minus size={14} />}    onClick={hr} />
        </div>
        <div className={styles.toolSpacer} />
        {/* Preview toggle */}
        <button
          type="button"
          className={`${styles.previewBtn} ${preview ? styles.previewBtnActive : ""}`}
          onClick={() => setPreview((p) => !p)}
        >
          {preview ? <><EyeOff size={13} /> Edit</> : <><Eye size={13} /> Preview</>}
        </button>
      </div>

      {/* ── Writing area ── */}
      {preview ? (
        <div
          className={styles.preview}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) || "<p class='placeholder'>Nothing to preview yet.</p>" }}
        />
      ) : (
        <textarea
          ref={taRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Write the full paper here…\n\n# Introduction\n\n## Methodology\n\n## Results\n\n## Discussion\n\n## Conclusion"}
          spellCheck
          onKeyDown={(e) => {
            /* Tab inserts 2 spaces instead of focusing next element */
            if (e.key === "Tab") {
              e.preventDefault();
              act((ta) => {
                const { selectionStart: s, value: v } = ta;
                return v.slice(0, s) + "  " + v.slice(s);
              });
            }
            /* Ctrl/Cmd+B = bold, Ctrl/Cmd+I = italic */
            if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); bold(); }
            if ((e.ctrlKey || e.metaKey) && e.key === "i") { e.preventDefault(); italic(); }
          }}
        />
      )}

      {/* ── Status bar ── */}
      <div className={styles.statusBar}>
        <span className={styles.statusItem}>{words} words</span>
        <span className={styles.statusDot}>·</span>
        <span className={styles.statusItem}>{chars} chars</span>
        <span className={styles.statusDot}>·</span>
        <span className={styles.statusItem}>Markdown</span>
        {value && (
          <>
            <span className={styles.statusDot}>·</span>
            <span className={styles.statusSaved}>auto-saved on publish</span>
          </>
        )}
      </div>
    </div>
  );
}
