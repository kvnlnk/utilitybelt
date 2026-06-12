"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, AlertCircle } from "lucide-react";
import { hashText, type HashAlgorithm } from "@/lib/tools";

const ALGORITHMS: HashAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

export default function HashTool() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [allHashes, setAllHashes] = useState<{ algo: HashAlgorithm; hash: string }[] | null>(null);

  const handleHash = async () => {
    if (!input.trim()) {
      setError("Please enter some text to hash.");
      return;
    }
    setLoading(true);
    setError(null);

    const results: { algo: HashAlgorithm; hash: string }[] = [];
    for (const algo of ALGORITHMS) {
      const result = await hashText(input, algo);
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
      results.push({ algo, hash: result.value });
    }

    setAllHashes(results);
    setOutput(results.find((r) => r.algo === algorithm)?.hash ?? "");
    setLoading(false);
  };

  const handleCopy = async (hash: string, index: number) => {
    try {
      await navigator.clipboard.writeText(hash);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = hash;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Hash Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes for any text.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Input</label>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="Enter text to hash..."
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        <Button onClick={handleHash} disabled={loading}>
          {loading ? "Generating..." : "Generate All Hashes"}
        </Button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {allHashes && (
          <div className="space-y-3">
            {allHashes.map((item, i) => (
              <Card key={item.algo}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.algo}</span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleCopy(item.hash, i)}
                      className="gap-1"
                    >
                      {copiedIndex === i ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copiedIndex === i ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <div className="font-mono text-xs break-all bg-muted p-2 rounded">
                    {item.hash}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
