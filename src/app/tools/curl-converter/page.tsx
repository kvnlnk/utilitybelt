"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Copy, Check, Terminal } from "lucide-react";
import { parseCurl, generateCode, type CodeTarget } from "@/lib/tools";

const TARGETS: { id: CodeTarget; label: string }[] = [
  { id: "fetch", label: "JavaScript (fetch)" },
  { id: "axios", label: "JavaScript (axios)" },
  { id: "python", label: "Python (requests)" },
  { id: "go", label: "Go (net/http)" },
];

export default function CurlConverterTool() {
  const [input, setInput] = useState("");
  const [target, setTarget] = useState<CodeTarget>("fetch");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input.trim()) {
      setError("Please paste a cURL command.");
      setOutput("");
      return;
    }
    const parsed = parseCurl(input);
    if (!parsed.ok) {
      setError(parsed.error);
      setOutput("");
      return;
    }
    const code = generateCode(parsed.value, target, { pretty: true });
    if (!code.ok) {
      setError(code.error);
      setOutput("");
      return;
    }
    setError(null);
    setOutput(code.value);
  };

  const handleCopy = async () => {
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
        <h1 className="text-3xl font-bold tracking-tight">cURL Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert cURL commands to JavaScript, Python, and Go code.
        </p>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium mb-2">cURL Command</label>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder={`curl -X POST https://api.example.com/data \\\n  -H "Content-Type: application/json" \\\n  -d '{"key": "value"}'`}
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        {/* Target selector */}
        <div className="flex flex-wrap gap-2">
          {TARGETS.map((t) => (
            <Button
              key={t.id}
              variant={target === t.id ? "default" : "outline"}
              size="sm"
              onClick={() => setTarget(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        <Button onClick={handleConvert} className="gap-2">
          <Terminal className="h-4 w-4" />
          Convert
        </Button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Generated Code</label>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Card>
              <CardContent className="p-4">
                <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-[500px]">
                  {output}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
