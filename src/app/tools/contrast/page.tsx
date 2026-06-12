"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Eye } from "lucide-react";
import { checkContrast, type ContrastResult } from "@/lib/tools";

export default function ContrastTool() {
  const [fg, setFg] = useState("#1a1a1a");
  const [bg, setBg] = useState("#ffffff");
  const [result, setResult] = useState<ContrastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = () => {
    const res = checkContrast(fg, bg);
    if (!res.ok) {
      setError(res.error);
      setResult(null);
    } else {
      setError(null);
      setResult(res.value);
    }
  };

  const passBadge = (pass: boolean) =>
    pass
      ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30"
      : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Color Contrast Checker</h1>
        <p className="text-muted-foreground mt-1">
          Check WCAG 2.1 contrast ratios between two colors. Enter hex values (#rrggbb).
        </p>
      </div>

      <div className="space-y-4">
        {/* Color inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Foreground</label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-lg border shrink-0"
                style={{ backgroundColor: fg }}
              />
              <Input
                value={fg}
                onChange={(e) => { setFg(e.target.value); setError(null); }}
                placeholder="#1a1a1a"
                className="font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Background</label>
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded-lg border shrink-0"
                style={{ backgroundColor: bg }}
              />
              <Input
                value={bg}
                onChange={(e) => { setBg(e.target.value); setError(null); }}
                placeholder="#ffffff"
                className="font-mono"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleCheck} className="gap-2">
          <Eye className="h-4 w-4" />
          Check Contrast
        </Button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Preview */}
            <Card>
              <CardContent className="p-6">
                <div
                  className="rounded-lg p-8 text-center text-xl font-semibold"
                  style={{
                    color: result.foreground,
                    backgroundColor: result.background,
                  }}
                >
                  The quick brown fox jumps over the lazy dog.
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Large text sample (18px bold or 24px regular)
                </p>
              </CardContent>
            </Card>

            {/* Ratio */}
            <Card>
              <CardContent className="py-4">
                <div className="text-center">
                  <span className="text-4xl font-bold">{result.ratioFormatted}</span>
                  <p className="text-sm text-muted-foreground mt-1">Contrast Ratio</p>
                </div>
              </CardContent>
            </Card>

            {/* WCAG Levels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card>
                <CardContent className="py-4">
                  <h3 className="font-semibold mb-2 text-sm">AA Level</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Normal text</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${passBadge(result.aaNormal)}`}>
                        {result.aaNormal ? "PASS" : "FAIL"} (4.5:1)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Large text</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${passBadge(result.aaLarge)}`}>
                        {result.aaLarge ? "PASS" : "FAIL"} (3:1)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <h3 className="font-semibold mb-2 text-sm">AAA Level</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Normal text</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${passBadge(result.aaaNormal)}`}>
                        {result.aaaNormal ? "PASS" : "FAIL"} (7:1)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Large text</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${passBadge(result.aaaLarge)}`}>
                        {result.aaaLarge ? "PASS" : "FAIL"} (4.5:1)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
