"use client";

import React, { useState, useEffect } from "react";
import { Tv, Play, CheckCircle, X, Sparkles, ShieldCheck } from "lucide-react";
import { soundFx } from "@/lib/audio";
import { Language, translations } from "@/lib/translations";

interface RewardedAdModalProps {
  onSuccess: (updatedUser: any) => void;
  onClose: () => void;
  lang: Language;
}

export function RewardedAdModal({ onSuccess, onClose, lang }: RewardedAdModalProps) {
  const t = translations[lang];

  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  const startAd = () => {
    soundFx.playClick();
    setIsPlaying(true);
    setCountdown(8);
  };

  useEffect(() => {
    if (!isPlaying || isCompleted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeAd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isCompleted]);

  const completeAd = async () => {
    setIsCompleted(true);
    soundFx.playCoin();

    try {
      const res = await fetch("/api/ads/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adType: "rewarded_video" }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.user) onSuccess(data.user);
        setRewardMsg(t.adWatchedSuccess);
      }
    } catch {
      setRewardMsg("Network error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl p-6 overflow-hidden space-y-5 text-white my-auto flex flex-col items-center text-center">
        <div className="w-full flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-black font-urdu">Sponsor Video Ad (ایڈ دیکھ کر کوائنز پائیں)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Display */}
        <div className="w-full h-48 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden p-4">
          {!isPlaying ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
              <p className="text-xs text-slate-400 font-urdu">{t.watchAdGetCoins}</p>
            </div>
          ) : isCompleted ? (
            <div className="flex flex-col items-center space-y-2 text-emerald-400 animate-bounce">
              <CheckCircle className="w-12 h-12" />
              <span className="text-sm font-bold font-urdu">{rewardMsg || "+25 Coins Credited!"}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 w-full">
              <div className="text-xs font-mono text-purple-300 font-bold bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800">
                Watching Sponsor Video: {countdown}s remaining
              </div>
              <div className="w-3/4 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${((8 - countdown) / 8) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-urdu">
                مالک کو اس اشتہار سے $0.05 ایڈ ریونیو منتقل ہو رہا ہے
              </p>
            </div>
          )}
        </div>

        {!isPlaying && (
          <button
            onClick={startAd}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-purple-500/20 transition flex items-center justify-center gap-2 font-urdu"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>اشتہار دیکھیں اور 25 کوائنز حاصل کریں</span>
          </button>
        )}

        {isCompleted && (
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl transition"
          >
            Collect & Return to Game
          </button>
        )}
      </div>
    </div>
  );
}
