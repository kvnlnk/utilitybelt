"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Database, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// CRUD Generator — generate SQL CRUD from a table definition
// ---------------------------------------------------------------------------

interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  isPk: boolean;
  isAuto: boolean;
  defaultValue: string | null;
}

interface TableDef {
  name: string;
  columns: ColumnDef[];
}

type CrudTarget = "sql" | "prisma" | "drizzle" | "kysely";

function parseColumns(input: string): { ok: true; columns: ColumnDef[] } | { ok: false; error: string } {
  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("--") && !l.startsWith("#"));

  const columns: ColumnDef[] = [];
  let i = 0;

  for (const line of lines) {
    i++;
    // id INT PRIMARY KEY AUTOINCREMENT
    // name TEXT NOT NULL DEFAULT ''
    // email TEXT UNIQUE NOT NULL
    // created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    const parts = line.split(/\s+/);
    if (parts.length < 2) return { ok: false, error: `Line ${i}: need at least name + type` };

    const col: ColumnDef = {
      name: parts[0],
      type: parts[1].toUpperCase(),
      nullable: true,
      isPk: false,
      isAuto: false,
      defaultValue: null,
    };

    for (let j = 2; j < parts.length; j++) {
      const p = parts[j].toUpperCase();
      if (p === "PRIMARY" && parts[j + 1]?.toUpperCase() === "KEY") {
        col.isPk = true;
        j++;
        continue;
      }
      if (p === "NOT" && parts[j + 1]?.toUpperCase() === "NULL") {
        col.nullable = false;
        j++;
        continue;
      }
      if (p === "AUTOINCREMENT" || p === "AUTO_INCREMENT" || p === "SERIAL") {
        col.isAuto = true;
        continue;
      }
      if (p === "UNIQUE") {
        continue;
      }
      if (p === "DEFAULT") {
        col.defaultValue = parts.slice(j + 1).join(" ");
        break;
      }
    }

    columns.push(col);
  }

  if (columns.length === 0) return { ok: false, error: "No columns defined" };
  return { ok: true, columns };
}

function generateSqlCRUD(table: TableDef): Record<string, string> {
  const { name, columns } = table;
  const pkCol = columns.find((c) => c.isPk) || columns[0];
  const colNames = columns.map((c) => c.name);
  const colList = colNames.join(", ");
  const paramList = columns.map((c) => `:${c.name}`).join(", ");
  const updateSet = columns
    .filter((c) => c.name !== pkCol.name)
    .map((c) => `${c.name} = :${c.name}`)
    .join(", ");

  return {
    SELECT_ALL: `SELECT * FROM ${name} ORDER BY ${pkCol.name} DESC;`,
    SELECT_BY_ID: `SELECT * FROM ${name} WHERE ${pkCol.name} = :${pkCol.name};`,
    INSERT: `INSERT INTO ${name} (${colList})
VALUES (${paramList})
RETURNING *;`,
    UPDATE: `UPDATE ${name}
SET ${updateSet}
WHERE ${pkCol.name} = :${pkCol.name}
RETURNING *;`,
    DELETE: `DELETE FROM ${name} WHERE ${pkCol.name} = :${pkCol.name};`,
    COUNT: `SELECT COUNT(*) AS total FROM ${name};`,
    PAGINATED: `SELECT * FROM ${name}
ORDER BY ${pkCol.name} DESC
LIMIT :limit OFFSET :offset;`,
  };
}

function generatePrisma(table: TableDef): string {
  const { name, columns } = table;
  const modelName = name.charAt(0).toUpperCase() + name.slice(1);
  const lines: string[] = [];

  lines.push(`model ${modelName} {`);

  for (const col of columns) {
    let type = col.type;
    // Map SQL types to Prisma
    const typeMap: Record<string, string> = {
      INT: "Int",
      INTEGER: "Int",
      BIGINT: "BigInt",
      TEXT: "String",
      VARCHAR: "String",
      CHAR: "String",
      BOOLEAN: "Boolean",
      BOOL: "Boolean",
      FLOAT: "Float",
      REAL: "Float",
      DOUBLE: "Float",
      DECIMAL: "Decimal",
      TIMESTAMP: "DateTime",
      DATETIME: "DateTime",
      DATE: "DateTime",
      TIME: "DateTime",
      JSON: "Json",
      JSONB: "Json",
      BLOB: "Bytes",
      UUID: "String",
      SERIAL: "Int",
    };
    type = typeMap[type] || type;

    if (col.isPk && col.isAuto) {
      lines.push(`  ${col.name}  ${type}  @id @default(autoincrement())`);
    } else if (col.isPk) {
      lines.push(`  ${col.name}  ${type}  @id`);
    } else if (col.defaultValue) {
      lines.push(`  ${col.name}  ${type}  @default(${col.defaultValue.replace(/^'|'$/g, "")})`);
    } else {
      lines.push(`  ${col.name}  ${type}${col.nullable ? "?" : ""}`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

function generateDrizzle(table: TableDef): string {
  const { name, columns } = table;
  const lines: string[] = [];

  lines.push(`import { pgTable, ${columns.map((c) => {
    const map: Record<string, string> = {
      INT: "integer", INTEGER: "integer", BIGINT: "bigint",
      TEXT: "text", VARCHAR: "varchar", CHAR: "char",
      BOOLEAN: "boolean", FLOAT: "doublePrecision",
      TIMESTAMP: "timestamp", DATETIME: "timestamp", DATE: "date",
      JSON: "json", JSONB: "jsonb", UUID: "uuid",
    };
    return map[c.type] || "text";
  }).filter((v, i, a) => a.indexOf(v) === i).join(", ")} } from "drizzle-orm/pg-core";`);

  lines.push("");
  lines.push(`export const ${name} = pgTable("${name}", {`);
  for (const col of columns) {
    const typeMap: Record<string, string> = {
      INT: "integer", INTEGER: "integer", BIGINT: "bigint",
      TEXT: "text", VARCHAR: `varchar(${col.type.includes("(") ? col.type.match(/\d+/)?.[0] || "255" : "255"})`,
      CHAR: "char", BOOLEAN: "boolean", BOOL: "boolean",
      FLOAT: "doublePrecision", DOUBLE: "doublePrecision",
      TIMESTAMP: "timestamp", DATETIME: "timestamp", DATE: "timestamp",
      JSON: "json", JSONB: "jsonb", UUID: "uuid",
      SERIAL: "serial",
    };
    let drizzleType = typeMap[col.type] || "text";
    const modifiers: string[] = [];

    if (col.isPk && col.isAuto) {
      modifiers.push("primaryKey()");
    } else if (col.isPk) {
      modifiers.push("primaryKey()");
    }
    if (!col.nullable && !col.isPk) {
      modifiers.push("notNull()");
    }
    if (col.defaultValue) {
      modifiers.push(`default(${col.defaultValue})`);
    }

    const modStr = modifiers.length > 0 ? `.${modifiers.join(".")}` : "";
    lines.push(`  ${col.name}: ${drizzleType}("${col.name}")${modStr},`);
  }
  lines.push("});");

  return lines.join("\n");
}

function generateKysely(table: TableDef): string {
  const { name, columns } = table;
  const typeName = name.charAt(0).toUpperCase() + name.slice(1);
  const lines: string[] = [];

  lines.push(`// Database interface`);
  lines.push(`interface Database {`);
  lines.push(`  ${name}: ${typeName}Table;`);
  lines.push(`}`);
  lines.push("");
  lines.push(`interface ${typeName}Table {`);
  for (const col of columns) {
    const typeMap: Record<string, string> = {
      INT: "number", INTEGER: "number", BIGINT: "bigint",
      TEXT: "string", VARCHAR: "string", CHAR: "string",
      BOOLEAN: "boolean", BOOL: "boolean",
      FLOAT: "number", DOUBLE: "number",
      TIMESTAMP: "Date", DATETIME: "Date", DATE: "Date",
      JSON: "unknown", JSONB: "unknown", UUID: "string",
      SERIAL: "Generated<number>",
    };
    let tsType = typeMap[col.type] || "string";
    if (col.isAuto && col.isPk) tsType = `Generated<${tsType}>`;
    if (col.nullable) tsType += " | null";
    lines.push(`  ${col.name}: ${tsType};`);
  }
  lines.push("}");
  lines.push("");
  lines.push(`// Queries`);
  lines.push(`// const result = await db`);
  lines.push(`//   .selectFrom("${name}")`);
  lines.push(`//   .selectAll()`);
  lines.push(`//   .execute();`);

  return lines.join("\n");
}

const GENERATORS: Record<string, (t: TableDef) => Record<string, string> | string> = {
  sql: (t) => generateSqlCRUD(t),
  prisma: (t) => ({ "schema.prisma": generatePrisma(t) }),
  drizzle: (t) => ({ "schema.ts": generateDrizzle(t) }),
  kysely: (t) => ({ "schema.ts": generateKysely(t) }),
};

export default function CrudGeneratorTool() {
  const [tableName, setTableName] = useState("users");
  const [columnsInput, setColumnsInput] = useState(
    `id INT PRIMARY KEY AUTOINCREMENT\nname TEXT NOT NULL\nemail TEXT NOT NULL UNIQUE\ncreated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  );
  const [target, setTarget] = useState<CrudTarget>("sql");
  const [output, setOutput] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = () => {
    const parsed = parseColumns(columnsInput);
    if (!parsed.ok) {
      setError(parsed.error);
      setOutput(null);
      return;
    }

    const table: TableDef = { name: tableName.trim() || "table", columns: parsed.columns };
    const gen = GENERATORS[target](table);

    if (typeof gen === "string") {
      setOutput({ output: gen });
    } else {
      setOutput(gen);
    }
    setError(null);
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const allOutputText = useMemo(() => {
    if (!output) return "";
    return Object.values(output).join("\n\n---\n\n");
  }, [output]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">CRUD Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate SQL CRUD operations and ORM schemas from a table definition.
        </p>
      </div>

      <div className="space-y-4">
        {/* Table name */}
        <div>
          <label className="block text-sm font-medium mb-2">Table Name</label>
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
            placeholder="users"
          />
        </div>

        {/* Columns input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Columns <span className="text-muted-foreground font-normal">(one per line: name TYPE [NOT NULL] [PRIMARY KEY] [AUTOINCREMENT] [DEFAULT val] [UNIQUE])</span>
          </label>
          <Textarea
            value={columnsInput}
            onChange={(e) => { setColumnsInput(e.target.value); setError(null); }}
            className="min-h-[140px] font-mono text-sm"
            placeholder="id INT PRIMARY KEY AUTOINCREMENT&#10;name TEXT NOT NULL&#10;email TEXT NOT NULL UNIQUE"
          />
        </div>

        {/* Target selector */}
        <div className="flex flex-wrap gap-2">
          {(["sql", "prisma", "drizzle", "kysely"] as const).map((t) => (
            <Button
              key={t}
              variant={target === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTarget(t)}
            >
              {t === "sql" ? "SQL" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        <Button onClick={handleGenerate} className="gap-2">
          <Database className="h-4 w-4" />
          Generate CRUD
        </Button>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <span>{error}</span>
            <p className="text-xs mt-1 text-muted-foreground">
              Format: <code className="text-xs">name TYPE [NOT NULL] [PRIMARY KEY] [AUTOINCREMENT] [DEFAULT val]</code>
            </p>
          </div>
        )}

        {output && (
          <div className="space-y-4">
            {Object.entries(output).map(([key, content]) => (
              <Card key={key}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-mono">{key}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(content, key)}
                      className="gap-1"
                    >
                      {copiedKey === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedKey === key ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto bg-muted p-4 rounded-lg">
                    {content}
                  </pre>
                </CardContent>
              </Card>
            ))}

            {/* Copy all button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(allOutputText, "__all__")}
              className="gap-1"
            >
              {copiedKey === "__all__" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedKey === "__all__" ? "Copied All" : "Copy All"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
