"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";

const SAMPLE_MARKDOWN = `# Hello, Markdown!

This is a **live preview** tool for Markdown content.

## Features

- Real-time rendering with 300ms debounce
- Syntax highlighting support
- Clean, responsive layout

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("World"));
\`\`\`

> "The best way to predict the future is to invent it."
> — Alan Kay

Visit [GitHub](https://github.com) for more information.
`;

export default function MarkdownPreviewTool() {
  const [input, setInput] = useState(SAMPLE_MARKDOWN);
  const [html, setHtml] = useState("");
  const [rawHtml, setRawHtml] = useState("");
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Import marked dynamically since it might not be installed yet
    const render = async () => {
      try {
        const { marked } = await import("marked");
        const result = marked.parse(input) as string;
        setHtml(result);
        setRawHtml(result);
      } catch {
        // If marked isn't available yet
        setHtml(`<p class="text-destructive">Marked library not available. Run: npm install marked</p>`);
        setRawHtml("");
      }
    };

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(render, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!rawHtml) return;
    try {
      await navigator.clipboard.writeText(rawHtml);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = rawHtml;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [rawHtml]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Markdown Preview</h1>
        <p className="text-muted-foreground mt-1">
          Write Markdown on the left, see the rendered HTML on the right — live.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input pane */}
        <div>
          <label className="block text-sm font-medium mb-2">Markdown Input</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Markdown..."
            className="min-h-[400px] font-mono text-sm resize-y"
          />
        </div>

        {/* Preview pane */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Preview</label>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleCopy}
              className="gap-1"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy HTML"}
            </Button>
          </div>
          <div className="min-h-[400px] rounded-lg border p-4 overflow-auto bg-card prose prose-sm dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </div>
      </div>

      {/* Raw HTML output */}
      {rawHtml && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Raw HTML Output</label>
          </div>
          <div className="rounded-lg border p-4 bg-muted/30">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all max-h-[300px] overflow-auto">
              {rawHtml}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
