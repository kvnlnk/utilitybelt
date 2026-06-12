"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Container, FileText, Database, FileType, Atom } from "lucide-react";

interface Cheatsheet {
  name: string;
  href: string;
  description: string;
  icon: React.ElementType;
}

const cheatsheets: Cheatsheet[] = [
  {
    name: "Git",
    href: "/cheatsheets/git",
    description: "Common Git commands for daily workflow — commit, branch, merge, rebase, stash, and more.",
    icon: GitBranch,
  },
  {
    name: "Docker",
    href: "/cheatsheets/docker",
    description: "Essential Docker commands — containers, images, volumes, networks, and Compose.",
    icon: Container,
  },
  {
    name: "Markdown",
    href: "/cheatsheets/markdown",
    description: "Markdown syntax reference — headings, lists, code blocks, tables, links, and formatting.",
    icon: FileText,
  },
  {
    name: "SQL",
    href: "/cheatsheets/sql",
    description: "SQL queries, joins, aggregations, CRUD operations, window functions, and PostgreSQL-specific features.",
    icon: Database,
  },
  {
    name: "TypeScript",
    href: "/cheatsheets/typescript",
    description: "Types, interfaces, generics, utility types, type guards, mapped types, and tsconfig options.",
    icon: FileType,
  },
  {
    name: "React & Next.js",
    href: "/cheatsheets/react",
    description: "Components, hooks, App Router patterns, server/client components, data fetching, and React 19 features.",
    icon: Atom,
  },
];

export default function CheatsheetsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cheatsheets</h1>
        <p className="text-muted-foreground mt-1">
          Quick reference guides for your daily development workflow.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cheatsheets.map((sheet) => {
          const Icon = sheet.icon;
          return (
            <Link key={sheet.href} href={sheet.href} className="block transition-all hover:scale-[1.02]">
              <Card className="h-full cursor-pointer hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{sheet.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{sheet.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
