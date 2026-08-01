"use client";

import React, { useState } from "react";
import { Sparkles, Trophy, X, Gift } from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "@/lib/audio";
import { Language, translations } from "@/lib/translations";

interface DailyLuckySpinModalProps {
  onSuccess: (updatedUser: any) => void;
  onClose: () => void;
  lang: Language;
}

export function DailyLuckySpinModal({ onSuccess, onClose, lang }: DailyLuckySpinModalProps) {
  const t = translations[lang];

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<any | null>(null);

  const prizes = [
    { label: "30 Coins", color: "#3b82f6", icon: "🪙" },
    { label: "60 Coins", color: "#10b981", icon: "💰" },
    { label: "120 Coins", color: "#f59e0b", icon: "🪙" },
    { label: "$0.50 Cash", color: "#8b5cf6", icon: "💵" },
    { label: "250 Jackpot", color: "#ec4899", icon: "👑" },
    { label: "$1.00 Golden", color: "#eab308", icon: "🏆" },
  ];

  const handleSpin = async () => {
    if (spinning) return;
    soundFx.playWhistle();
    setSpinning(true);
    setWonPrize(null);

    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      const prizeIndex = data.success ? data.rewardIndex : 0;

      // 6 segments, each is 60 deg
      const segmentAngle = 360 / prizes.length;
      const targetRotation = 360 * 5 + (360 - prizeIndex * segmentAngle - segmentAngle / 2);

      setRotation(targetRotation);

      setTimeout(() => {
        setSpinning(false);
        soundFx.playCoin();
        setWonPrize(data.reward || prizes[prizeIndex]);
        if (data.user) onSuccess(data.user);

        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
      }, 3500);
    } catch {
      setSpinning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-yellow-500/30 rounded-3xl shadow-2xl p-6 overflow-hidden space-y-5 text-white my-auto flex flex-col items-center text-center">
        <div className="w-full flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-yellow-400" />
            <h3 className="text-base font-black font-urdu">{t.spinWheel} (Daily Lucky Spin)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wheel Graphic */}
        <div className="relative w-64 h-64 my-2 flex items-center justify-center">
          {/* Pointer Marker at Top */}
          <div className="absolute -top-3 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[16px] border-t-yellow-400 filter drop-shadow-md" />

          {/* Rotating Wheel Container */}
          <div
            className="w-full h-full rounded-full border-4 border-yellow-400 shadow-2xl relative overflow-hidden transition-transform duration-[3500ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {prizes.map((p, idx) => {
              const angle = (360 / prizes.length) * idx;
              return (
                <div
                  key={idx}
                  className="absolute inset-0 flex items-start justify-center pt-3"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: "50% 50%",
                  }}
                >
                  <div
                    className="w-full h-full absolute inset-0 -z-10 opacity-90"
                    style={{
                      backgroundColor: p.color,
                      clipPath: "polygon(50% 50%, 25% 0%, 75% 0%)",
                    }}
                  />
                  <div className="flex flex-col items-center text-[10px] font-black text-slate-950 font-mono select-none drop-shadow">
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Hub */}
          <div className="absolute w-12 h-12 rounded-full bg-slate-950 border-2 border-yellow-400 flex items-center justify-center z-10 shadow-lg font-black text-xs text-yellow-400">
            ⚽
          </div>
        </div>

        {wonPrize && (
          <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 font-bold text-sm animate-bounce font-urdu">
            🎉 مبارک ہو! آپ نے جیتا: {wonPrize.label}
          </div>
        )}

        <button
          onClick={handleSpin}
          disabled={spinning}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-yellow-500/20 transition disabled:opacity-50 font-urdu flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          {spinning ? "گھوم رہا ہے..." : t.spinBtn}
        </button>
      </div>
    </div>
  );
}
