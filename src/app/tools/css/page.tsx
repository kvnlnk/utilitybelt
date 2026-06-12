"use client";

import { ToolLayout } from "@/components/tool-layout";
import { minifyCss } from "@/lib/tools";

export default function CssTool() {
  return (
    <ToolLayout
      title="CSS Minifier"
      description="Minify CSS by removing comments, whitespace, and redundant characters."
      placeholder="body {\n  background: #fff;\n  color: #333;\n}"
      process={(input) => {
        const result = minifyCss(input);
        if (!result.ok) return { output: "", error: result.error };
        return { output: result.value };
      }}
    />
  );
}
