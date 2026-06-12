"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { explainCron } from "@/lib/tools";

const PRESETS = [
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Every Monday", value: "0 9 * * 1" },
  { label: "Every 15 min", value: "*/15 * * * *" },
];

const FIELD_LABELS = [
  { key: "minute", label: "Minute", range: "0–59" },
  { key: "hour", label: "Hour", range: "0–23" },
  { key: "dayOfMonth", label: "Day of Month", range: "1–31" },
  { key: "month", label: "Month", range: "1–12" },
  { key: "dayOfWeek", label: "Day of Week", range: "0–7 (0=Sun)" },
] as const;

export default function CronTool() {
  const [expression, setExpression] = useState("0 0 * * *");
  const [result, setResult] = useState(() => explainCron("0 0 * * *"));
  const [error, setError] = useState<string | null>(null);

  const handleExplain = () => {
    setError(null);
    const res = explainCron(expression);
    setResult(res);
    if (!res.ok) {
      setError(res.error);
    }
  };

  const handlePreset = (value: string) => {
    setExpression(value);
    const res = explainCron(value);
    setResult(res);
    setError(res.ok ? null : res.error);
  };

  const explanation = result.ok ? result.value : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Cron Expression Builder
        </h1>
        <p className="text-muted-foreground mt-1">
          Parse and explain standard 5-field cron expressions.
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-4">
        <Input
          value={expression}
          onChange={(e) => {
            setExpression(e.target.value);
            setError(null);
          }}
          placeholder="minute hour day month weekday"
          className="font-mono flex-1"
        />
        <Button onClick={handleExplain}>Explain</Button>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map((preset) => (
          <Button
            key={preset.value}
            variant="outline"
            size="sm"
            onClick={() => handlePreset(preset.value)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Format hint */}
      <p className="text-xs text-muted-foreground mb-6 font-mono">
        Format: minute (0–59) hour (0–23) day (1–31) month (1–12) weekday
        (0–7, 0=Sun)
      </p>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-6">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {explanation && (
        <div className="space-y-6">
          {/* Human-readable description */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Schedule</span>
              </div>
              <p className="text-lg font-semibold mt-1">
                {explanation.humanReadable}
              </p>
            </CardContent>
          </Card>

          {/* Field explanations */}
          <Card>
            <CardHeader>
              <CardTitle>Field Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {FIELD_LABELS.map((field) => {
                  const f = explanation[field.key as keyof typeof explanation] as
                    | { raw: string; meaning: string }
                    | undefined;
                  if (!f) return null;
                  return (
                    <div
                      key={field.key}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <span className="font-medium">{field.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({field.range})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-semibold">
                          {f.raw}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {f.meaning}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Next runs */}
          <Card>
            <CardHeader>
              <CardTitle>Next 5 Execution Times</CardTitle>
            </CardHeader>
            <CardContent>
              {explanation.nextRuns.length > 0 ? (
                <div className="space-y-2">
                  {explanation.nextRuns.map((run, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{run}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No future runs could be calculated (the expression may never
                  match).
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
