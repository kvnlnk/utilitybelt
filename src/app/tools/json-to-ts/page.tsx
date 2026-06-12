"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, AlertCircle, Shuffle, Code } from "lucide-react";

function toTypeName(key: string): string {
  return key
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

function inferType(val: unknown): string {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  if (typeof val === "string") return "string";
  if (typeof val === "number") return Number.isInteger(val) ? "number" : "number";
  if (typeof val === "boolean") return "boolean";
  if (Array.isArray(val)) {
    if (val.length === 0) return "any[]";
    const elementType = inferType(val[0]);
    return `${elementType}[]`;
  }
  if (typeof val === "object") return "Record<string, unknown>";
  return "unknown";
}

interface TsProp {
  name: string;
  type: string;
  optional: boolean;
}

function generateInterface(obj: Record<string, unknown>, name: string): string {
  const props: TsProp[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      const subName = toTypeName(key);
      props.push({ name: key, type: subName, optional: false });
      return `export interface ${name} {\n${props
        .map((p) => `  ${p.name}${p.optional ? "?" : ""}: ${p.type};`)
        .join("\n")}\n}\n\n${generateInterface(val as Record<string, unknown>, subName)}`;
    }
    props.push({ name: key, type: inferType(val), optional: false });
  }
  return `export interface ${name} {\n${props
    .map((p) => `  ${p.name}${p.optional ? "?" : ""}: ${p.type};`)
    .join("\n")}\n}`;
}

export default function JsonToTsTool() {
  const [input, setInput] = useState("");
  const [interfaceName, setInterfaceName] = useState("User");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    if (!input.trim()) {
      setError("Please enter JSON.");
      setOutput("");
      return;
    }
    setError(null);
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("JSON must be an object or array.");
      }

      if (Array.isArray(parsed)) {
        if (parsed.length === 0) throw new Error("Empty array — can't infer type.");
        const first = parsed[0];
        if (typeof first === "object" && first !== null) {
          setOutput(generateInterface(first as Record<string, unknown>, interfaceName));
          return;
        }
        setOutput(`type ${interfaceName} = ${inferType(first)}[];`);
        return;
      }

      setOutput(generateInterface(parsed as Record<string, unknown>, interfaceName));
    } catch (e: any) {
      setError(`Error: ${e.message}`);
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
        <h1 className="text-3xl font-bold tracking-tight">JSON → TypeScript</h1>
        <p className="text-muted-foreground mt-1">
          Generate TypeScript interfaces from JSON objects.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Interface name:</label>
          <Input
            value={interfaceName}
            onChange={(e) => setInterfaceName(e.target.value)}
            className="w-40 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">JSON Input</label>
          <Textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            placeholder='{"id": 1, "name": "Alice", "email": "alice@example.com"}'
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        <Button onClick={handleConvert} className="gap-2">
          <Shuffle className="h-4 w-4" />
          Generate Types
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
              <label className="block text-sm font-medium">TypeScript</label>
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
