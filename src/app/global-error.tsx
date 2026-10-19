"use client";

import React, { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { SimantrixMark } from "@/components/brand/simantrix-logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Simantrix Dashboard Global Error]:", error);
  }, [error]);

  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none antialiased">
        {/* Ambient background glows */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 size-96 rounded-full bg-rose-500/15 blur-[140px]" />
          <div className="absolute bottom-1/4 -right-20 size-96 rounded-full bg-indigo-500/15 blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-md w-full bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-2xl">
          <div className="relative mb-4 flex justify-center">
            <SimantrixMark size={56} className="rounded-2xl shadow-xl shadow-indigo-500/25" />
            <span className="absolute -bottom-1 right-[calc(50%-28px-4px)] grid size-5.5 place-items-center rounded-full bg-rose-600 text-white shadow-md">
              <AlertTriangle className="size-3" />
            </span>
          </div>

          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
            System Level Exception
          </span>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Simantrix Kernel Interruption
          </h2>

          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The dashboard core encountered an unrecoverable root layout exception.
          </p>

          {error?.digest && (
            <p className="mt-2 text-[10px] font-mono text-slate-500 bg-white/5 py-1 px-2 rounded border border-white/5 inline-block">
              Digest: {error.digest}
            </p>
          )}

          <div className="mt-6 w-full">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
