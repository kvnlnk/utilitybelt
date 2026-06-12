"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Copy, Check, AlertCircle, Loader2, Beaker } from "lucide-react";
import { callAi, splitResponse } from "@/lib/ai";

export default function AiRegexBuilder() {
  const [description, setDescription] = useState("");
  const [flags, setFlags] = useState("g");
  const [testInput, setTestInput] = useState("");
  const [result, setResult] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [testMatches, setTestMatches] = useState<string[] | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please describe the regex pattern you need.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult("");
    setExplanation("");
    setTestMatches(null);

    try {
      const systemPrompt = `You are a regex expert. Generate a JavaScript regular expression based on the user's description.

Return your response in this format:
\`\`\`regex
<the regex pattern>
\`\`\`
<brief explanation of what each part does>

Only return the regex pattern and an explanation. Include flag suggestions if relevant.`;

      const text = await callAi({ systemPrompt, userPrompt: description });
      const parsed = splitResponse(text, "regex");
      setResult(parsed.code);
      setExplanation(parsed.explanation);
    } catch (e: any) {
      setError(e.message || "Failed to generate regex.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = result;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = () => {
    if (!result || !testInput) {
      setTestMatches(null);
      return;
    }
    try {
      const regex = new RegExp(result, flags);
      const matches = [...testInput.matchAll(regex)];
      setTestMatches(matches.map((m) => m[0]));
    } catch {
      setTestMatches([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Regex Builder</h1>
        <p className="text-muted-foreground mt-1">
          Describe the pattern you need in plain English and get a working regex with explanations.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Describe the pattern</label>
          <Textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setError(null); }}
            placeholder='e.g. "Match valid email addresses" or "Find all URLs in a text" or "Extract YYYY-MM-DD dates"'
            className="min-h-[80px] text-sm"
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate Regex"}
        </Button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Beaker className="h-4 w-4" /> Generated Pattern
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <code className="block text-sm font-mono bg-muted p-3 rounded-lg overflow-x-auto">
                  /{result}/{flags}
                </code>
              </CardContent>
            </Card>

            {explanation && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{explanation}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Live Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={flags}
                    onChange={(e) => setFlags(e.target.value)}
                    placeholder="flags"
                    className="w-20 font-mono text-sm"
                  />
                  <Input
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Enter test text to match against..."
                    className="flex-1 font-mono text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={handleTest}>
                    Test
                  </Button>
                </div>

                {testMatches !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {testMatches.length} match{testMatches.length !== 1 ? "es" : ""} found
                    </p>
                    {testMatches.length > 0 && (
                      <div className="rounded-lg border bg-card p-3 max-h-[200px] overflow-y-auto">
                        {testMatches.map((match, i) => (
                          <div key={i} className="font-mono text-xs py-1 border-b last:border-0">
                            <span className="text-muted-foreground mr-2">{i + 1}.</span>
                            {match}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
