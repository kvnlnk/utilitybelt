"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, RefreshCw } from "lucide-react";
import { generateUUID } from "@/lib/tools";

export default function UuidTool() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = () => {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      const result = generateUUID();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      ids.push(result.value);
    }
    setError(null);
    setUuids(ids);
  };

  const handleCopy = async (uuid: string, index: number) => {
    try {
      await navigator.clipboard.writeText(uuid);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = uuid;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = async () => {
    const all = uuids.join("\n");
    try {
      await navigator.clipboard.writeText(all);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = all;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">UUID Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate random UUID v4 identifiers.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Count:</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              {[1, 5, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <Button onClick={generate}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Generate
          </Button>
          <Button variant="outline" onClick={handleCopyAll}>
            <Copy className="h-4 w-4 mr-1.5" />
            Copy All
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        <div className="space-y-2">
          {uuids.map((uuid, i) => (
            <Card key={i}>
              <CardContent className="py-2 flex items-center justify-between">
                <span className="font-mono text-sm">{uuid}</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleCopy(uuid, i)}
                  className="gap-1 shrink-0"
                >
                  {copiedIndex === i ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedIndex === i ? "Copied" : "Copy"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
