"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface ToolEntry {
  name: string;
  href: string;
}

const allTools: ToolEntry[] = [
  // Format
  { name: "JSON Formatter", href: "/tools/json" },
  { name: "SQL Formatter", href: "/tools/sql" },
  { name: "HTML Formatter", href: "/tools/html" },
  { name: "CSS Formatter", href: "/tools/css" },
  { name: "XML Formatter", href: "/tools/xml" },
  // Encode / Decode
  { name: "Base64 Encoder / Decoder", href: "/tools/base64" },
  { name: "URL Encoder / Decoder", href: "/tools/url" },
  { name: "HTML Entities", href: "/tools/entity" },
  // Crypto
  { name: "Hash Generator", href: "/tools/hash" },
  { name: "UUID Generator", href: "/tools/uuid" },
  { name: "JWT Decoder", href: "/tools/jwt" },
  // Text
  { name: "Regex Tester", href: "/tools/regex" },
  { name: "Diff Viewer", href: "/tools/diff" },
  { name: "Case Converter", href: "/tools/case" },
  { name: "Lorem Ipsum Generator", href: "/tools/lorem" },
  // Convert
  { name: "Color Converter", href: "/tools/color" },
  { name: "Epoch Converter", href: "/tools/epoch" },
  { name: "Number Base Converter", href: "/tools/number-base" },
  { name: "CSV Parser", href: "/tools/csv" },
  // Other
  { name: "Password Generator", href: "/tools/password" },
  { name: "Image to Base64", href: "/tools/image-base64" },
  { name: "Regex Explain", href: "/tools/regex-explain" },
  { name: "URL Parse", href: "/tools/url-parse" },
  { name: "Mermaid Playground", href: "/tools/mermaid" },
  { name: "cURL Converter", href: "/tools/curl-converter" },
  { name: "Color Contrast Checker", href: "/tools/contrast" },
  { name: "Log Viewer", href: "/tools/log-viewer" },
  // Pages
  { name: "Cheatsheets", href: "/cheatsheets" },
  { name: "Blog", href: "/blog" },
  { name: "Pricing", href: "/pricing" },
  { name: "Home", href: "/" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Toggle on Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      // Small delay to ensure the DOM is ready
      const t = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(t);
    }
  }, [open]);

  const filtered = query
    ? allTools.filter((tool) =>
        tool.name.toLowerCase().includes(query.toLowerCase())
      )
    : allTools;

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        setOpen(false);
        setQuery("");
      }
    },
    []
  );

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 pt-[15vh]"
    >
      <div className="w-full max-w-lg rounded-xl bg-background shadow-2xl border border-border overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools and pages…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((tool) => (
              <button
                key={tool.href}
                onClick={() => handleSelect(tool.href)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
              >
                <span>{tool.name}</span>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {tool.href}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
