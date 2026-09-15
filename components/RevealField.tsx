"use client";

import { useState } from "react";
import clsx from "clsx";

export default function RevealField({ label, value }: { label: string; value: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setRevealed((r) => !r)}
      className="rounded-lg border border-gray-200 p-3 text-left"
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p className={clsx("mt-1 font-mono text-sm", !revealed && "sensitive-blur")}>{value}</p>
      <p className="mt-1 text-[11px] text-brand">{revealed ? "แตะเพื่อซ่อน" : "แตะเพื่อดู"}</p>
    </button>
  );
}
