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
          DevTools Hub
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          A collection of handy developer tools for formatting, encoding, converting, and more.
        </p>
        <div className="mt-6 flex justify-center">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search tools by name or description…" />
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
        </div>
      </section>
    </div>
  );
}
