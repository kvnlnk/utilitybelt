"use client";

import { ToolLayout } from "@/components/tool-layout";
import { formatXml } from "@/lib/tools";

export default function XmlTool() {
  return (
    <ToolLayout
      title="XML Formatter"
      description="Format and beautify XML markup with proper tag-based indentation."
      placeholder='<root><item id="1"><name>Example</name></item></root>'
      process={(input) => {
        const result = formatXml(input);
        if (!result.ok) return { output: "", error: result.error };
        return { output: result.value };
      }}
    />
  );
}
