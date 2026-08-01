"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Medal, X, Flame } from "lucide-react";
import { Language, translations } from "@/lib/translations";

interface LeaderboardModalProps {
  onClose: () => void;
  lang: Language;
}

export function LeaderboardModal({ onClose, lang }: LeaderboardModalProps) {
  const t = translations[lang];
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setLeaders(data.leaderboard || []);
      })
      .catch((err) => console.error("Leaderboard load err:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-yellow-500/30 rounded-3xl shadow-2xl p-6 overflow-hidden space-y-5 text-white my-auto flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="text-base font-black font-urdu">{t.leaderboard} (Top Strikers)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 p-1">
          {leaders.map((item, idx) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                idx === 0
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                  : idx === 1
                  ? "bg-slate-800/80 border-slate-700 text-slate-200"
                  : idx === 2
                  ? "bg-amber-900/20 border-amber-800/40 text-amber-400"
                  : "bg-slate-950 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center font-black text-xs">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </span>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{item.avatar}</span>
                    <span>{item.displayName || item.username}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Matches: {item.matchesPlayed} • Wins: {item.matchesWon}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-black text-emerald-400 text-sm">
                  ⚽ {item.goalsScored} Goals
                </div>
                <div className="text-[10px] text-slate-500">
                  Won ${item.totalWon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
