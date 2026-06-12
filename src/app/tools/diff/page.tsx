"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { diffText, type DiffOp } from "@/lib/tools";

export default function DiffTool() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [diffs, setDiffs] = useState<DiffOp[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiff = () => {
    const result = diffText(textA, textB);
    if (!result.ok) {
      setError(result.error);
      setDiffs(null);
    } else {
      setError(null);
      setDiffs(result.value);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Diff Viewer</h1>
        <p className="text-muted-foreground mt-1">
          Compare two strings and see additions, removals, and unchanged parts.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Text A (original)</label>
            <Textarea
              value={textA}
              onChange={(e) => {
                setTextA(e.target.value);
                setError(null);
              }}
              placeholder="Original text..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Text B (modified)</label>
            <Textarea
              value={textB}
              onChange={(e) => {
                setTextB(e.target.value);
                setError(null);
              }}
              placeholder="Modified text..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
        </div>

        <Button onClick={handleDiff}>Compare</Button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {diffs && (
          <div>
            <label className="block text-sm font-medium mb-2">Diff Result</label>
            <div className="rounded-lg border bg-card p-4 font-mono text-sm whitespace-pre-wrap break-all min-h-[100px]">
              {diffs.length === 0 && (
                <span className="text-muted-foreground">No differences — texts are identical.</span>
              )}
              {diffs.map((op, i) => {
                const className =
                  op.type === "add"
                    ? "bg-green-500/20 text-green-700 dark:text-green-300"
                    : op.type === "remove"
                      ? "bg-red-500/20 text-red-700 dark:text-red-300 line-through"
                      : "";
                return (
                  <span key={i} className={className}>
                    {op.value}
                  </span>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-green-500/30" /> Added
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-red-500/30" /> Removed
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-transparent border" /> Unchanged
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
