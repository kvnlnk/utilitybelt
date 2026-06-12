"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

export default function GettingStartedPost() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <CalendarDays className="h-4 w-4" />
            <time dateTime="2026-06-12">June 12, 2026</time>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Getting Started with DevTools
          </h1>
        </header>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-5 text-base leading-relaxed">
          <p>
            Welcome to <strong>DevTools Hub</strong> — your one-stop collection of handy developer tools
            designed to make your daily workflow faster, smoother, and more enjoyable. Whether you&apos;re
            formatting JSON, testing a regex pattern, generating a UUID, or converting an epoch timestamp,
            DevTools Hub has you covered.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">What&apos;s Inside?</h2>

          <p>
            DevTools Hub organizes its tools into logical categories so you can find what you need quickly:
          </p>

          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Format</strong> — JSON, SQL, HTML, CSS, and XML formatters that pretty-print,
              minify, and validate your code.
            </li>
            <li>
              <strong>Encode / Decode</strong> — Base64, URL, and HTML entity encoders and decoders.
            </li>
            <li>
              <strong>Crypto</strong> — Hash generator (SHA-1/256/384/512), UUID v4 generator, and
              JWT token decoder.
            </li>
            <li>
              <strong>Text</strong> — Regex tester with highlighting, side-by-side diff viewer, case
              converter, and Lorem Ipsum generator.
            </li>
            <li>
              <strong>Convert</strong> — Color converter (HEX/RGB/HSL), epoch converter, number base
              converter, and CSV parser.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-3">Cheatsheets</h2>

          <p>
            In addition to interactive tools, DevTools Hub also includes a growing collection of
            <Link href="/cheatsheets" className="text-primary underline underline-offset-2 hover:no-underline">
              {" "}cheatsheets
            </Link>{" "}
            — quick reference guides for Git, Docker, and Markdown. Perfect for when you need a syntax
            reminder without leaving your browser.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">Getting Around</h2>

          <p>
            Use the search bar on the home page to filter tools by name or description. The navigation
            bar at the top links to the main page, tools, and cheatsheets. For power users, press
            <kbd className="inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-xs font-mono mx-1">
              <span className="text-[10px]">⌘</span>K
            </kbd>
            to open the command palette and jump to any tool instantly.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">What&apos;s Next?</h2>

          <p>
            DevTools Hub is continuously evolving. We&apos;re planning more tools, deeper cheatsheets,
            a mermaid diagram playground, and more. Check back often or explore the tools now to see
            what you can do!
          </p>

          <div className="mt-10 pt-6 border-t text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
            >
              Explore All Tools
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
