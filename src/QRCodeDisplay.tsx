"use client";

import React from "react";

interface QRCodeDisplayProps {
  text: string;
  size?: number;
  label?: string;
}

export function QRCodeDisplay({ text, size = 160, label }: QRCodeDisplayProps) {
  // Simple clean SVG QR code visual with encoded pseudo-matrix based on text hash
  // ensuring clean visual representation without external script failure
  const cells = 21;
  const hash = Array.from(text).reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);

  const grid: boolean[][] = [];
  for (let r = 0; r < cells; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cells; c++) {
      // Corner alignment patterns
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= cells - 7;
      const isBottomLeft = r >= cells - 7 && c < 7;

      if (isTopLeft) {
        row.push(r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
      } else if (isTopRight) {
        row.push(r === 0 || r === 6 || c === cells - 7 || c === cells - 1 || (r >= 2 && r <= 4 && c >= cells - 5 && c <= cells - 3));
      } else if (isBottomLeft) {
        row.push(r === cells - 7 || r === cells - 1 || c === 0 || c === 6 || (r >= cells - 5 && r <= cells - 3 && c >= 2 && c <= 4));
      } else {
        const seed = (hash * (r + 1) * 31 + c * 17 + (r ^ c)) % 100;
        row.push(seed > 45);
      }
    }
    grid.push(row);
  }

  const cellSize = size / cells;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-xl border border-slate-200">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
        <rect width={size} height={size} fill="#ffffff" />
        {grid.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.5}
                height={cellSize + 0.5}
                fill="#0f172a"
                rx={cellSize > 8 ? 1 : 0}
              />
            ) : null
          )
        )}
      </svg>
      {label && <span className="mt-2 text-xs font-bold text-slate-700 text-center">{label}</span>}
    </div>
  );
}
