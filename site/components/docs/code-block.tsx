"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CodeBlock({
  code,
  lang = "bash",
}: {
  code: string;
  lang?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative my-4 overflow-hidden rounded-lg border border-border bg-background/60">
      <div className="flex items-center justify-between border-b border-border bg-card/40 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{lang}</span>
        <Button size="sm" variant="ghost" onClick={copy} aria-label="Copy code">
          {copied ? (
            <>
              <Check className="size-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
