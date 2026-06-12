"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { explainRegex, type RegexTokenExplanation } from "@/lib/tools";

export default function RegexExplainTool() {
  const [pattern, setPattern] = useState("");
  const [tokens, setTokens] = useState<RegexTokenExplanation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = () => {
    if (!pattern.trim()) {
      setError("Please enter a regex pattern.");
      setTokens(null);
      return;
    }
    const result = explainRegex(pattern);
    if (!result.ok) {
      setError(result.error);
      setTokens(null);
    } else {
      setError(null);
      setTokens(result.value);
    }
  };

  const handleInputChange = (value: string) => {
    setPattern(value);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExplain();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Regex Explainer</h1>
        <p className="text-muted-foreground mt-1">
          Enter a regular expression pattern and get a token-by-token explanation in plain English.
        </p>
      </div>

      <div className="space-y-4">
        {/* Pattern input */}
        <div className="flex gap-2">
          <Input
            value={pattern}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={'^\\d{3}-\\d{2}-\\d{4}$'}
            className="font-mono flex-1"
          />
          <Button onClick={handleExplain}>Explain</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Token explanation table */}
        {tokens && tokens.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium w-1/3">Token</th>
                    <th className="text-left p-3 font-medium">Explanation</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="p-3 font-mono text-primary break-all">
                        <code>{item.token}</code>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {item.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {tokens && tokens.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No tokens to explain. The pattern appears to be empty.
          </p>
        )}
      </div>
    </div>
  );
}
