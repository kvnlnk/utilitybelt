"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Upload, AlertCircle } from "lucide-react";
import { imageToBase64 } from "@/lib/tools";

export default function ImageBase64Tool() {
  const [base64, setBase64] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      setBase64("");
      setPreviewUrl("");
      setFileName("");
      return;
    }

    setError(null);
    setFileName(file.name);

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Convert to base64
    const result = await imageToBase64(file);
    if (!result.ok) {
      setError(result.error);
      setBase64("");
      setPreviewUrl("");
    } else {
      setBase64(result.value);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleCopy = async () => {
    if (!base64) return;
    try {
      await navigator.clipboard.writeText(base64);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = base64;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClickUpload = () => {
    inputRef.current?.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Image to Base64</h1>
        <p className="text-muted-foreground mt-1">
          Convert an image file to a base64 data URL. Supports PNG, JPEG, GIF, WebP, SVG, and BMP.
        </p>
      </div>

      <div className="space-y-4">
        {/* Drop zone / Upload */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 cursor-pointer transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">
            {dragging ? "Drop your image here" : "Drag & drop an image, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports PNG, JPEG, GIF, WebP, SVG, BMP
          </p>
        </div>

        {/* Preview */}
        {previewUrl && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg border object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{fileName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Converted to base64 data URL
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Base64 output */}
        {base64 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Base64 Data URL</label>
              <Button variant="ghost" size="xs" onClick={handleCopy} className="gap-1">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <Textarea
              value={base64}
              readOnly
              className="min-h-[150px] font-mono text-xs break-all"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Length: {base64.length.toLocaleString()} characters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
