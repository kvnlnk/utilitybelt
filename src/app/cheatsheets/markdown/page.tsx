"use client";

import { Card, CardContent } from "@/components/ui/card";

interface Example {
  title: string;
  markdown: string;
  description: string;
}

interface Section {
  title: string;
  examples: Example[];
}

const sections: Section[] = [
  {
    title: "Headings",
    examples: [
      { title: "Heading 1", markdown: "# Heading 1", description: "Top-level heading" },
      { title: "Heading 2", markdown: "## Heading 2", description: "Second-level heading" },
      { title: "Heading 3", markdown: "### Heading 3", description: "Third-level heading" },
      { title: "Heading 4", markdown: "#### Heading 4", description: "Fourth-level heading" },
      { title: "Heading 5", markdown: "##### Heading 5", description: "Fifth-level heading" },
      { title: "Heading 6", markdown: "###### Heading 6", description: "Sixth-level heading" },
    ],
  },
  {
    title: "Text Formatting",
    examples: [
      { title: "Bold", markdown: "**bold text**", description: "Wraps text in double asterisks" },
      { title: "Italic", markdown: "*italic text*", description: "Wraps text in single asterisks" },
      { title: "Bold & Italic", markdown: "***bold italic***", description: "Triple asterisks" },
      { title: "Strikethrough", markdown: "~~strikethrough~~", description: "Double tilde on both sides" },
      { title: "Inline Code", markdown: "`code`", description: "Single backticks for inline code" },
    ],
  },
  {
    title: "Lists",
    examples: [
      { title: "Unordered List", markdown: "- Item 1\n- Item 2\n  - Nested Item", description: "Use -, *, or + for unordered items" },
      { title: "Ordered List", markdown: "1. First\n2. Second\n3. Third", description: "Numbers followed by periods" },
      { title: "Task List", markdown: "- [x] Done\n- [ ] Pending", description: "Checkboxes with [ ] or [x]" },
    ],
  },
  {
    title: "Links & Images",
    examples: [
      { title: "Link", markdown: "[text](https://example.com)", description: "Link text in brackets, URL in parens" },
      { title: "Image", markdown: "![alt text](image.png)", description: "Exclamation, alt text in brackets, URL in parens" },
      { title: "Reference Link", markdown: "[text][ref]\n\n[ref]: https://example.com", description: "Define reference elsewhere in the document" },
    ],
  },
  {
    title: "Code Blocks",
    examples: [
      { title: "Fenced Code Block", markdown: "```python\nprint('Hello')\n```", description: "Triple backticks with optional language" },
      { title: "Indented Code Block", markdown: "    def hello():\n        print('hi')", description: "Indent with 4 spaces" },
    ],
  },
  {
    title: "Blockquotes",
    examples: [
      { title: "Simple Quote", markdown: "> This is a quote", description: "Prefix with >" },
      { title: "Nested Quote", markdown: "> Level 1\n>> Level 2", description: "Double >> for nested quotes" },
      { title: "Quote with Other Elements", markdown: "> **Bold** inside a quote", description: "Other formatting works inside quotes" },
    ],
  },
  {
    title: "Tables",
    examples: [
      { title: "Simple Table", markdown: "| Name | Age |\n|------|-----|\n| Alice| 30  |", description: "Pipes and dashes to separate columns and header" },
      { title: "Right-Aligned Column", markdown: "| Left | Right |\n|:-----|------:|\n| A    |     B |", description: "Colon on right side for right alignment" },
      { title: "Center-Aligned Column", markdown: "| Center |\n|:------:|\n|   X    |", description: "Colons on both sides for center alignment" },
    ],
  },
  {
    title: "Horizontal Rules",
    examples: [
      { title: "Three Dashes", markdown: "---", description: "Three or more dashes" },
      { title: "Three Asterisks", markdown: "***", description: "Three or more asterisks" },
      { title: "Three Underscores", markdown: "___", description: "Three or more underscores" },
    ],
  },
  {
    title: "Miscellaneous",
    examples: [
      { title: "Escaping", markdown: "\\*not italic\\*", description: "Backslash before special characters" },
      { title: "Subscript", markdown: "H~2~O", description: "Tilde around text" },
      { title: "Superscript", markdown: "X^2^", description: "Caret around text" },
      { title: "Footnote", markdown: "Here is text[^1]\n\n[^1]: Footnote content", description: "Bracket with caret and number" },
    ],
  },
];

export default function MarkdownCheatsheet() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Markdown Cheatsheet</h1>
        <p className="text-muted-foreground mt-1">
          A quick reference for Markdown syntax — formatting, links, code, tables, and more.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
            <div className="space-y-3">
              {section.examples.map((example, i) => (
                <Card key={i}>
                  <CardContent className="py-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="sm:w-1/3 shrink-0">
                        <span className="text-xs font-medium text-muted-foreground">{example.title}</span>
                        <pre className="mt-1 font-mono text-xs bg-muted p-2 rounded whitespace-pre-wrap break-all">
                          {example.markdown}
                        </pre>
                      </div>
                      <div className="sm:w-2/3 text-sm text-muted-foreground self-center">
                        {example.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
