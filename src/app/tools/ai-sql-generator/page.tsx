"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Copy, Check, AlertCircle, Loader2, Table } from "lucide-react";
import { callAi, splitResponse } from "@/lib/ai";

export default function AiSqlGenerator() {
  const [prompt, setPrompt] = useState("");
  const [schema, setSchema] = useState("");
  const [result, setResult] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dialect, setDialect] = useState("PostgreSQL");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please describe the query you want.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult("");
    setExplanation("");

    try {
      const systemPrompt = `You are a SQL expert. Generate a ${dialect} SQL query based on the user's description.

${schema ? `Database schema:\n${schema}\n\n` : ""}Return your response in this format:
\`\`\`sql
<the SQL query>
\`\`\`
<brief explanation of what the query does>

Only return the SQL and a short explanation.`;

      const text = await callAi({ systemPrompt, userPrompt: prompt });
      const parsed = splitResponse(text, "sql");
      setResult(parsed.code);
      setExplanation(parsed.explanation);
    } catch (e: any) {
      setError(e.message || "Failed to generate SQL.");
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI SQL Generator</h1>
        <p className="text-muted-foreground mt-1">
          Describe the query you need in plain English and get SQL. Powered by Google Gemini.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {["PostgreSQL", "MySQL", "SQLite", "SQL Server", "BigQuery"].map((d) => (
            <Button
              key={d}
              variant={dialect === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDialect(d)}
            >
              {d}
            </Button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Describe your query</label>
          <Textarea
            value={prompt}
            onChange={(e) => { setPrompt(e.target.value); setError(null); }}
            placeholder='e.g. "Show me all users who signed up in the last 30 days, with their total order count, sorted by most orders"'
            className="min-h-[100px] text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Database Schema <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder="users(id INT PK, name TEXT, email TEXT, created_at TIMESTAMP)"
            className="min-h-[80px] font-mono text-sm"
          />
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Generating..." : "Generate SQL"}
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
                    <Table className="h-4 w-4" /> Generated SQL
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-1">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto bg-muted p-4 rounded-lg">{result}</pre>
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
          </div>
        )}
      </div>
    </div>
  );
}
