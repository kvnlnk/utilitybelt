"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from "lucide-react";
import { textToAscii } from "@/lib/tools";

const FONT_OPTIONS = [
  { value: "block", label: "Block (5x7)" },
  { value: "simple", label: "Simple" },
] as const;

export default function AsciiArtTool() {
  const [input, setInput] = useState("");
  const [font, setFont] = useState<string>("block");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = textToAscii(input, font as "block" | "simple");
    if (result.ok) {
      setOutput(result.value);
    } else {
      setOutput("");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maxLength = 20;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">ASCII Art Generator</h1>
        <p className="text-muted-foreground mt-1">
          Turn text into ASCII art using block or simple fonts.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Text (max {maxLength} characters)
          </label>
          <Input
            value={input}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setInput(e.target.value);
              }
            }}
            placeholder="Enter text (up to 20 chars)"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {input.length}/{maxLength} characters
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Font:</label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleGenerate}>Generate</Button>
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Output</label>
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
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="rounded-lg border bg-card">
              <pre className="p-4 font-mono text-xs leading-tight overflow-auto whitespace-pre">
{output}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
