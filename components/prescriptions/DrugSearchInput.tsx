"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, Shield } from "lucide-react";

interface DMDProduct {
  id: string;
  vmpId: string;
  vtmId: string | null;
  name: string;
  brandName: string | null;
  formulation: string | null;
  strengthText: string | null;
  cdSchedule: string;
  highAlert: boolean;
  blackTriangle: boolean;
}

interface DrugSearchInputProps {
  onSelect: (drug: DMDProduct) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DrugSearchInput({
  onSelect,
  placeholder = "Search for a drug…",
  disabled,
}: DrugSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DMDProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/medications/search?q=${encodeURIComponent(q)}&limit=20`
      );
      const data = await res.json();
      setResults(data);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(drug: DMDProduct) {
    setQuery(drug.name);
    setOpen(false);
    onSelect(drug);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
          disabled={disabled}
          autoComplete="off"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-y-auto">
          {results.map((drug) => (
            <button
              key={drug.id}
              type="button"
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b last:border-0 transition-colors"
              onClick={() => handleSelect(drug)}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{drug.name}</span>
                {drug.brandName && (
                  <span className="text-xs text-muted-foreground">
                    ({drug.brandName})
                  </span>
                )}
                {drug.cdSchedule !== "NON_CD" && (
                  <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200 px-1.5 py-0">
                    <Shield className="w-3 h-3 mr-0.5" />
                    CD
                  </Badge>
                )}
                {drug.highAlert && (
                  <Badge className="text-xs bg-red-100 text-red-800 border-red-200 px-1.5 py-0">
                    <AlertTriangle className="w-3 h-3 mr-0.5" />
                    High Alert
                  </Badge>
                )}
                {drug.blackTriangle && (
                  <span className="text-xs font-bold text-orange-600">▼</span>
                )}
              </div>
              {(drug.formulation || drug.strengthText) && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {[drug.formulation, drug.strengthText]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-sm text-muted-foreground">
          No drugs found for &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
