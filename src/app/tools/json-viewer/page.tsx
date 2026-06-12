"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, AlertCircle, ChevronRight, ChevronDown } from "lucide-react";
import { parseJsonTree, type JsonNode } from "@/lib/tools";

export default function JsonViewerTool() {
  const [input, setInput] = useState("");
  const [tree, setTree] = useState<JsonNode[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const handleView = () => {
    if (!input.trim()) {
      setError("Please enter some JSON.");
      setTree(null);
      return;
    }
    const result = parseJsonTree(input);
    if (!result.ok) {
      setError(result.error);
      setTree(null);
    } else {
      setError(null);
      setTree(result.value);
      setCollapsed(new Set());
    }
  };

  const handleCopy = useCallback(async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = input;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [input]);

  const toggleCollapse = (path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">JSON Viewer (Tree View)</h1>
        <p className="text-muted-foreground mt-1">
          Paste JSON and view it as a collapsible, color-coded tree.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">JSON Input</label>
          <Textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder={`{\n  "name": "John",\n  "age": 30,\n  "hobbies": ["reading", "coding"],\n  "address": {\n    "city": "New York",\n    "zip": "10001"\n  }\n}`}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={handleView}>View</Button>
          {tree && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleCopy}
              className="gap-1"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {tree && (
          <div>
            <label className="block text-sm font-medium mb-2">Tree View</label>
            <div className="rounded-lg border p-4 font-mono text-sm bg-card">
              {tree.map((node, i) => (
                <TreeNode
                  key={`root-${i}`}
                  node={node}
                  path={`root-${i}`}
                  collapsed={collapsed}
                  onToggle={toggleCollapse}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TreeNode({
  node,
  path,
  collapsed,
  onToggle,
}: {
  node: JsonNode;
  path: string;
  collapsed: Set<string>;
  onToggle: (path: string) => void;
}) {
  const isCollapsible = node.type === "object" || node.type === "array";
  const isCollapsed = isCollapsible && collapsed.has(path);
  const indent = node.depth * 20;

  return (
    <div>
      <div
        className="flex items-start gap-1 py-0.5 hover:bg-muted/30 rounded px-1 cursor-default"
        style={{ paddingLeft: `${indent + 4}px` }}
      >
        {isCollapsible && (
          <button
            onClick={() => onToggle(path)}
            className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        )}

        {!isCollapsible && <span className="w-3.5 shrink-0" />}

        <span className="text-foreground">{node.key}: </span>

        {isCollapsible ? (
          <span
            className="text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => onToggle(path)}
          >
            {isCollapsed ? (
              <span>
                {node.type === "array" ? "[...]" : "{..."} (
                {node.children?.length ?? 0} items)
              </span>
            ) : (
              <span>{node.value}</span>
            )}
          </span>
        ) : (
          <ValueDisplay type={node.type} value={node.value} />
        )}

        {isCollapsible && !isCollapsed && (
          <span className="text-muted-foreground">,</span>
        )}
      </div>

      {isCollapsible && !isCollapsed && node.children && (
        <div>
          {node.children.map((child, i) => (
            <TreeNode
              key={`${path}-${i}`}
              node={child}
              path={`${path}-${i}`}
              collapsed={collapsed}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ValueDisplay({
  type,
  value,
}: {
  type: JsonNode["type"];
  value: string;
}) {
  const colorMap: Record<string, string> = {
    string: "text-green-600 dark:text-green-400",
    number: "text-blue-600 dark:text-blue-400",
    boolean: "text-orange-500 dark:text-orange-400",
    null: "text-gray-400 dark:text-gray-500",
  };

  const formattedValue =
    type === "string" ? `"${value}"` : value;

  return (
    <span className={colorMap[type] ?? ""}>
      {formattedValue}
    </span>
  );
}
