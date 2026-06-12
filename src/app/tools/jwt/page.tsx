"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, AlertCircle } from "lucide-react";
import { decodeJWT } from "@/lib/tools";

export default function JwtTool() {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState<string | null>(null);
  const [payload, setPayload] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleDecode = () => {
    if (!input.trim()) {
      setError("Please enter a JWT token.");
      setHeader(null);
      setPayload(null);
      setSignature(null);
      return;
    }
    const result = decodeJWT(input.trim());
    if (!result.ok) {
      setError(result.error);
      setHeader(null);
      setPayload(null);
      setSignature(null);
    } else {
      setError(null);
      setHeader(JSON.stringify(result.value.header, null, 2));
      setPayload(JSON.stringify(result.value.payload, null, 2));
      setSignature(result.value.signature);
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
        <h1 className="text-3xl font-bold tracking-tight">JWT Decoder</h1>
        <p className="text-muted-foreground mt-1">
          Decode a JSON Web Token to inspect its header and payload (no signature verification).
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">JWT Token</label>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lInQ.swQHwOKWm8v6DmI4zY0X9g"
            className="min-h-[100px] font-mono text-sm"
          />
        </div>

        <Button onClick={handleDecode}>Decode</Button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {header && (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Header</label>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => { if (header) handleCopy(header, "header"); }}
                  className="gap-1"
                >
                  {copied === "header" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "header" ? "Copied" : "Copy"}
                </Button>
              </div>
              <Card>
                <CardContent className="py-3">
                  <pre className="font-mono text-sm whitespace-pre-wrap break-all">{header}</pre>
                </CardContent>
              </Card>
            </div>

            {/* Payload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Payload</label>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => { if (payload) handleCopy(payload, "payload"); }}
                  className="gap-1"
                >
                  {copied === "payload" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "payload" ? "Copied" : "Copy"}
                </Button>
              </div>
              <Card>
                <CardContent className="py-3">
                  <pre className="font-mono text-sm whitespace-pre-wrap break-all">{payload}</pre>
                </CardContent>
              </Card>
            </div>

            {/* Signature */}
            {signature && (
              <div>
                <label className="block text-sm font-medium mb-2">Signature (raw)</label>
                <Card>
                  <CardContent className="py-3">
                    <div className="font-mono text-xs break-all text-muted-foreground">
                      {signature}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
