"use client";

import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Analysis {
  chars: number;
  charsNoSpaces: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
  avgWordLength: number;
  longestWord: string;
  shortestWord: string;
  charFrequency: [string, number][];
  wordFrequency: [string, number][];
}

function analyze(text: string): Analysis {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split("\n").length : 0;
  const sentences = text ? text.split(/[.!?]+/).filter(Boolean).length : 0;
  const paragraphs = text ? text.split(/\n\s*\n/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const speakingTime = Math.max(1, Math.ceil(words / 150));

  const wordList = text.trim() ? text.trim().toLowerCase().split(/\s+/) : [];
  const avgWordLength = words > 0
    ? Math.round((wordList.reduce((a, w) => a + w.length, 0) / words) * 10) / 10
    : 0;
  const longestWord = wordList.reduce((a, b) => a.length >= b.length ? a : b, "");
  const shortestWord = wordList.reduce((a, b) => a.length <= b.length && a.length > 0 ? a : b, wordList[0] || "");

  // Char frequency (top 10)
  const charFreqMap = new Map<string, number>();
  for (const ch of text.toLowerCase()) {
    charFreqMap.set(ch, (charFreqMap.get(ch) || 0) + 1);
  }
  const charFrequency = [...charFreqMap.entries()]
    .filter(([ch]) => !/\s/.test(ch))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Word frequency (top 15)
  const wordFreqMap = new Map<string, number>();
  for (const w of wordList) {
    const clean = w.replace(/[^a-zA-Z0-9]/g, "");
    if (clean) wordFreqMap.set(clean, (wordFreqMap.get(clean) || 0) + 1);
  }
  const wordFrequency = [...wordFreqMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  return {
    chars, charsNoSpaces, words, lines, sentences, paragraphs,
    readingTime, speakingTime, avgWordLength, longestWord, shortestWord,
    charFrequency, wordFrequency,
  };
}

export default function TextAnalyzerTool() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const analysis = useMemo(() => analyze(text), [text]);

  const handleCopy = async (text: string, label: string) => {
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
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Text Analyzer</h1>
        <p className="text-muted-foreground mt-1">
          Analyze text: word count, character frequency, reading time, and more.
        </p>
      </div>

      <div className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here..."
          className="min-h-[150px] text-sm"
        />

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ["Characters", analysis.chars.toLocaleString()],
            ["Words", analysis.words.toLocaleString()],
            ["Sentences", analysis.sentences.toLocaleString()],
            ["Lines", analysis.lines.toLocaleString()],
            ["Paragraphs", analysis.paragraphs.toLocaleString()],
            ["Reading Time", `${analysis.readingTime} min`],
            ["Speaking Time", `${analysis.speakingTime} min`],
            ["Avg Word Length", `${analysis.avgWordLength} chars`],
          ].map(([label, val]) => (
            <Card key={label}>
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold">{val}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Longest/shortest words */}
        {analysis.words > 0 && (
          <div className="flex gap-3">
            <Card className="flex-1">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground mb-1">Longest Word</p>
                <p className="text-sm font-mono">{analysis.longestWord}</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground mb-1">Shortest Word</p>
                <p className="text-sm font-mono">{analysis.shortestWord}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Character frequency */}
        {analysis.charFrequency.length > 0 && (
          <Card>
            <CardContent className="py-3">
              <p className="text-sm font-medium mb-2">Character Frequency (top 10)</p>
              <div className="space-y-1">
                {analysis.charFrequency.map(([ch, count]) => {
                  const maxCount = analysis.charFrequency[0][1];
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={ch} className="flex items-center gap-2 text-sm">
                      <span className="w-6 font-mono text-center">{ch === " " ? "␣" : ch}</span>
                      <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-muted-foreground font-mono text-xs">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Word frequency */}
        {analysis.wordFrequency.length > 0 && (
          <Card>
            <CardContent className="py-3">
              <p className="text-sm font-medium mb-2">Word Frequency (top 15)</p>
              <div className="space-y-1">
                {analysis.wordFrequency.map(([word, count]) => {
                  const maxCount = analysis.wordFrequency[0][1];
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={word} className="flex items-center gap-2 text-sm">
                      <span className="w-24 truncate font-mono text-xs">{word}</span>
                      <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-muted-foreground font-mono text-xs">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
