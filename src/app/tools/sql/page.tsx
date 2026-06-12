"use client";

import { ToolLayout } from "@/components/tool-layout";
import { formatSql } from "@/lib/tools";

export default function SqlTool() {
  return (
    <ToolLayout
      title="SQL Formatter"
      description="Format and beautify SQL queries with proper indentation."
      placeholder="SELECT id, name FROM users WHERE age > 18 ORDER BY name"
      process={(input) => {
        const result = formatSql(input);
        if (!result.ok) return { output: "", error: result.error };
        return { output: result.value };
      }}
    />
  );
}
