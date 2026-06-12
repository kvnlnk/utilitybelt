"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, Check, AlertCircle, FileText } from "lucide-react";
import { generateLoremIpsum } from "@/lib/tools";

export default function LoremTool() {
  const [paragraphs, setParagraphs] = useState(3);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const result = generateLoremIpsum(paragraphs);
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
        <h1 className="text-3xl font-bold tracking-tight">Lorem Ipsum Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate placeholder text for your designs and layouts.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Paragraphs:</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={paragraphs}
              onChange={(e) => {
                setParagraphs(Math.max(1, parseInt(e.target.value) || 1));
                setError(null);
              }}
              className="w-20 font-mono"
            />
          </div>
          <Button onClick={handleGenerate}>
            <FileText className="h-4 w-4 mr-1.5" />
            Generate
          </Button>
          {output && (
            <Button variant="outline" onClick={handleCopy} className="gap-1">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {output && (
          <div>
            <label className="block text-sm font-medium mb-2">Generated Text</label>
            <Textarea
              value={output}
              readOnly
              className="min-h-[300px] font-serif text-sm leading-relaxed"
            />
          </div>
        )}
      </div>
    </div>
  );
}
