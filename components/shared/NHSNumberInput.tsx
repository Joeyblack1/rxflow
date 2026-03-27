"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { validateNHSNumber, formatNHSNumber } from "@/lib/nhs";
import { CheckCircle2, XCircle } from "lucide-react";

interface NHSNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function NHSNumberInput({ value, onChange, disabled }: NHSNumberInputProps) {
  const [touched, setTouched] = useState(false);

  const cleaned = value.replace(/\s/g, "");
  const isValid = cleaned.length === 10 && validateNHSNumber(cleaned);
  const isInvalid = touched && cleaned.length >= 10 && !isValid;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d\s]/g, "");
    onChange(raw);
  }

  function handleBlur() {
    setTouched(true);
    if (cleaned.length === 10) {
      onChange(formatNHSNumber(cleaned));
    }
  }

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder="123 456 7890"
        maxLength={12}
        className={`pr-9 ${
          isValid
            ? "border-green-500 focus-visible:ring-green-400"
            : isInvalid
            ? "border-red-500 focus-visible:ring-red-400"
            : ""
        }`}
      />
      {touched && cleaned.length >= 10 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      )}
      {isInvalid && (
        <p className="text-xs text-red-600 mt-1">
          Invalid NHS Number — Modulus 11 check failed
        </p>
      )}
    </div>
  );
}
