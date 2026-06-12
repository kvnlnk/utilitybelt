"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, AlertCircle } from "lucide-react";
import { convertCase, type CaseType } from "@/lib/tools";

const CASE_OPTIONS: { value: CaseType; label: string }[] = [
  { value: "camel", label: "camelCase" },
  { value: "pascal", label: "PascalCase" },
  { value: "snake", label: "snake_case" },
  { value: "kebab", label: "kebab-case" },
  { value: "title", label: "Title Case" },
  { value: "upper", label: "UPPER CASE" },
  { value: "lower", label: "lower case" },
];

export default function CaseTool() {
  const [input, setInput] = useState("");
  const [targetCase, setTargetCase] = useState<CaseType>("camel");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input.trim()) {
      setError("Please enter some text to convert.");
      setOutput("");
      return;
    }
    const result = convertCase(input, targetCase);
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
        <h1 className="text-3xl font-bold tracking-tight">Case Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert text between camelCase, PascalCase, snake_case, kebab-case, Title Case, UPPER CASE, and lower case.
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
            placeholder="Enter text to convert..."
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Convert to:</label>
            <select
              value={targetCase}
              onChange={(e) => setTargetCase(e.target.value as CaseType)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CASE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleConvert}>Convert</Button>
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
            <Card>
              <CardContent className="py-3">
                <div className="font-mono text-sm whitespace-pre-wrap break-all">{output}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
