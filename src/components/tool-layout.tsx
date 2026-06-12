"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, AlertCircle } from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  inputLabel?: string;
  outputLabel?: string;
  placeholder?: string;
  /** Children rendered between the input textarea and the output area */
  children?: ReactNode;
  /** Render a custom output area instead of the default textarea */
  renderOutput?: (output: string, input: string) => ReactNode;
  /** Process the input and return output/error */
  process: (input: string) => { output: string; error?: string };
  /** Show copy button on output */
  showCopy?: boolean;
  /** Default input value */
  defaultInput?: string;
}

export function ToolLayout({
  title,
  description,
  inputLabel = "Input",
  outputLabel = "Output",
  placeholder = "Enter your input here…",
  children,
  renderOutput,
  process,
  showCopy = true,
  defaultInput = "",
}: ToolLayoutProps) {
  const [input, setInput] = useState(defaultInput);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProcess = () => {
    const result = process(input);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setError(null);
      setOutput(result.output);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
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
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{inputLabel}</label>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder={placeholder}
            className="min-h-[150px] font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleProcess}>Process</Button>
          {children}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">{outputLabel}</label>
              {showCopy && (
                <Button variant="ghost" size="xs" onClick={handleCopy} className="gap-1">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>
            {renderOutput ? renderOutput(output, input) : (
              <Textarea
                value={output}
                readOnly
                className="min-h-[150px] font-mono text-sm"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
