"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, AlertCircle, Shuffle } from "lucide-react";
import yaml from "js-yaml";

type Mode = "json-to-yaml" | "yaml-to-json";

export default function YamlConverterTool() {
  const [mode, setMode] = useState<Mode>("json-to-yaml");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input.trim()) {
      setError("Please enter input.");
      setOutput("");
      return;
    }
    setError(null);
    try {
      if (mode === "json-to-yaml") {
        const parsed = JSON.parse(input);
        const y = yaml.dump(parsed, { indent: 2 });
        setOutput(y);
      } else {
        const doc = yaml.load(input);
        setOutput(JSON.stringify(doc, null, 2));
      }
    } catch (e: any) {
      setError(`Conversion error: ${e.message}`);
      setOutput("");
    }
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
        <h1 className="text-3xl font-bold tracking-tight">YAML ↔ JSON Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert between YAML and JSON bidirectionally.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant={mode === "json-to-yaml" ? "default" : "outline"} size="sm" onClick={() => setMode("json-to-yaml")}>
            JSON → YAML
          </Button>
          <Button variant={mode === "yaml-to-json" ? "default" : "outline"} size="sm" onClick={() => setMode("yaml-to-json")}>
            YAML → JSON
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {mode === "json-to-yaml" ? "JSON Input" : "YAML Input"}
          </label>
          <Textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            placeholder={mode === "json-to-yaml" ? '{"key": "value", "arr": [1, 2, 3]}' : "key: value\narr:\n  - 1\n  - 2"}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        <Button onClick={handleConvert} className="gap-2">
          <Shuffle className="h-4 w-4" />
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
              <label className="block text-sm font-medium">Output</label>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Card>
              <CardContent className="p-4">
                <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto max-h-[500px]">{output}</pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
