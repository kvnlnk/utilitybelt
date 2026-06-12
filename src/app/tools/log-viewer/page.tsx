"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  TableIcon,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  parseLogs,
  filterLogs,
  formatValue,
  getValueType,
  type LogEntry,
  type LogParseResult,
} from "@/lib/tools";

export default function LogViewerTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<LogParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleParse = () => {
    if (!input.trim()) {
      setError("Please paste JSON log data.");
      setResult(null);
      return;
    }
    const res = parseLogs(input);
    if (!res.ok) {
      setError(res.error);
      setResult(null);
    } else {
      setError(null);
      setResult(res.value);
      setExpandedRows(new Set());
    }
  };

  const filteredEntries = useMemo(() => {
    if (!result) return [];
    return filterLogs(result.entries, searchQuery, fieldFilter);
  }, [result, searchQuery, fieldFilter]);

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Detect common value types for columns
  const fieldTypes = useMemo(() => {
    if (!result) return new Map<string, string>();
    const types = new Map<string, string>();
    for (const field of result.fields) {
      for (const entry of result.entries) {
        const val = entry[field];
        if (val !== undefined && val !== null) {
          types.set(field, getValueType(val));
          break;
        }
      }
    }
    return types;
  }, [result]);

  // Truncated display fields (show first 5, rest expandable)
  const displayFields = useMemo(() => {
    if (!result) return { visible: [], hidden: [] };
    const fields = result.fields;
    if (fields.length <= 6) return { visible: fields, hidden: [] };
    return { visible: fields.slice(0, 5), hidden: fields.slice(5) };
  }, [result]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Log Viewer</h1>
        <p className="text-muted-foreground mt-1">
          Parse, filter, and inspect JSON log entries. Supports NDJSON and JSON arrays.
        </p>
      </div>

      <div className="space-y-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Paste JSON Logs
          </label>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder={`{"level":"info","message":"Server started","port":3000,"env":"production"}\n{"level":"error","message":"Connection refused","service":"db","code":"ECONNREFUSED"}\n{"level":"warn","message":"High memory usage","used":850,"limit":1024}`}
            className="min-h-[120px] font-mono text-sm"
          />
        </div>

        <Button onClick={handleParse} className="gap-2">
          <TableIcon className="h-4 w-4" />
          Parse Logs
        </Button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <>
            {/* Summary bar */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {result.total} entries
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span>{result.fields.length} fields</span>
              {fieldFilter && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="flex items-center gap-1">
                    Filter: <code className="text-xs bg-muted px-1 rounded">{fieldFilter}</code>
                    <button
                      onClick={() => setFieldFilter(null)}
                      className="text-xs text-muted-foreground hover:text-foreground ml-1"
                    >
                      ✕
                    </button>
                  </span>
                </>
              )}
            </div>

            {/* Search + field filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all fields…"
                  className="pl-9 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFieldFilter(null)}
                  className={`text-xs px-2 py-1 rounded border ${
                    !fieldFilter
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                  }`}
                >
                  All
                </button>
                {result.fields.slice(0, 8).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFieldFilter(f)}
                    className={`text-xs px-2 py-1 rounded border ${
                      fieldFilter === f
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="w-8 p-2"></th>
                      <th className="text-left p-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                        #
                      </th>
                      {displayFields.visible.map((field) => (
                        <th
                          key={field}
                          className="text-left p-2 font-medium text-xs text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        >
                          <div className="flex items-center gap-1">
                            <Filter className="h-3 w-3" />
                            {field}
                          </div>
                          <span className="text-[10px] font-normal text-muted-foreground/60">
                            {fieldTypes.get(field) || "unknown"}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={displayFields.visible.length + 2}
                          className="p-8 text-center text-sm text-muted-foreground"
                        >
                          No entries match the current filter.
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.slice(0, 200).map((entry) => (
                        <tr
                          key={entry._index}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-2">
                            <button
                              onClick={() => toggleRow(entry._index)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {expandedRows.has(entry._index) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                          <td className="p-2 text-muted-foreground text-xs font-mono">
                            {entry._index + 1}
                          </td>
                          {displayFields.visible.map((field) => (
                            <td
                              key={field}
                              className="p-2 font-mono text-xs max-w-[200px] truncate"
                              title={formatValue(entry[field], 500)}
                            >
                              {formatValue(entry[field])}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Expanded rows */}
              {Array.from(expandedRows)
                .sort((a, b) => a - b)
                .map((idx) => {
                  const entry = result.entries[idx];
                  if (!entry) return null;
                  return (
                    <div
                      key={`expanded-${idx}`}
                      className="border-t bg-muted/20 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                          Entry #{idx + 1} — Full JSON
                        </h4>
                      </div>
                      <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-[400px] bg-card rounded-lg border p-3">
                        {entry._raw}
                      </pre>
                    </div>
                  );
                })}

              {/* Pagination hint */}
              {filteredEntries.length > 200 && (
                <div className="p-3 text-center text-xs text-muted-foreground border-t">
                  Showing 200 of {filteredEntries.length} entries. The full results are available in memory.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
