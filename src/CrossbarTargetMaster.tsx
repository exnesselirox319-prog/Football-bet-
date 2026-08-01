"use client";

import React, { useState } from "react";
import { Target, Trophy, Play, RotateCcw, Shield, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "@/lib/audio";
import { Language, translations } from "@/lib/translations";

interface CrossbarTargetMasterProps {
  user: {
    username: string;
    displayName: string;
    balanceUsd: string;
    coins: number;
    selectedBall?: string;
  };
  onMatchFinish: (matchResult: {
    gameMode: string;
    stakeUsd: number;
    stakeCoins: number;
    playerScore: number;
    opponentScore: number;
    difficulty: string;
    opponentName: string;
  }) => Promise<void>;
  lang: Language;
}

export function CrossbarTargetMaster({ user, onMatchFinish, lang }: CrossbarTargetMasterProps) {
  const t = translations[lang];

  const [stakeUsd, setStakeUsd] = useState<number>(5);
  const [gameState, setGameState] = useState<"betting" | "playing" | "game_over">("betting");
  const [shotsLeft, setShotsLeft] = useState<number>(3);
  const [totalMultiplierWon, setTotalMultiplierWon] = useState<number>(0);
  const [shotFeedback, setShotFeedback] = useState<string | null>(null);
  const [targetHits, setTargetHits] = useState<number[]>([]);

  const startChallenge = () => {
    soundFx.playWhistle();
    setShotsLeft(3);
    setTotalMultiplierWon(0);
    setTargetHits([]);
    setShotFeedback(null);
    setGameState("playing");
  };

  const shootTarget = (targetName: string, multiplier: number, successRate: number) => {
    if (shotsLeft <= 0) return;
    soundFx.playKick();

    const isHit = Math.random() < successRate;
    const nextShots = shotsLeft - 1;
    setShotsLeft(nextShots);

    if (isHit) {
      if (multiplier >= 5) soundFx.playGoal();
      else soundFx.playCoin();

      setShotFeedback(`🎯 HIT! ${targetName} (+${multiplier}x)`);
      setTotalMultiplierWon((prev) => prev + multiplier);
      setTargetHits((prev) => [...prev, multiplier]);

      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {
        // ignore
      }
    } else {
      soundFx.playPostHit();
      setShotFeedback("⚡ MISSED THE TARGET!");
    }

    if (nextShots <= 0) {
      setTimeout(() => {
        finishChallenge(isHit ? totalMultiplierWon + multiplier : totalMultiplierWon);
      }, 1200);
    }
  };

  const finishChallenge = async (finalMult: number) => {
    setGameState("game_over");

    await onMatchFinish({
      gameMode: "crossbar_challenge",
      stakeUsd: stakeUsd,
      stakeCoins: 0,
      playerScore: finalMult > 0 ? Math.round(finalMult) : 0,
      opponentScore: finalMult > 0 ? 0 : 1,
      difficulty: "pro",
      opponentName: "Target Crossbar",
    });
  };

  const wonAmountUsd = (stakeUsd * totalMultiplierWon).toFixed(2);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-white">
      {/* Top Header */}
      <div className="w-full bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Target className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-extrabold text-lg text-purple-400">{t.crossbarChallenge}</h2>
            <p className="text-xs text-slate-400 font-urdu">{t.crossbarDesc}</p>
          </div>
        </div>

        {gameState === "playing" && (
          <div className="flex items-center gap-4 bg-slate-900 px-4 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Shots: {shotsLeft}/3</span>
            <span className="font-mono font-bold text-yellow-400">Mult: {totalMultiplierWon}x</span>
          </div>
        )}
      </div>

      {/* Target Arena Goal Frame */}
      <div className="relative w-full h-[360px] bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 flex items-center justify-center p-6">
        {/* Goal Frame Box */}
        <div className="relative w-full max-w-2xl h-56 border-4 border-white/80 rounded-t-xl bg-slate-950/60 shadow-2xl flex flex-col justify-between p-4">
          {/* Top Crossbar Area */}
          <div className="flex justify-between items-start w-full">
            {/* Top Left Target 3x */}
            <button
              onClick={() => shootTarget("Top Left 90 Corner", 3, 0.55)}
              disabled={gameState !== "playing" || shotsLeft <= 0}
              className="w-16 h-16 rounded-full bg-purple-500/30 hover:bg-purple-500/80 active:scale-95 border-2 border-purple-400 shadow-[0_0_15px_#c084fc] flex flex-col items-center justify-center text-xs font-black transition disabled:opacity-40"
            >
              <span>3x</span>
              <span className="text-[10px]">CORNER</span>
            </button>

            {/* Center Crossbar Target 5x */}
            <button
              onClick={() => shootTarget("Center Crossbar Bar", 5, 0.4)}
              disabled={gameState !== "playing" || shotsLeft <= 0}
              className="px-6 py-2 rounded-xl bg-amber-500/30 hover:bg-amber-500/80 active:scale-95 border-2 border-amber-400 shadow-[0_0_15px_#fbbf24] flex items-center gap-1.5 text-xs font-black transition disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CROSSBAR 5x</span>
            </button>

            {/* Top Right Target 3x */}
            <button
              onClick={() => shootTarget("Top Right 90 Corner", 3, 0.55)}
              disabled={gameState !== "playing" || shotsLeft <= 0}
              className="w-16 h-16 rounded-full bg-purple-500/30 hover:bg-purple-500/80 active:scale-95 border-2 border-purple-400 shadow-[0_0_15px_#c084fc] flex flex-col items-center justify-center text-xs font-black transition disabled:opacity-40"
            >
              <span>3x</span>
              <span className="text-[10px]">CORNER</span>
            </button>
          </div>

          {/* Golden Bullseye Moving Target 10x */}
          <div className="flex justify-center w-full">
            <button
              onClick={() => shootTarget("Golden Bullseye Jackpot", 10, 0.25)}
              disabled={gameState !== "playing" || shotsLeft <= 0}
              className="w-20 h-20 rounded-full bg-yellow-500/30 hover:bg-yellow-500 active:scale-95 border-4 border-yellow-300 shadow-[0_0_25px_#fde047] animate-pulse flex flex-col items-center justify-center text-xs font-black text-yellow-200 hover:text-slate-950 transition disabled:opacity-40"
            >
              <span className="text-sm">🎯 10x</span>
              <span className="text-[9px] font-bold">BULLSEYE</span>
            </button>
          </div>

          {/* Feedback */}
          {shotFeedback && (
            <div className="absolute inset-x-0 bottom-2 text-center text-lg font-black text-yellow-300 drop-shadow-md">
              {shotFeedback}
            </div>
          )}
        </div>
      </div>

      {/* Betting / Result Bar */}
      {gameState === "betting" && (
        <div className="w-full p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Stake ($):</span>
            {[2, 5, 10, 20].map((val) => (
              <button
                key={val}
                onClick={() => setStakeUsd(val)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                  stakeUsd === val
                    ? "bg-purple-500/20 text-purple-400 border-purple-500"
                    : "bg-slate-900 text-slate-400 border-slate-800"
                }`}
              >
                ${val}
              </button>
            ))}
          </div>

          <button
            onClick={startChallenge}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-sm shadow-lg transition flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Challenge
          </button>
        </div>
      )}

      {gameState === "game_over" && (
        <div className="w-full p-6 bg-slate-950 border-t border-slate-800 flex flex-col items-center gap-3 text-center">
          <h3 className="text-2xl font-black text-yellow-400">
            {totalMultiplierWon > 0 ? `Challenge Completed! Won $${wonAmountUsd} 🏆` : "No Targets Hit! 💔"}
          </h3>
          <p className="text-xs text-slate-400">Total Multiplier: {totalMultiplierWon}x • Owner Rake Logged</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={startChallenge}
              className="px-6 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={() => setGameState("betting")}
              className="px-6 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
