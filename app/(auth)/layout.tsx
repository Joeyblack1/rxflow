import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header
        className="h-14 flex items-center px-6"
        style={{ backgroundColor: "#005EB8" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-sm font-bold" style={{ color: "#005EB8" }}>
              Rx
            </span>
          </div>
          <span className="text-white font-bold text-lg tracking-wide">
            RxFlow NHS
          </span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
