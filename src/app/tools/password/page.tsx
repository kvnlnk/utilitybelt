"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check, RefreshCw } from "lucide-react";
import { generatePassword, calculatePasswordStrength, strengthLabel } from "@/lib/tools";

export default function PasswordTool() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const result = generatePassword({
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
    });
    if (!result.ok) {
      setError(result.error);
      setPassword("");
    } else {
      setError(null);
      setPassword(result.value);
    }
  };

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = password;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = password ? calculatePasswordStrength(password) : 0;
  const label = password ? strengthLabel(strength) : "";
  const strengthColor =
    strength < 20
      ? "bg-red-500"
      : strength < 40
        ? "bg-orange-500"
        : strength < 60
          ? "bg-yellow-500"
          : strength < 80
            ? "bg-lime-500"
            : "bg-green-500";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Password Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate strong, random passwords with customizable options.
        </p>
      </div>

      <div className="space-y-6">
        {/* Options */}
        <Card>
          <CardContent className="py-6 space-y-4">
            {/* Length slider */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Length: {length}
              </label>
              <input
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>8</span>
                <span>64</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">A-Z (Uppercase)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">a-z (Lowercase)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={numbers}
                  onChange={(e) => setNumbers(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">0-9 (Numbers)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={symbols}
                  onChange={(e) => setSymbols(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">!@#$ (Symbols)</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Generate button */}
        <Button onClick={handleGenerate} size="lg" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Generate Password
        </Button>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {/* Password output */}
        {password && (
          <div className="space-y-4">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <Input
                    value={password}
                    readOnly
                    className="font-mono text-lg flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleCopy}
                    className="gap-1 shrink-0"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Strength indicator */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Strength</span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Score: {strength}/100
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
