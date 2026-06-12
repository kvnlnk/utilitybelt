"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { parseUrl, type UrlComponents } from "@/lib/tools";

export default function UrlParseTool() {
  const [url, setUrl] = useState("");
  const [parsed, setParsed] = useState<UrlComponents | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    if (!url.trim()) {
      setError("Please enter a URL.");
      setParsed(null);
      return;
    }
    const result = parseUrl(url);
    if (!result.ok) {
      setError(result.error);
      setParsed(null);
    } else {
      setError(null);
      setParsed(result.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleParse();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">URL Parser</h1>
        <p className="text-muted-foreground mt-1">
          Parse a URL into its individual components — protocol, host, path, query params, and more.
        </p>
      </div>

      <div className="space-y-4">
        {/* URL input */}
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com:8080/path/to/page?q=hello&lang=en#section"
            className="font-mono flex-1"
          />
          <Button onClick={handleParse}>Parse</Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Parsed components */}
        {parsed && (
          <div className="space-y-3">
            {/* Main components */}
            <Card>
              <CardContent className="py-4 space-y-3">
                <ComponentRow label="Protocol" value={parsed.protocol} />
                <ComponentRow label="Host" value={parsed.host} />
                <ComponentRow label="Hostname" value={parsed.hostname} />
                <ComponentRow label="Port" value={parsed.port || "(default)"} />
                <ComponentRow label="Pathname" value={parsed.pathname} />
                <ComponentRow label="Search" value={parsed.search || "(none)"} />
                <ComponentRow label="Hash" value={parsed.hash || "(none)"} />
                <ComponentRow label="Origin" value={parsed.origin} />
                <ComponentRow label="HREF" value={parsed.href} />
              </CardContent>
            </Card>

            {/* Query params */}
            {Object.keys(parsed.params).length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/50">
                    Query Parameters ({Object.keys(parsed.params).length})
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30">
                        <th className="text-left p-2 font-medium">Key</th>
                        <th className="text-left p-2 font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(parsed.params).map(([key, value]) => (
                        <tr key={key} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="p-2 font-mono text-primary">{key}</td>
                          <td className="p-2 font-mono text-muted-foreground break-all">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ComponentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-sm font-medium text-muted-foreground w-24 shrink-0">
        {label}
      </span>
      <span className="text-sm font-mono break-all">{value}</span>
    </div>
  );
}
