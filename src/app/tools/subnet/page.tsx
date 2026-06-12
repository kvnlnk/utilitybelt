"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Globe } from "lucide-react";

interface SubnetResult {
  cidr: string;
  ip: string;
  mask: string;
  maskBits: number;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  wildcard: string;
  ipBin: string;
  maskBin: string;
  netBin: string;
}

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function longToIp(long: number): string {
  return [24, 16, 8, 0].map((s) => (long >>> s) & 0xff).join(".");
}

function binStr(num: number, bits = 8): string {
  return num.toString(2).padStart(bits, "0");
}

function calculateSubnet(ip: string, cidr: number): SubnetResult | null {
  try {
    const ipLong = ipToLong(ip);
    const mask = ~0 << (32 - cidr) >>> 0;
    const network = ipLong & mask;
    const broadcast = network | ~mask >>> 0;
    const total = 1 << (32 - cidr);

    return {
      cidr: `${ip}/${cidr}`,
      ip,
      mask: longToIp(mask),
      maskBits: cidr,
      network: longToIp(network),
      broadcast: longToIp(broadcast),
      firstHost: total >= 2 ? longToIp(network + 1) : "—",
      lastHost: total >= 2 ? longToIp(broadcast - 1) : "—",
      totalHosts: total,
      usableHosts: Math.max(0, total - 2),
      wildcard: longToIp(~mask >>> 0),
      ipBin: ip.split(".").map((o) => binStr(parseInt(o))).join("."),
      maskBin: longToIp(mask).split(".").map((o) => binStr(parseInt(o))).join("."),
      netBin: longToIp(network).split(".").map((o) => binStr(parseInt(o))).join("."),
    };
  } catch {
    return null;
  }
}

export default function SubnetTool() {
  const [ip, setIp] = useState("192.168.1.0");
  const [cidr, setCidr] = useState("24");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const n = parseInt(cidr, 10);
    if (isNaN(n) || n < 0 || n > 32) return null;
    return calculateSubnet(ip, n);
  }, [ip, cidr]);

  const handleCopy = async (text: string) => {
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Subnet / IP Calculator</h1>
        <p className="text-muted-foreground mt-1">
          Calculate network details from an IP address and CIDR prefix.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">IP Address</label>
            <Input value={ip} onChange={(e) => setIp(e.target.value)} className="font-mono" placeholder="192.168.1.0" />
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium mb-2">CIDR</label>
            <Input value={cidr} onChange={(e) => setCidr(e.target.value)} className="font-mono" placeholder="24" />
          </div>
        </div>

        {!result && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <span>Invalid IP or CIDR range (must be 0–32).</span>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            {/* Binary visualization */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Binary View</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-20 text-muted-foreground">IP</span>
                  <span className="text-foreground">{result.ipBin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 text-muted-foreground">Mask</span>
                  <span>
                    <span className="text-green-500">{result.maskBin.slice(0, result.maskBits)}</span>
                    <span className="text-muted-foreground/40">{result.maskBin.slice(result.maskBits)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 text-muted-foreground">Network</span>
                  <span className="text-green-500">{result.netBin}</span>
                </div>
              </CardContent>
            </Card>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Network", result.network],
                ["Broadcast", result.broadcast],
                ["First Host", result.firstHost],
                ["Last Host", result.lastHost],
                ["Subnet Mask", result.mask],
                ["Wildcard", result.wildcard],
              ].map(([label, val]) => (
                <Card key={label}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-mono font-medium">{val}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Hosts */}
            <Card>
              <CardContent className="py-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Usable Hosts</span>
                <span className="text-sm font-mono font-medium">{result.usableHosts.toLocaleString()}</span>
              </CardContent>
            </Card>

            {/* Copy cidr */}
            <Button variant="outline" size="sm" onClick={() => handleCopy(result.cidr)} className="gap-1">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy CIDR"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
