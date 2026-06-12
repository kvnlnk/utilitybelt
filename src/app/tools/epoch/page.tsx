"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, AlertCircle, Clock } from "lucide-react";
import { epochToDate, dateToEpoch, now } from "@/lib/tools";

export default function EpochTool() {
  const [epochInput, setEpochInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [epochOutput, setEpochOutput] = useState("");
  const [dateOutput, setDateOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentEpoch, setCurrentEpoch] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedDate, setCopiedDate] = useState(false);

  const handleEpochToDate = () => {
    const ts = Number(epochInput);
    if (isNaN(ts)) {
      setError("Please enter a valid numeric epoch timestamp.");
      return;
    }
    const result = epochToDate(ts);
    if (!result.ok) {
      setError(result.error);
      setEpochOutput("");
    } else {
      setError(null);
      setEpochOutput(result.value);
    }
  };

  const handleDateToEpoch = () => {
    if (!dateInput.trim()) {
      setError("Please enter a date string.");
      return;
    }
    const result = dateToEpoch(dateInput);
    if (!result.ok) {
      setError(result.error);
      setDateOutput("");
    } else {
      setError(null);
      setDateOutput(result.value.toString());
    }
  };

  const handleNow = () => {
    const result = now();
    if (result.ok) {
      setCurrentEpoch(result.value);
      setEpochInput(result.value.toString());
      const dateResult = epochToDate(result.value);
      if (dateResult.ok) {
        setEpochOutput(dateResult.value);
      }
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Epoch Converter</h1>
        <p className="text-muted-foreground mt-1">
          Convert between Unix epoch timestamps and human-readable dates.
        </p>
      </div>

      <div className="space-y-6">
        {/* Current time */}
        <Card>
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Current Unix Epoch</span>
            </div>
            <div className="flex items-center gap-2">
              {currentEpoch !== null && (
                <span className="font-mono text-sm">{currentEpoch}</span>
              )}
              <Button variant="outline" size="sm" onClick={handleNow}>
                Refresh Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Epoch → Date */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Epoch → Date</h2>
          <div className="flex gap-2">
            <Input
              value={epochInput}
              onChange={(e) => {
                setEpochInput(e.target.value);
                setError(null);
              }}
              placeholder="Enter epoch timestamp (seconds)..."
              className="font-mono flex-1"
              type="number"
            />
            <Button onClick={handleEpochToDate}>Convert</Button>
          </div>
          {epochOutput && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <span className="font-mono text-sm">{epochOutput}</span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleCopy(epochOutput, setCopied)}
                className="gap-1"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          )}
        </div>

        {/* Date → Epoch */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Date → Epoch</h2>
          <div className="flex gap-2">
            <Input
              value={dateInput}
              onChange={(e) => {
                setDateInput(e.target.value);
                setError(null);
              }}
              placeholder="Enter date (e.g. 2024-01-15 or 2024-01-15T12:00:00Z)..."
              className="font-mono flex-1"
            />
            <Button onClick={handleDateToEpoch}>Convert</Button>
          </div>
          {dateOutput && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <span className="font-mono text-sm">{dateOutput} seconds</span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleCopy(dateOutput, setCopiedDate)}
                className="gap-1"
              >
                {copiedDate ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedDate ? "Copied" : "Copy"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
