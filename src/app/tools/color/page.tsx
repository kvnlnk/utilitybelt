"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, AlertCircle } from "lucide-react";
import { convertColor } from "@/lib/tools";

export default function ColorTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    hex: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleConvert = () => {
    if (!input.trim()) {
      setError("Please enter a color value.");
      setResult(null);
      return;
    }
    const res = convertColor(input);
    if (!res.ok) {
      setError(res.error);
      setResult(null);
    } else {
      setError(null);
      setResult(res.value);
    }
  };

  const handleCopy = async (text: string, label: string) => {
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
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Color Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert between HEX, RGB, and HSL color formats with a live preview.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="#ff6600, rgb(255, 102, 0), hsl(24, 100%, 50%)"
            className="font-mono flex-1"
          />
          <Button onClick={handleConvert}>Convert</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Live swatch */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div
                    className="h-16 w-16 rounded-lg border shadow-sm shrink-0"
                    style={{ backgroundColor: result.hex }}
                  />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Preview</span>
                    <br />
                    Click &ldquo;Copy&rdquo; next to any format below.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HEX */}
            <Card>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">HEX</span>
                  <div className="font-mono text-sm">{result.hex}</div>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => handleCopy(result.hex, "hex")}
                  className="gap-1"
                >
                  {copied === "hex" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "hex" ? "Copied" : "Copy"}
                </Button>
              </CardContent>
            </Card>

            {/* RGB */}
            <Card>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">RGB</span>
                  <div className="font-mono text-sm">
                    rgb({result.rgb.r}, {result.rgb.g}, {result.rgb.b})
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    handleCopy(`rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`, "rgb")
                  }
                  className="gap-1"
                >
                  {copied === "rgb" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "rgb" ? "Copied" : "Copy"}
                </Button>
              </CardContent>
            </Card>

            {/* HSL */}
            <Card>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-muted-foreground">HSL</span>
                  <div className="font-mono text-sm">
                    hsl({result.hsl.h}, {result.hsl.s}%, {result.hsl.l}%)
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() =>
                    handleCopy(
                      `hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)`,
                      "hsl",
                    )
                  }
                  className="gap-1"
                >
                  {copied === "hsl" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "hsl" ? "Copied" : "Copy"}
                </Button>
              </CardContent>
            </Card>

            {/* CSS Variables output */}
            <Card>
              <CardContent className="py-3">
                <span className="text-xs font-medium text-muted-foreground">CSS Variables</span>
                <pre className="mt-1 font-mono text-sm bg-muted p-3 rounded-lg overflow-x-auto">
{`--color-hex: ${result.hex};
--color-rgb: ${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b};
--color-hsl: ${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%;`}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
