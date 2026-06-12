"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, AlertCircle, Shuffle } from "lucide-react";
import { marked } from "marked";
import TurndownService from "turndown";

const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

type Mode = "html-to-md" | "md-to-html";

export default function HtmlMdConverterTool() {
  const [mode, setMode] = useState<Mode>("md-to-html");
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
      if (mode === "md-to-html") {
        setOutput(marked.parse(input) as string);
      } else {
        setOutput(turndown.turndown(input));
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
        <h1 className="text-3xl font-bold tracking-tight">HTML ↔ Markdown Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert between HTML and Markdown bidirectionally.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant={mode === "md-to-html" ? "default" : "outline"} size="sm" onClick={() => setMode("md-to-html")}>
            Markdown → HTML
          </Button>
          <Button variant={mode === "html-to-md" ? "default" : "outline"} size="sm" onClick={() => setMode("html-to-md")}>
            HTML → Markdown
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {mode === "md-to-html" ? "Markdown Input" : "HTML Input"}
          </label>
          <Textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(null); }}
            placeholder={mode === "md-to-html" ? "# Hello World\n\nThis is **bold** and `code`." : "<h1>Hello</h1>\n<p>This is <strong>bold</strong> and <code>code</code>.</p>"}
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
            {mode === "md-to-html" && (
              <Card className="mt-3">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: output }} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
