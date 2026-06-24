"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Braces,
  FileCode,
  Lock,
  Type,
  Shuffle,
  Beaker,
  Search,
  Binary,
  Globe,
  Hash,
  Key,
  FileText,
  Columns,
  Paintbrush,
  Clock,
  Sigma,
  Table,
  CaseSensitive,
  Terminal,
  Eye,
  ScrollText,
  Database,
  Code,
  BarChart,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBar } from "@/components/search-bar";
import type { LucideIcon } from "lucide-react";

interface Tool {
  name: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

interface ToolCategory {
  name: string;
  icon: LucideIcon;
  tools: Tool[];
}

const categories: ToolCategory[] = [
  {
    name: "Format",
    icon: Braces,
    tools: [
      { name: "JSON", href: "/tools/json", description: "Pretty-print, minify & validate JSON", icon: Braces },
      { name: "SQL", href: "/tools/sql", description: "Format and validate SQL queries", icon: FileCode },
      { name: "HTML", href: "/tools/html", description: "Format, minify & validate HTML", icon: Globe },
      { name: "CSS", href: "/tools/css", description: "Format and beautify CSS", icon: Paintbrush },
      { name: "XML", href: "/tools/xml", description: "Format and validate XML", icon: FileCode },
    ],
  },
  {
    name: "Encode / Decode",
    icon: Shuffle,
    tools: [
      { name: "Base64", href: "/tools/base64", description: "Encode & decode Base64 strings", icon: Binary },
      { name: "URL", href: "/tools/url", description: "Encode & decode URL components", icon: Globe },
      { name: "HTML Entities", href: "/tools/entity", description: "Encode & decode HTML entities", icon: FileText },
    ],
  },
  {
    name: "Crypto",
    icon: Lock,
    tools: [
      { name: "Hash", href: "/tools/hash", description: "Generate SHA-1/256/384/512 hashes", icon: Hash },
      { name: "UUID", href: "/tools/uuid", description: "Generate random UUID v4 identifiers", icon: Key },
      { name: "JWT", href: "/tools/jwt", description: "Decode and inspect JWT tokens", icon: Lock },
    ],
  },
  {
    name: "Text",
    icon: Type,
    tools: [
      { name: "Regex", href: "/tools/regex", description: "Test regular expressions with highlighting", icon: Beaker },
      { name: "Diff", href: "/tools/diff", description: "Compare two texts side-by-side", icon: Columns },
      { name: "Case", href: "/tools/case", description: "Convert between text cases", icon: CaseSensitive },
      { name: "Lorem Ipsum", href: "/tools/lorem", description: "Generate placeholder text", icon: FileText },
      { name: "Text Analyzer", href: "/tools/text-analyzer", description: "Word count, frequency, reading time, and more", icon: BarChart },
    ],
  },
  {
    name: "Convert",
    icon: Sigma,
    tools: [
      { name: "Color", href: "/tools/color", description: "Convert between HEX, RGB, HSL", icon: Paintbrush },
      { name: "Epoch", href: "/tools/epoch", description: "Convert between epoch & human-readable dates", icon: Clock },
      { name: "Number Base", href: "/tools/number-base", description: "Convert between binary, octal, decimal, hex", icon: Sigma },
      { name: "CSV", href: "/tools/csv", description: "Parse, format & validate CSV data", icon: Table },
      { name: "YAML ↔ JSON", href: "/tools/yaml-converter", description: "Bidirectional YAML/JSON conversion", icon: Shuffle },
      { name: "HTML ↔ Markdown", href: "/tools/html-md-converter", description: "Bidirectional HTML/Markdown conversion", icon: Shuffle },
      { name: "JSON → TypeScript", href: "/tools/json-to-ts", description: "Generate TypeScript interfaces from JSON", icon: Code },
      { name: "Contrast", href: "/tools/contrast", description: "Check WCAG color contrast ratios", icon: Eye },
    ],
  },
  {
    name: "Network",
    icon: Terminal,
    tools: [
      { name: "cURL Converter", href: "/tools/curl-converter", description: "Convert cURL to fetch, axios, Python, Go", icon: Terminal },
      { name: "Subnet Calculator", href: "/tools/subnet", description: "Calculate network details from IP/CIDR", icon: Hash },
    ],
  },
  {
    name: "Debug",
    icon: ScrollText,
    tools: [
      { name: "Log Viewer", href: "/tools/log-viewer", description: "Parse, filter & inspect JSON log entries", icon: ScrollText },
      { name: "CRUD Generator", href: "/tools/crud-generator", description: "Generate SQL CRUD from table definitions", icon: Database },
    ],
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link href={tool.href} className="block transition-all hover:scale-[1.02]">
      <Card className="h-full cursor-pointer hover:border-primary/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{tool.name}</CardTitle>
          </div>
          <CardDescription>{tool.description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.tools.length > 0);

  const showAll = !searchQuery;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero */}
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          UtilityBelt
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Developer tools, cheatsheets, and utilities — all in one utility belt.
        </p>
        <div className="mt-6 flex justify-center">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search tools by name or description…" />
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <a
            href="https://github.com/kvnlnk/utilitybelt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            View on GitHub
          </a>
          <a
            href="https://github.com/kvnlnk/utilitybelt/stargazers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 18.896l-7.416 3.517 1.48-8.279-6.064-5.828 8.332-1.151z"/></svg>
            Star
          </a>
        </div>
      </section>

      {/* Categories */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-lg text-muted-foreground">
            No tools found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {filteredCategories.map((category) => {
        const CatIcon = category.icon;
        return (
          <section key={category.name} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <CatIcon className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-semibold">{category.name}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.tools.map((tool) => (
                <ToolCard key={tool.href} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Quick links */}
      <section className="mt-12 pt-8 border-t text-center">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/cheatsheets"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            Cheatsheets
          </Link>
          <Link
            href="/cheatsheets/git"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            Git
          </Link>
          <Link
            href="/cheatsheets/docker"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            Docker
          </Link>
          <Link
            href="/cheatsheets/markdown"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            Markdown
          </Link>
          <Link
            href="/cheatsheets/sql"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <Database className="h-4 w-4" />
            SQL
          </Link>
          <Link
            href="/cheatsheets/typescript"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <FileCode className="h-4 w-4" />
            TypeScript
          </Link>
          <Link
            href="/cheatsheets/react"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            <FileCode className="h-4 w-4" />
            React
          </Link>
        </div>
      </section>
    </div>
  );
}
