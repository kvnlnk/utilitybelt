"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAiSettings } from "@/lib/ai";
import { saveAiSettings, clearAiSettings } from "@/lib/ai";
import type { AiProvider } from "@/lib/ai";
import { Key, Check, AlertCircle, Eye, EyeOff } from "lucide-react";

const STORAGE_KEY = "ai_api_key";
const STORAGE_PROVIDER = "ai_provider";

export default function AiSettings() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<AiProvider>("gemini");
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const { key, provider: p } = getAiSettings();
    setApiKey(key);
    setProvider(p);
  }, []);

  const handleSave = () => {
    saveAiSettings({ key: apiKey, provider });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setApiKey("");
    clearAiSettings();
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, msg: "No API key entered." });
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      if (provider === "gemini") {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Say 'OK' and nothing else." }] }],
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }
        setTestResult({ ok: true, msg: "Connection successful! Gemini API is working." });
      } else {
        // OpenAI compatible
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Say 'OK' and nothing else." }],
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }
        setTestResult({ ok: true, msg: "Connection successful! OpenAI API is working." });
      }
    } catch (e: any) {
      setTestResult({ ok: false, msg: e.message || "Connection failed." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your AI API key for AI-powered tools. Your key is stored in your browser only.
        </p>
      </div>

      <div className="space-y-4">
        {/* Provider selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Provider</label>
          <div className="flex gap-2">
            <Button
              variant={provider === "gemini" ? "default" : "outline"}
              size="sm"
              onClick={() => setProvider("gemini")}
            >
              Google Gemini (Free)
            </Button>
            <Button
              variant={provider === "openai" ? "default" : "outline"}
              size="sm"
              onClick={() => setProvider("openai")}
            >
              OpenAI
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {provider === "gemini"
              ? "Get a free Gemini API key at aistudio.google.com/apikey — no credit card needed."
              : "Get an OpenAI API key at platform.openai.com/api-keys."}
          </p>
        </div>

        {/* API key input */}
        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  provider === "gemini"
                    ? "AIzaSy..."
                    : "sk-proj-..."
                }
                className="pl-9 pr-9 font-mono text-sm"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSave} className="gap-2">
            {saved ? <Check className="h-4 w-4" /> : <Key className="h-4 w-4" />}
            {saved ? "Saved!" : "Save Key"}
          </Button>
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            {testing ? "Testing..." : "Test Connection"}
          </Button>
          {apiKey && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>

        {/* Test result */}
        {testResult && (
          <Card>
            <CardContent className="py-3">
              <div
                className={`flex items-start gap-2 text-sm ${
                  testResult.ok ? "text-green-600 dark:text-green-400" : "text-destructive"
                }`}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{testResult.msg}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💡 About AI Tools</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              The AI-powered tools use your API key directly from the browser — no data goes through our servers.
            </p>
            <p className="text-xs">
              Available AI tools: <strong>AI SQL Generator</strong>, <strong>AI Regex Builder</strong>, <strong>AI Code Explainer</strong>, <strong>AI Mock Data Generator</strong>
            </p>
            <p className="text-xs">
              Your key is stored in <code className="text-xs bg-muted px-1 rounded">localStorage</code> and never sent anywhere except the API provider directly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
