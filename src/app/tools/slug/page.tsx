"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { toSlug } from "@/lib/tools";

export default function SlugTool() {
  const [input, setInput] = useState("");
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const result = toSlug(input);
    if (result.ok) {
      setSlug(result.value);
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(slug);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = slug;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [slug]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Text to Slug</h1>
        <p className="text-muted-foreground mt-1">
          Convert any text into a URL-friendly slug. Updates live as you type.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Input Text</label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hello World! This is a test..."
            className="font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Characters: {input.length}</span>
          <span>|</span>
          <span>Slug length: {slug.length}</span>
        </div>

        {slug && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Slug</label>
              <Button
                variant="ghost"
                size="xs"
                onClick={handleCopy}
                className="gap-1"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Card>
              <CardContent className="py-3">
                <div className="font-mono text-sm break-all">{slug}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
