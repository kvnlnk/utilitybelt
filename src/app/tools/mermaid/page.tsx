"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Play, RotateCcw } from "lucide-react";

const EXAMPLE_DIAGRAMS: { name: string; code: string }[] = [
  {
    name: "Flowchart",
    code: `graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Fix it]
    D --> B`,
  },
  {
    name: "Sequence Diagram",
    code: `sequenceDiagram
    User->>API: POST /api/login
    API->>DB: Query user
    DB-->>API: User found
    API-->>User: 200 OK + Token`,
  },
  {
    name: "Gantt Chart",
    code: `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Design
    Wireframes       :done, 2026-01-01, 7d
    Mockups          :active, 2026-01-08, 5d
    section Dev
    Frontend         :2026-01-15, 10d
    Backend          :2026-01-20, 10d`,
  },
  {
    name: "Git Graph",
    code: `gitGraph
    commit
    branch feature
    checkout feature
    commit
    commit
    checkout main
    merge feature
    commit`,
  },
];

export default function MermaidPage() {
  const [code, setCode] = useState(EXAMPLE_DIAGRAMS[0].code);
  const [error, setError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const renderDiagram = useCallback(async () => {
    if (!code.trim()) return;

    setRendering(true);
    setError(null);

    try {
      const mermaid = (await import("mermaid")).default;

      // Initialize mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
      });

      // Generate a unique ID for this render
      const id = `mermaid-${Date.now()}`;

      // Clear previous output
      if (outputRef.current) {
        outputRef.current.innerHTML = "";
      }

      // Render
      const { svg } = await mermaid.render(id, code);

      if (outputRef.current) {
        outputRef.current.innerHTML = svg;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to render diagram";
      setError(message);
    } finally {
      setRendering(false);
    }
  }, [code]);

  // Auto-render on mount with the first example
  useEffect(() => {
    renderDiagram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mermaid Playground</h1>
        <p className="text-muted-foreground mt-1">
          Write Mermaid diagram code and render it as a visual diagram.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input side */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Diagram Code</label>
          </div>

          <Textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            placeholder={`graph TD\n  A[Start] --> B[End]`}
            className="min-h-[300px] font-mono text-sm"
          />

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Button onClick={renderDiagram} disabled={rendering}>
              <Play className="h-4 w-4 mr-1.5" />
              {rendering ? "Rendering…" : "Render"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCode(EXAMPLE_DIAGRAMS[0].code);
                setError(null);
              }}
            >
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Reset
            </Button>
          </div>

          {/* Presets */}
          <div className="mt-6">
            <label className="text-sm font-medium block mb-2">Example Diagrams</label>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_DIAGRAMS.map((example) => (
                <Button
                  key={example.name}
                  variant={
                    code === example.code ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setCode(example.code);
                    setError(null);
                  }}
                >
                  {example.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Output side */}
        <div>
          <label className="text-sm font-medium block mb-2">Preview</label>
          <Card>
            <CardContent className="p-4">
              {error ? (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="font-mono whitespace-pre-wrap">{error}</span>
                </div>
              ) : (
                <div
                  ref={outputRef}
                  className="flex items-center justify-center min-h-[300px] overflow-auto"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
