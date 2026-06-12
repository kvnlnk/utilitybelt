"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download, AlertCircle } from "lucide-react";

// Simple hash function for deterministic patterns
function hashText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Generate a deterministic QR-like grid pattern
function generateGrid(text: string): boolean[][] {
  const hash = hashText(text);
  // Grid size based on text length (min 11, max 29, odd numbers like real QR)
  let size = Math.min(29, Math.max(11, Math.ceil(text.length / 2) * 2 + 1));
  if (size % 2 === 0) size += 1;
  if (size < 11) size = 11;

  const grid: boolean[][] = [];

  // Initialize grid
  for (let y = 0; y < size; y++) {
    grid[y] = [];
    for (let x = 0; x < size; x++) {
      grid[y][x] = false;
    }
  }

  // Draw position detection patterns (top-left, top-right, bottom-left)
  // These are like real QR code finder patterns
  const drawFinder = (ox: number, oy: number) => {
    const pattern = [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ];
    for (let py = 0; py < 7 && oy + py < size; py++) {
      for (let px = 0; px < 7 && ox + px < size; px++) {
        grid[oy + py][ox + px] = pattern[py][px] === 1;
      }
    }
  };

  drawFinder(0, 0); // top-left
  drawFinder(size - 7, 0); // top-right
  drawFinder(0, size - 7); // bottom-left

  // Fill remaining cells with data based on text hash
  // Use a simple PRNG seeded by the text hash
  const prng = (seed: number) => {
    let s = seed;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  };

  const rand = prng(hash);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Skip already-filled finder patterns and their quiet zones
      const inTL = x < 8 && y < 8;
      const inTR = x >= size - 8 && y < 8;
      const inBL = x < 8 && y >= size - 8;
      if (inTL || inTR || inBL) continue;

      // Add timing patterns (alternating, like real QR)
      if (y === 6 && x >= 8 && x < size - 8) {
        grid[y][x] = x % 2 === 0;
        continue;
      }
      if (x === 6 && y >= 8 && y < size - 8) {
        grid[y][x] = y % 2 === 0;
        continue;
      }

      // Data cells: deterministic based on text
      grid[y][x] = rand() > 0.5;
    }
  }

  return grid;
}

export default function QRCodeTool() {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateQR = useCallback(() => {
    if (!text.trim()) {
      setError("Please enter some text to generate a QR-like code.");
      setHasGenerated(false);
      return;
    }
    setError(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const grid = generateGrid(text);
    const size = grid.length;
    const cellSize = Math.max(4, Math.min(12, Math.floor(280 / size)));
    const padding = 16;
    const canvasSize = size * cellSize + padding * 2;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw modules
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x]) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(
            padding + x * cellSize,
            padding + y * cellSize,
            cellSize,
            cellSize,
          );
        }
      }
    }

    setHasGenerated(true);
  }, [text]);

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">QR Code Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate a deterministic QR-like pattern from any text input.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            placeholder="Enter text to encode..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") generateQR();
            }}
          />
          <Button onClick={generateQR}>Generate</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <Card>
            <CardContent className="p-6">
              <canvas
                ref={canvasRef}
                className="rounded-lg mx-auto"
                style={{ maxWidth: "100%", height: "auto" }}
              />
              {!hasGenerated && (
                <div className="text-center text-muted-foreground text-sm py-12">
                  Enter text and click Generate to create your QR-like code
                </div>
              )}
            </CardContent>
          </Card>

          {hasGenerated && (
            <Button variant="outline" onClick={downloadPNG} className="gap-2">
              <Download className="h-4 w-4" />
              Download as PNG
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
