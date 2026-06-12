"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Globe, Wifi, WifiOff, Monitor, Clock, Smartphone } from "lucide-react";

type IpInfo = {
  ip: string;
  loading: boolean;
  error: string | null;
};

type BrowserInfo = {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  online: boolean;
  localStorageAvailable: boolean;
  sessionStorageAvailable: boolean;
  cookiesEnabled: boolean;
  hardwareConcurrency: number;
  deviceMemory: string;
};

function getBrowserInfo(): BrowserInfo {
  const ls = typeof localStorage !== "undefined";
  const ss = typeof sessionStorage !== "undefined";
  let lsOk = false;
  let ssOk = false;
  try {
    if (ls) { localStorage.setItem("_test_", "1"); localStorage.removeItem("_test_"); lsOk = true; }
    if (ss) { sessionStorage.setItem("_test_", "1"); sessionStorage.removeItem("_test_"); ssOk = true; }
  } catch {
    // Storage unavailable
  }

  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const memStr = mem !== undefined ? `${mem} GB` : "Unknown";

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${window.screen.width} × ${window.screen.height} (${window.screen.colorDepth}-bit)`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    online: navigator.onLine,
    localStorageAvailable: lsOk,
    sessionStorageAvailable: ssOk,
    cookiesEnabled: navigator.cookieEnabled,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: memStr,
  };
}

export default function IpInfoTool() {
  const [ipInfo, setIpInfo] = useState<IpInfo>({
    ip: "",
    loading: true,
    error: null,
  });
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Gather browser info (client-side only)
    setBrowserInfo(getBrowserInfo());
    setOnline(navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Fetch public IP
    const fetchIp = async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setIpInfo({ ip: data.ip, loading: false, error: null });
      } catch {
        setIpInfo({
          ip: "",
          loading: false,
          error: "Could not fetch public IP. Check your internet connection.",
        });
      }
    };

    fetchIp();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const browserCards = browserInfo && (
    <>
      {/* Browser Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-5 w-5 text-primary" />
            <span className="font-medium">Browser & System Info</span>
          </div>
          <div className="space-y-3 text-sm">
            <InfoRow label="User Agent" value={browserInfo.userAgent} mono />
            <InfoRow label="Language" value={browserInfo.language} />
            <InfoRow label="Platform / OS" value={browserInfo.platform} />
            <InfoRow label="Screen Resolution" value={browserInfo.screenResolution} />
            <InfoRow label="Timezone" value={browserInfo.timezone} />
            <InfoRow
              label="Hardware Concurrency"
              value={`${browserInfo.hardwareConcurrency} CPU cores`}
            />
            <InfoRow label="Device Memory" value={browserInfo.deviceMemory} />
          </div>
        </CardContent>
      </Card>

      {/* Storage & Capabilities */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="h-5 w-5 text-primary" />
            <span className="font-medium">Storage & Capabilities</span>
          </div>
          <div className="space-y-3 text-sm">
            <InfoRow
              label="localStorage"
              value={browserInfo.localStorageAvailable ? "Available" : "Unavailable"}
              good={browserInfo.localStorageAvailable}
            />
            <InfoRow
              label="sessionStorage"
              value={browserInfo.sessionStorageAvailable ? "Available" : "Unavailable"}
              good={browserInfo.sessionStorageAvailable}
            />
            <InfoRow
              label="Cookies"
              value={browserInfo.cookiesEnabled ? "Enabled" : "Disabled"}
              good={browserInfo.cookiesEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">IP & Network Info</h1>
        <p className="text-muted-foreground mt-1">
          View your public IP address and detailed browser/network information.
        </p>
      </div>

      <div className="space-y-6">
        {/* Public IP */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span className="font-medium">Public IP Address</span>
              </div>
              <div>
                {ipInfo.loading ? (
                  <span className="text-muted-foreground text-sm animate-pulse">
                    Fetching...
                  </span>
                ) : ipInfo.error ? (
                  <span className="text-destructive text-sm flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {ipInfo.error}
                  </span>
                ) : (
                  <span className="font-mono text-lg font-bold">{ipInfo.ip}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network status */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              {online ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-destructive" />
              )}
              <span className="font-medium">Network Status</span>
              <span
                className={`ml-auto text-sm font-medium ${
                  online ? "text-green-500" : "text-destructive"
                }`}
              >
                {online ? "Online" : "Offline"}
              </span>
            </div>
          </CardContent>
        </Card>

        {browserCards}

        {/* Current time */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">Current Local Time</span>
              <span className="ml-auto font-mono text-sm">
                {new Date().toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  good,
}: {
  label: string;
  value: string;
  mono?: boolean;
  good?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 border-b border-border/50 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground shrink-0 min-w-[160px]">{label}</span>
      <span
        className={`break-all ${
          mono ? "font-mono text-xs" : ""
        } ${good === true ? "text-green-500" : good === false ? "text-destructive" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
