"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, AlertCircle } from "lucide-react";
import { encodeUrl, decodeUrl } from "@/lib/tools";

export default function UrlTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    const result = encodeUrl(input);
    if (!result.ok) {
      setError(result.error);
      setOutput("");
    } else {
      setError(null);
      setOutput(result.value);
    }
  };

  const handleDecode = () => {
    const result = decodeUrl(input);
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
        <h1 className="text-3xl font-bold tracking-tight">URL Encode / Decode</h1>
        <p className="text-muted-foreground mt-1">
          Encode or decode URL components (percent-encoding).
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Input</label>
          <Textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            placeholder="https://example.com?name=hello world"
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleEncode}>Encode</Button>
          <Button variant="outline" onClick={handleDecode}>Decode</Button>
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
            <Textarea value={output} readOnly className="min-h-[120px] font-mono text-sm" />
          </div>
        )}
      </div>
    </div>
  );
}
