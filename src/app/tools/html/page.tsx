"use client";

import { ToolLayout } from "@/components/tool-layout";
import { formatHtml } from "@/lib/tools";

export default function HtmlTool() {
  return (
    <ToolLayout
      title="HTML Formatter"
      description="Format and beautify HTML markup with proper indentation."
      placeholder="<div><p>Hello</p></div>"
      process={(input) => {
        const result = formatHtml(input);
        if (!result.ok) return { output: "", error: result.error };
        return { output: result.value };
      }}
    />
  );
}
