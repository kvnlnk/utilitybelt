"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Square, RotateCcw, Timer as TimerIcon, Clock } from "lucide-react";

type Mode = "stopwatch" | "countdown" | "timer";

function formatTime(ms: number, showMs = false): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  if (showMs) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(Math.floor(milliseconds / 10)).padStart(2, "0")}`;
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Web Audio API not available
  }
}

export default function TimerTool() {
  const [mode, setMode] = useState<Mode>("stopwatch");

  // Stopwatch state
  const [swElapsed, setSwElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swStartRef = useRef<number>(0);
  const swElapsedRef = useRef<number>(0);
  const swIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown state
  const [cdMinutes, setCdMinutes] = useState("5");
  const [cdSeconds, setCdSeconds] = useState("0");
  const [cdRemaining, setCdRemaining] = useState(5 * 60 * 1000);
  const [cdRunning, setCdRunning] = useState(false);
  const [cdDone, setCdDone] = useState(false);
  const cdEndRef = useRef<number>(0);
  const cdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer state
  const [tmHours, setTmHours] = useState("0");
  const [tmMinutes, setTmMinutes] = useState("30");
  const [tmRemaining, setTmRemaining] = useState(30 * 60 * 1000);
  const [tmRunning, setTmRunning] = useState(false);
  const [tmDone, setTmDone] = useState(false);
  const tmEndRef = useRef<number>(0);
  const tmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Stopwatch ---
  useEffect(() => {
    if (swRunning) {
      swStartRef.current = performance.now();
      swIntervalRef.current = setInterval(() => {
        const now = performance.now();
        setSwElapsed(swElapsedRef.current + (now - swStartRef.current));
      }, 10);
    } else {
      if (swIntervalRef.current) {
        clearInterval(swIntervalRef.current);
        swIntervalRef.current = null;
      }
    }
    return () => {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    };
  }, [swRunning]);

  const handleSwStart = () => {
    if (swRunning) {
      // Pause
      swElapsedRef.current += performance.now() - swStartRef.current;
      setSwRunning(false);
    } else {
      setSwRunning(true);
    }
  };

  const handleSwReset = () => {
    setSwRunning(false);
    swElapsedRef.current = 0;
    setSwElapsed(0);
  };

  // --- Countdown ---
  const stopCd = useCallback(() => {
    setCdRunning(false);
    if (cdIntervalRef.current) {
      clearInterval(cdIntervalRef.current);
      cdIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (cdRunning) {
      cdIntervalRef.current = setInterval(() => {
        const remaining = cdEndRef.current - performance.now();
        if (remaining <= 0) {
          setCdRemaining(0);
          setCdDone(true);
          playBeep();
          stopCd();
        } else {
          setCdRemaining(remaining);
        }
      }, 50);
    }
    return () => {
      if (cdIntervalRef.current) clearInterval(cdIntervalRef.current);
    };
  }, [cdRunning, stopCd]);

  const handleCdStart = () => {
    const totalMs =
      (parseInt(cdMinutes) || 0) * 60 * 1000 +
      (parseInt(cdSeconds) || 0) * 1000;
    if (totalMs <= 0) return;
    setCdDone(false);
    cdEndRef.current = performance.now() + totalMs;
    setCdRunning(true);
  };

  const handleCdPause = () => {
    if (cdRunning) {
      // Pause: save remaining time
      const remaining = cdEndRef.current - performance.now();
      setCdRemaining(Math.max(0, remaining));
      stopCd();
    } else {
      // Resume
      if (cdRemaining <= 0) return;
      cdEndRef.current = performance.now() + cdRemaining;
      setCdRunning(true);
    }
  };

  const handleCdReset = () => {
    stopCd();
    const totalMs =
      (parseInt(cdMinutes) || 0) * 60 * 1000 +
      (parseInt(cdSeconds) || 0) * 1000;
    setCdRemaining(totalMs);
    setCdDone(false);
  };

  // --- Timer ---
  const stopTm = useCallback(() => {
    setTmRunning(false);
    if (tmIntervalRef.current) {
      clearInterval(tmIntervalRef.current);
      tmIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (tmRunning) {
      tmIntervalRef.current = setInterval(() => {
        const remaining = tmEndRef.current - performance.now();
        if (remaining <= 0) {
          setTmRemaining(0);
          setTmDone(true);
          playBeep();
          stopTm();
        } else {
          setTmRemaining(remaining);
        }
      }, 50);
    }
    return () => {
      if (tmIntervalRef.current) clearInterval(tmIntervalRef.current);
    };
  }, [tmRunning, stopTm]);

  const handleTmStart = () => {
    const totalMs =
      (parseInt(tmHours) || 0) * 60 * 60 * 1000 +
      (parseInt(tmMinutes) || 0) * 60 * 1000;
    if (totalMs <= 0) return;
    setTmDone(false);
    tmEndRef.current = performance.now() + totalMs;
    setTmRunning(true);
  };

  const handleTmPause = () => {
    if (tmRunning) {
      const remaining = tmEndRef.current - performance.now();
      setTmRemaining(Math.max(0, remaining));
      stopTm();
    } else {
      if (tmRemaining <= 0) return;
      tmEndRef.current = performance.now() + tmRemaining;
      setTmRunning(true);
    }
  };

  const handleTmReset = () => {
    stopTm();
    const totalMs =
      (parseInt(tmHours) || 0) * 60 * 60 * 1000 +
      (parseInt(tmMinutes) || 0) * 60 * 1000;
    setTmRemaining(totalMs);
    setTmDone(false);
  };

  const renderStopwatch = () => (
    <div className="space-y-6 text-center">
      <div className="text-6xl font-mono font-bold tracking-wider tabular-nums py-8">
        {formatTime(swElapsed, true)}
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button
          size="lg"
          variant={swRunning ? "outline" : "default"}
          onClick={handleSwStart}
          className="gap-2 min-w-[120px]"
        >
          {swRunning ? (
            <>
              <Square className="h-4 w-4" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {swElapsed > 0 ? "Resume" : "Start"}
            </>
          )}
        </Button>
        <Button size="lg" variant="outline" onClick={handleSwReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );

  const renderCountdown = () => (
    <div className="space-y-6 text-center">
      {!cdRunning && cdRemaining === 0 && !cdDone ? (
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="flex flex-col items-center">
            <label className="text-sm text-muted-foreground mb-1">Minutes</label>
            <Input
              type="number"
              min="0"
              max="999"
              value={cdMinutes}
              onChange={(e) => setCdMinutes(e.target.value)}
              className="w-24 text-center text-2xl font-mono h-14"
            />
          </div>
          <span className="text-3xl font-mono mt-6">:</span>
          <div className="flex flex-col items-center">
            <label className="text-sm text-muted-foreground mb-1">Seconds</label>
            <Input
              type="number"
              min="0"
              max="59"
              value={cdSeconds}
              onChange={(e) => setCdSeconds(e.target.value)}
              className="w-24 text-center text-2xl font-mono h-14"
            />
          </div>
        </div>
      ) : (
        <div
          className={`text-6xl font-mono font-bold tracking-wider tabular-nums py-8 ${
            cdDone ? "text-destructive animate-pulse" : ""
          }`}
        >
          {formatTime(cdRemaining)}
        </div>
      )}
      {cdDone && (
        <p className="text-destructive font-semibold">Time&rsquo;s up!</p>
      )}
      <div className="flex items-center justify-center gap-3">
        {!cdRunning ? (
          <Button
            size="lg"
            onClick={cdRemaining > 0 && !cdDone ? handleCdPause : handleCdStart}
            className="gap-2 min-w-[120px]"
            disabled={
              parseInt(cdMinutes) === 0 &&
              parseInt(cdSeconds) === 0 &&
              cdRemaining === 0
            }
          >
            <Play className="h-4 w-4" />
            {cdRemaining > 0 && !cdDone ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button size="lg" variant="outline" onClick={handleCdPause} className="gap-2 min-w-[120px]">
            <Square className="h-4 w-4" />
            Pause
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={handleCdReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );

  const renderTimer = () => (
    <div className="space-y-6 text-center">
      {!tmRunning && tmRemaining === 0 && !tmDone ? (
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="flex flex-col items-center">
            <label className="text-sm text-muted-foreground mb-1">Hours</label>
            <Input
              type="number"
              min="0"
              max="999"
              value={tmHours}
              onChange={(e) => setTmHours(e.target.value)}
              className="w-24 text-center text-2xl font-mono h-14"
            />
          </div>
          <span className="text-3xl font-mono mt-6">:</span>
          <div className="flex flex-col items-center">
            <label className="text-sm text-muted-foreground mb-1">Minutes</label>
            <Input
              type="number"
              min="0"
              max="59"
              value={tmMinutes}
              onChange={(e) => setTmMinutes(e.target.value)}
              className="w-24 text-center text-2xl font-mono h-14"
            />
          </div>
        </div>
      ) : (
        <div
          className={`text-6xl font-mono font-bold tracking-wider tabular-nums py-8 ${
            tmDone ? "text-destructive animate-pulse" : ""
          }`}
        >
          {formatTime(tmRemaining)}
        </div>
      )}
      {tmDone && (
        <p className="text-destructive font-semibold">Time&rsquo;s up!</p>
      )}
      <div className="flex items-center justify-center gap-3">
        {!tmRunning ? (
          <Button
            size="lg"
            onClick={tmRemaining > 0 && !tmDone ? handleTmPause : handleTmStart}
            className="gap-2 min-w-[120px]"
            disabled={
              parseInt(tmHours) === 0 && parseInt(tmMinutes) === 0 && tmRemaining === 0
            }
          >
            <Play className="h-4 w-4" />
            {tmRemaining > 0 && !tmDone ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button size="lg" variant="outline" onClick={handleTmPause} className="gap-2 min-w-[120px]">
            <Square className="h-4 w-4" />
            Pause
          </Button>
        )}
        <Button size="lg" variant="outline" onClick={handleTmReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Timer & Stopwatch</h1>
        <p className="text-muted-foreground mt-1">
          Stopwatch with millisecond precision, countdown timer with alarm, and a simple timer.
        </p>
      </div>

      {/* Mode selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {(
            [
              { key: "stopwatch", label: "Stopwatch", icon: Clock },
              { key: "countdown", label: "Countdown", icon: TimerIcon },
              { key: "timer", label: "Timer", icon: Clock },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={mode === key ? "default" : "outline"}
              onClick={() => setMode(key)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          {mode === "stopwatch" && renderStopwatch()}
          {mode === "countdown" && renderCountdown()}
          {mode === "timer" && renderTimer()}
        </CardContent>
      </Card>
    </div>
  );
}
