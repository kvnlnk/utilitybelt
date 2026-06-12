"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, AlertCircle } from "lucide-react";
import { formatJson, minifyJson } from "@/lib/tools";

export default function JsonTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    const result = formatJson(input);
    if (!result.ok) {
      setError(result.error);
      setOutput("");
    } else {
      setError(null);
      setOutput(result.value);
    }
  };

  const handleMinify = () => {
    const result = minifyJson(input);
    if (!result.ok) {
      setError(result.error);
      setOutput("");
    } else {
      setError(null);
      setOutput(result.value);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">JSON Formatter & Validator</h1>
        <p className="text-muted-foreground mt-1">
          Pretty-print, minify, and validate JSON strings.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Input</label>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder={`{\n  "name": "John",\n  "age": 30\n}`}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleFormat}>Format</Button>
          <Button variant="outline" onClick={handleMinify}>Minify</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Output</label>
              <Button variant="ghost" size="xs" onClick={handleCopy} className="gap-1">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Textarea
              value={output}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
