"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { logoutAction } from "@/lib/actions/auth";

const WARNING_MS = 15 * 60 * 1000; // 15 minutes
const LOGOUT_MS = 20 * 60 * 1000;  // 20 minutes

const EVENTS = ["mousemove", "keydown", "pointerdown", "scroll", "touchstart"];

export function InactivityGuard() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = () => {
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  };

  const startCountdown = useCallback(() => {
    setSecondsLeft(300);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    countdownTimer.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (countdownTimer.current) clearInterval(countdownTimer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const reset = useCallback(() => {
    clearAll();
    setShowWarning(false);
    warnTimer.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
      logoutTimer.current = setTimeout(async () => {
        await logoutAction();
      }, LOGOUT_MS - WARNING_MS);
    }, WARNING_MS);
  }, [startCountdown]);

  const stayActive = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    reset();
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearAll();
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [reset]);

  if (!showWarning) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="inactivity-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center space-y-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: "#FFF4CC" }}
        >
          <svg className="w-7 h-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
          </svg>
        </div>
        <div>
          <h2 id="inactivity-title" className="text-lg font-bold text-gray-900">
            Still there?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            You've been inactive. For patient data security, you'll be signed out in:
          </p>
          <p className="text-3xl font-mono font-bold mt-3" style={{ color: "#DA291C" }}>
            {mins}:{secs.toString().padStart(2, "0")}
          </p>
        </div>
        <button
          onClick={stayActive}
          className="w-full py-2.5 rounded-lg text-white font-semibold text-sm"
          style={{ backgroundColor: "#005EB8" }}
          autoFocus
        >
          I&apos;m still here
        </button>
        <button
          onClick={() => logoutAction()}
          className="w-full py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          Sign out now
        </button>
      </div>
    </div>
  );
}
