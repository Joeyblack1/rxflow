"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const LOGOUT_MS = 20 * 60 * 1000; // must match InactivityGuard
const EVENTS = ["mousemove", "keydown", "pointerdown", "scroll", "touchstart"];

export function SessionTimer() {
  const [secondsLeft, setSecondsLeft] = useState(LOGOUT_MS / 1000);
  const lastActivity = useRef(Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  useEffect(() => {
    EVENTS.forEach((e) => window.addEventListener(e, resetActivity, { passive: true }));
    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivity.current;
      const remaining = Math.max(0, LOGOUT_MS - elapsed);
      setSecondsLeft(Math.ceil(remaining / 1000));
    }, 10000); // update every 10s — no need for per-second updates in TopBar
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      EVENTS.forEach((e) => window.removeEventListener(e, resetActivity));
    };
  }, [resetActivity]);

  const mins = Math.ceil(secondsLeft / 60);

  if (mins > 15) return null; // only show when approaching warning threshold

  const urgent = mins <= 5;

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        urgent
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
      title="Time until auto-logout due to inactivity"
    >
      Auto-logout in {mins} min
    </span>
  );
}
