import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/docs/code-block";

/**
 * Minimal markdown renderer for the journal's first-party posts. Covers the
 * subset the posts use: headings, paragraphs, fenced code blocks, GFM tables,
 * unordered/ordered lists, and inline `code`, **bold**, *em*, [links]. Raw
 * HTML in the source is rendered as literal text - posts are trusted, but
 * there is no reason to inject it.
 */

const INLINE_RE =
  /(`[^`\n]+`)|(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(\[[^\]\n]+\]\([^)\s]+\))/;

const LINK_CLASS =
  "text-foreground underline decoration-muted-foreground/50 underline-offset-4 transition-colors hover:decoration-foreground";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let i = 0;
  while (rest.length > 0) {
    const m = INLINE_RE.exec(rest);
    if (!m) {
      nodes.push(rest.replace(/\\\|/g, "|"));
      break;
    }
    if (m.index > 0) nodes.push(rest.slice(0, m.index).replace(/\\\|/g, "|"));
    const tok = m[0];
    const key = `${keyPrefix}-${i}`;
    if (tok.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded border border-border bg-card/60 px-1.5 py-0.5 font-mono text-[0.82em] text-foreground"
        >
          {tok.slice(1, -1).replace(/\\\|/g, "|")}
        </code>,
      );
    } else if (tok.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {renderInline(tok.slice(2, -2), `${key}b`)}
        </strong>,
      );
    } else if (tok.startsWith("*")) {
      nodes.push(<em key={key}>{renderInline(tok.slice(1, -1), `${key}e`)}</em>);
    } else {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      if (link) {
        const [, label, href] = link;
        nodes.push(
          href.startsWith("/") ? (
            <Link key={key} href={href} className={LINK_CLASS}>
              {label}
            </Link>
          ) : (
            <a key={key} href={href} className={LINK_CLASS} target="_blank" rel="noreferrer">
              {label}
            </a>
          ),
        );
      } else {
        nodes.push(tok);
      }
    }
    rest = rest.slice(m.index + tok.length);
    i++;
  }
  return nodes;
}

const TABLE_LINE = /^\s*\|.*\|\s*$/;
const TABLE_SEP = /^\s*\|[\s:|-]+\|\s*$/;
const HEADING = /^(#{1,4})\s+(.*)$/;
const UL_ITEM = /^\s*[-*]\s+/;
const OL_ITEM = /^\s*\d+\.\s+/;

function isTableStart(lines: string[], i: number): boolean {
  return (
    i + 1 < lines.length &&
    TABLE_LINE.test(lines[i]) &&
    TABLE_SEP.test(lines[i + 1]) &&
    lines[i + 1].includes("-")
  );
}

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split(/(?<!\\)\|/).map((cell) => cell.trim());
}

const HEADING_CLASS = {
  h2: "font-display pt-8 text-3xl text-foreground sm:text-4xl",
  h3: "pt-6 text-xl font-semibold tracking-tight text-foreground",
  h4: "pt-4 text-base font-semibold text-foreground",
} as const;

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++; // closing fence
      blocks.push(
        <div key={key++} className="py-2">
          <CodeBlock lang={lang || "text"} code={code.join("\n")} />
        </div>,
      );
      continue;
    }

    const h = HEADING.exec(line);
    if (h) {
      // The page title owns h1; `##`/`###`/`####` map to h2/h3/h4.
      const level = Math.min(Math.max(h[1].length, 2), 4) as 2 | 3 | 4;
      const Tag = `h${level}` as "h2" | "h3" | "h4";
      blocks.push(
        <Tag key={key++} className={HEADING_CLASS[Tag]}>
          {renderInline(h[2], `h${key}`)}
        </Tag>,
      );
      i++;
      continue;
    }

    if (isTableStart(lines, i)) {
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && TABLE_LINE.test(lines[i])) rows.push(splitRow(lines[i++]));
      blocks.push(
        <div key={key++} className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {header.map((cell, j) => (
                  <th
                    key={j}
                    className="border-b border-border bg-card/40 px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground"
                  >
                    {renderInline(cell, `th${key}-${j}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="border-b border-border/50 px-3 py-2 align-top leading-6 text-muted-foreground last:border-b-0 [&:last-child]:border-b-0"
                    >
                      {renderInline(cell, `td${key}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (UL_ITEM.test(line) || OL_ITEM.test(line)) {
      const ordered = OL_ITEM.test(line);
      const items: string[] = [];
      while (
        i < lines.length &&
        (ordered ? OL_ITEM.test(lines[i]) : UL_ITEM.test(lines[i]))
      ) {
        items.push(lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ""));
        i++;
      }
      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={key++}
          className={`${ordered ? "list-decimal" : "list-disc"} space-y-2 pl-6 text-base leading-8 text-muted-foreground marker:text-muted-foreground/60`}
        >
          {items.map((item, j) => (
            <li key={j}>{renderInline(item, `li${key}-${j}`)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("```") &&
      !HEADING.test(lines[i]) &&
      !isTableStart(lines, i) &&
      !UL_ITEM.test(lines[i]) &&
      !OL_ITEM.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    if (para.length > 0) {
      blocks.push(
        <p key={key++} className="text-base leading-8 text-muted-foreground">
          {renderInline(para.join(" "), `p${key}`)}
        </p>,
      );
    }
  }

  return <div className="space-y-6">{blocks}</div>;
}
