"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

type GradientType = "linear" | "radial";
type LinearDirection = "top-bottom" | "left-right" | "diagonal";

const LINEAR_ANGLES: Record<LinearDirection, number> = {
  "top-bottom": 180,
  "left-right": 90,
  diagonal: 135,
};

const LINEAR_LABELS: Record<LinearDirection, string> = {
  "top-bottom": "Top → Bottom",
  "left-right": "Left → Right",
  diagonal: "Diagonal ↘",
};

export default function SvgGradientTool() {
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [linearDir, setLinearDir] = useState<LinearDirection>("top-bottom");
  const [startColor, setStartColor] = useState("#6366f1");
  const [endColor, setEndColor] = useState("#ec4899");
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);

  const generateSvgCode = useCallback(() => {
    if (gradientType === "linear") {
      const angle = LINEAR_ANGLES[linearDir];
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="${
        linearDir === "left-right" ? "100%" : "0%"
      }" y2="${linearDir === "top-bottom" ? "100%" : linearDir === "diagonal" ? "100%" : "0%"}">
      <stop offset="0%" stop-color="${startColor}" />
      <stop offset="100%" stop-color="${endColor}" />
    </linearGradient>
  </defs>
  <rect width="300" height="150" fill="url(#grad)" />
</svg>`;
    } else {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">
  <defs>
    <radialGradient id="grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${startColor}" />
      <stop offset="100%" stop-color="${endColor}" />
    </radialGradient>
  </defs>
  <rect width="300" height="150" fill="url(#grad)" />
</svg>`;
    }
  }, [gradientType, linearDir, startColor, endColor]);

  const generateCssCode = useCallback(() => {
    if (gradientType === "linear") {
      const angle = LINEAR_ANGLES[linearDir];
      return `background: linear-gradient(${angle}deg, ${startColor}, ${endColor});`;
    } else {
      return `background: radial-gradient(circle, ${startColor}, ${endColor});`;
    }
  }, [gradientType, linearDir, startColor, endColor]);

  const handleCopy = async (text: string, setFn: (v: boolean) => void) => {
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
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const svgCode = generateSvgCode();
  const cssCode = generateCssCode();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          SVG Gradient Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Create and export linear and radial SVG gradients.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Controls */}
        <div className="space-y-6">
          {/* Gradient type */}
          <Card>
            <CardHeader>
              <CardTitle>Gradient Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={gradientType === "linear" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGradientType("linear")}
                >
                  Linear
                </Button>
                <Button
                  variant={gradientType === "radial" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGradientType("radial")}
                >
                  Radial
                </Button>
              </div>

              {gradientType === "linear" && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(Object.keys(LINEAR_LABELS) as LinearDirection[]).map(
                    (dir) => (
                      <Button
                        key={dir}
                        variant={linearDir === dir ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLinearDir(dir)}
                      >
                        {LINEAR_LABELS[dir]}
                      </Button>
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Color pickers */}
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <span className="text-sm font-medium">Start:</span>
                  <input
                    type="color"
                    value={startColor}
                    onChange={(e) => setStartColor(e.target.value)}
                    className="h-10 w-16 rounded border cursor-pointer"
                  />
                </label>
                <span className="font-mono text-xs text-muted-foreground">
                  {startColor}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <span className="text-sm font-medium">End:</span>
                  <input
                    type="color"
                    value={endColor}
                    onChange={(e) => setEndColor(e.target.value)}
                    className="h-10 w-16 rounded border cursor-pointer"
                  />
                </label>
                <span className="font-mono text-xs text-muted-foreground">
                  {endColor}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div
                className="rounded-lg border overflow-hidden"
                style={{ width: 300, height: 150 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="300"
                  height="150"
                  viewBox="0 0 300 150"
                  dangerouslySetInnerHTML={{
                    __html: generateSvgCode()
                      .replace(/^<svg[^>]*>/, "")
                      .replace(/<\/svg>$/, ""),
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Copy buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => handleCopy(svgCode, setCopiedSvg)}
            >
              {copiedSvg ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedSvg ? "Copied SVG Code!" : "Copy SVG Code"}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => handleCopy(cssCode, setCopiedCss)}
            >
              {copiedCss ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiedCss ? "Copied CSS Code!" : "Copy CSS Gradient Code"}
            </Button>
          </div>

          {/* CSS preview */}
          <Card>
            <CardHeader>
              <CardTitle>CSS Output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="rounded-lg bg-muted p-3 text-sm font-mono overflow-x-auto">
                {cssCode}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
