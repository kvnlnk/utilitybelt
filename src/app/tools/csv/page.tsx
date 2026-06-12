"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, AlertCircle, ArrowDownUp } from "lucide-react";
import { csvToJson, jsonToCsv } from "@/lib/tools";

type Direction = "csv-to-json" | "json-to-csv";

export default function CsvTool() {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("csv-to-json");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input.trim()) {
      setError("Please enter input data.");
      setOutput("");
      return;
    }
    if (direction === "csv-to-json") {
      const result = csvToJson(input);
      if (!result.ok) {
        setError(result.error);
        setOutput("");
      } else {
        setError(null);
        setOutput(JSON.stringify(result.value, null, 2));
      }
    } else {
      const result = jsonToCsv(input);
      if (!result.ok) {
        setError(result.error);
        setOutput("");
      } else {
        setError(null);
        setOutput(result.value);
      }
    }
  };

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setOutput("");
    }
    setDirection((d) => (d === "csv-to-json" ? "json-to-csv" : "csv-to-json"));
    setError(null);
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
        <h1 className="text-3xl font-bold tracking-tight">CSV ↔ JSON Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert CSV data to JSON and back. First row is treated as headers.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Direction:</label>
            <select
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value as Direction);
                setOutput("");
                setError(null);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="csv-to-json">CSV → JSON</option>
              <option value="json-to-csv">JSON → CSV</option>
            </select>
          </div>
          <Button onClick={handleConvert}>Convert</Button>
          <Button variant="outline" onClick={handleSwap} className="gap-1">
            <ArrowDownUp className="h-4 w-4" />
            Swap
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Input</label>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder={
              direction === "csv-to-json"
                ? "name,age,city\nAlice,30,New York\nBob,25,London"
                : '[\n  { "name": "Alice", "age": 30 },\n  { "name": "Bob", "age": 25 }\n]'
            }
            className="min-h-[180px] font-mono text-sm"
          />
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
              className="min-h-[180px] font-mono text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
