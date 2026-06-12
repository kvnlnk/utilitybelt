"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { getAllStatusCodes } from "@/lib/tools";

const CATEGORIES = [
  { key: "All", label: "All Codes" },
  { key: "1xx", label: "1xx Informational" },
  { key: "2xx", label: "2xx Success" },
  { key: "3xx", label: "3xx Redirection" },
  { key: "4xx", label: "4xx Client Error" },
  { key: "5xx", label: "5xx Server Error" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "1xx": "border-l-blue-500",
  "2xx": "border-l-green-500",
  "3xx": "border-l-yellow-500",
  "4xx": "border-l-orange-500",
  "5xx": "border-l-red-500",
};

export default function HttpStatusTool() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const codes = useMemo(() => {
    const result = getAllStatusCodes();
    if (!result.ok) return [];
    let filtered = result.value;

    if (activeCategory !== "All") {
      filtered = filtered.filter((c) => c.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.code.toString().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [activeCategory, search]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          HTTP Status Code Reference
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse and search all standard HTTP status codes.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code or name..."
          className="pl-10"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.key}
            variant={activeCategory === cat.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {codes.length} status code{codes.length !== 1 ? "s" : ""}
      </p>

      {/* Code grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {codes.map((code) => (
          <Card
            key={code.code}
            className={`cursor-pointer border-l-4 transition-all hover:shadow-md ${
              CATEGORY_COLORS[code.category] || ""
            } ${expanded === code.code ? "sm:col-span-2 lg:col-span-3" : ""}`}
            onClick={() =>
              setExpanded(expanded === code.code ? null : code.code)
            }
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-mono">
                    {code.code}
                  </span>
                  <span className="font-medium">{code.title}</span>
                </div>
                {expanded === code.code ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>
              {expanded === code.code && (
                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                  <p>{code.description}</p>
                  <p className="mt-2 text-xs font-medium text-muted-foreground/70">
                    Category: {code.category}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {codes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No status codes found matching your search.
        </div>
      )}
    </div>
  );
}
