"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ArrowRight } from "lucide-react";

interface BlogPost {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
}

const posts: BlogPost[] = [
  {
    title: "Getting Started with DevTools",
    slug: "getting-started-with-devtools",
    date: "June 12, 2026",
    excerpt:
      "A comprehensive introduction to DevTools Hub — your one-stop shop for formatting, encoding, converting, and debugging tools. Learn how to make the most of every tool we offer.",
  },
  {
    title: "10 Essential Regex Patterns Every Developer Should Know",
    slug: "essential-regex-patterns",
    date: "June 5, 2026",
    excerpt:
      "Regular expressions can save you hours of work. Here are ten must-know patterns for email validation, URL parsing, date extraction, and more — with interactive examples you can try right in your browser.",
  },
  {
    title: "Understanding JWT Tokens: A Visual Guide",
    slug: "understanding-jwt-tokens",
    date: "May 28, 2026",
    excerpt:
      "JWT tokens power modern authentication. In this post we break down the header, payload, and signature parts of a JWT, explain how signing works, and show you how to decode one using our JWT inspector.",
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Tips, tutorials, and deep dives into developer tools and workflows.
        </p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block transition-all hover:scale-[1.01]"
          >
            <Card className="cursor-pointer hover:border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{post.date}</span>
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription className="text-base mt-1">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                  Read more
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
