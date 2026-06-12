"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { testRegex, type RegexResult } from "@/lib/tools";

export default function RegexTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testInput, setTestInput] = useState("");
  const [result, setResult] = useState<RegexResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = () => {
    if (!pattern.trim()) {
      setError("Please enter a regex pattern.");
      setResult(null);
      return;
    }
    const res = testRegex(pattern, testInput, flags);
    if (!res.ok) {
      setError(res.error);
      setResult(null);
    } else {
      setError(null);
      setResult(res.value);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Regex Tester</h1>
        <p className="text-muted-foreground mt-1">
          Test regular expressions against your text with match highlighting.
        </p>
      </div>

      <div className="space-y-4">
        {/* Pattern + Flags */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium mb-2">Pattern</label>
            <Input
              value={pattern}
              onChange={(e) => {
                setPattern(e.target.value);
                setError(null);
              }}
              placeholder="\\d+"
              className="font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Flags</label>
            <Input
              value={flags}
              onChange={(e) => {
                setFlags(e.target.value);
                setError(null);
              }}
              placeholder="g"
              className="font-mono"
            />
          </div>
        </div>

        {/* Test Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Test String</label>
          <Textarea
            value={testInput}
            onChange={(e) => {
              setTestInput(e.target.value);
              setError(null);
            }}
            placeholder="Enter text to test against..."
            className="min-h-[150px] font-mono text-sm"
          />
        </div>

        <Button onClick={handleTest}>Test</Button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Match count */}
            <Card>
              <CardContent className="py-3">
                <span className="text-sm text-muted-foreground">
                  {result.count} match{result.count !== 1 ? "es" : ""} found
                </span>
              </CardContent>
            </Card>

            {/* Highlighted output */}
            <div>
              <label className="block text-sm font-medium mb-2">Matches (highlighted)</label>
              <div
                className="min-h-[100px] rounded-lg border bg-card p-4 font-mono text-sm whitespace-pre-wrap break-all"
                dangerouslySetInnerHTML={{ __html: result.highlighted }}
                style={{
                  // Style <mark> tags injected by the tool
                  ["--mark-bg" as string]: "var(--primary)",
                  ["--mark-text" as string]: "var(--primary-foreground)",
                }}
              />
            </div>

            {/* Match details */}
            {result.matches.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Match Details</label>
                <div className="rounded-lg border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-2 font-medium">#</th>
                        <th className="text-left p-2 font-medium">Match</th>
                        <th className="text-left p-2 font-medium">Groups</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.matches.map((match, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-2 text-muted-foreground">{i + 1}</td>
                          <td className="p-2 font-mono">{match.fullMatch}</td>
                          <td className="p-2 font-mono text-xs">
                            {match.groups.length > 0
                              ? match.groups.map((g, j) => (
                                  <span key={j} className="mr-2">
                                    ${j + 1}={g ?? "(undefined)"}
                                  </span>
                                ))
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
