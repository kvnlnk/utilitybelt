"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, AlertCircle, Play } from "lucide-react";
import { testJsonPath } from "@/lib/tools";

const EXAMPLES = [
  {
    name: "Simple object",
    json: JSON.stringify({ name: "John", age: 30, city: "New York" }, null, 2),
    path: "$.name",
  },
  {
    name: "Nested object",
    json: JSON.stringify(
      {
        store: {
          book: [
            { title: "Book A", price: 12.99 },
            { title: "Book B", price: 8.99 },
          ],
          bicycle: { color: "red", price: 199 },
        },
      },
      null,
      2,
    ),
    path: "$.store.book[*].title",
  },
  {
    name: "Array index",
    json: JSON.stringify(["apple", "banana", "cherry", "date"], null, 2),
    path: "$[0,2]",
  },
  {
    name: "Recursive descent",
    json: JSON.stringify(
      {
        id: 1,
        items: [{ id: 2 }, { nested: { id: 3 } }],
      },
      null,
      2,
    ),
    path: "$..id",
  },
];

export default function JsonPathTool() {
  const [jsonInput, setJsonInput] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [result, setResult] = useState<{ result: unknown; matches: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTest = useCallback(() => {
    if (!jsonInput.trim()) {
      setError("Please enter JSON data.");
      setResult(null);
      return;
    }
    if (!pathInput.trim()) {
      setError("Please enter a JSONPath expression.");
      setResult(null);
      return;
    }

    const res = testJsonPath(jsonInput, pathInput);
    if (!res.ok) {
      setError(res.error);
      setResult(null);
    } else {
      setError(null);
      setResult(res.value);
    }
  }, [jsonInput, pathInput]);

  const loadExample = (example: (typeof EXAMPLES)[0]) => {
    setJsonInput(example.json);
    setPathInput(example.path);
    setError(null);
    setResult(null);
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = JSON.stringify(result.result, null, 2);
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">JSONPath Tester</h1>
        <p className="text-muted-foreground mt-1">
          Test JSONPath expressions against JSON data. Supports{" "}
          <code className="bg-muted px-1 rounded text-xs">$</code>,{" "}
          <code className="bg-muted px-1 rounded text-xs">.key</code>,{" "}
          <code className="bg-muted px-1 rounded text-xs">..key</code>,{" "}
          <code className="bg-muted px-1 rounded text-xs">[0]</code>,{" "}
          <code className="bg-muted px-1 rounded text-xs">[*]</code>.
        </p>
      </div>

      {/* Examples */}
      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground mb-2">Examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <Button
              key={ex.name}
              variant="outline"
              size="sm"
              onClick={() => loadExample(ex)}
            >
              {ex.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* JSON Input */}
        <div>
          <label className="block text-sm font-medium mb-2">JSON Data</label>
          <Textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setError(null);
            }}
            placeholder={`{\n  "name": "John",\n  "age": 30\n}`}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        {/* JSONPath Input */}
        <div>
          <label className="block text-sm font-medium mb-2">JSONPath Expression</label>
          <div className="flex gap-2">
            <Input
              value={pathInput}
              onChange={(e) => {
                setPathInput(e.target.value);
                setError(null);
              }}
              placeholder="$.name, $.store.book[*].title, $..id, $[0,2]"
              className="font-mono flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTest();
              }}
            />
            <Button onClick={handleTest} className="gap-2">
              <Play className="h-4 w-4" />
              Test
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Result{" "}
                <span className="text-muted-foreground font-normal">
                  ({result.matches} match{result.matches !== 1 ? "es" : ""})
                </span>
              </label>
              <Button variant="ghost" size="xs" onClick={handleCopy} className="gap-1">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Card>
              <CardContent className="p-4">
                <pre className="font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
