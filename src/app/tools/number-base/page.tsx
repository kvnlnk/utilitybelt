"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, AlertCircle } from "lucide-react";
import { convertBase, type NumberBase } from "@/lib/tools";

const BASE_OPTIONS: { value: NumberBase; label: string }[] = [
  { value: "hex", label: "Hexadecimal (16)" },
  { value: "dec", label: "Decimal (10)" },
  { value: "bin", label: "Binary (2)" },
  { value: "oct", label: "Octal (8)" },
];

const BASE_LABELS: Record<NumberBase, string> = {
  hex: "HEX",
  dec: "DEC",
  bin: "BIN",
  oct: "OCT",
};

export default function NumberBaseTool() {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState<NumberBase>("dec");
  const [results, setResults] = useState<Record<NumberBase, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleConvert = () => {
    if (!input.trim()) {
      setError("Please enter a number.");
      setResults(null);
      return;
    }
    const newResults: Record<string, string> = {};
    for (const target of BASE_OPTIONS) {
      const result = convertBase(input, fromBase, target.value);
      if (!result.ok) {
        setError(result.error);
        setResults(null);
        return;
      }
      newResults[target.value] = result.value;
    }
    setError(null);
    setResults(newResults as Record<NumberBase, string>);
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Number Base Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert numbers between hexadecimal, decimal, binary, and octal.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Value</label>
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              placeholder="255"
              className="font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <select
              value={fromBase}
              onChange={(e) => setFromBase(e.target.value as NumberBase)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {BASE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="pt-5">
            <Button onClick={handleConvert}>Convert</Button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {results && (
          <div className="space-y-3">
            {BASE_OPTIONS.map((base) => (
              <Card key={base.value}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {BASE_LABELS[base.value]}
                    </span>
                    <div className="font-mono text-sm break-all">{results[base.value]}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleCopy(results[base.value], base.value)}
                    className="gap-1 shrink-0"
                  >
                    {copied === base.value ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied === base.value ? "Copied" : "Copy"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
