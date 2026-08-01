"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, RotateCcw, Shield, Trophy, Flame, Zap, DollarSign, Volume2 } from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "@/lib/audio";
import { Language, translations } from "@/lib/translations";

interface PenaltyShootoutProps {
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

export function PenaltyShootout({ user, onMatchFinish, lang }: PenaltyShootoutProps) {
  const t = translations[lang];

  // Game Configuration State
  const [stakeType, setStakeType] = useState<"usd" | "coins">("usd");
  const [stakeUsd, setStakeUsd] = useState<number>(5);
  const [stakeCoins, setStakeCoins] = useState<number>(100);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "pro">("medium");

  // Game Engine State
  const [gameState, setGameState] = useState<"betting" | "playing" | "round_ended" | "match_over">("betting");
  const [currentRound, setCurrentRound] = useState<number>(1);
  const totalRounds = 5;
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [keeperSaves, setKeeperSaves] = useState<number>(0);
  const [roundHistory, setRoundHistory] = useState<("goal" | "save" | "miss")[]>([]);

  // Ball & Shot State
  const [isAiming, setIsAiming] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [shotInProgress, setShotInProgress] = useState<boolean>(false);
  const [shotFeedback, setShotFeedback] = useState<string | null>(null);
  const [feedbackColor, setFeedbackColor] = useState<string>("text-emerald-400");

  // Ball Position & Animation
  // Coords in percentages: penalty spot is around { x: 50, y: 88, scale: 1.0 }
  const [ballPos, setBallPos] = useState<{ x: number; y: number; scale: number; rotation: number }>({
    x: 50,
    y: 88,
    scale: 1.0,
    rotation: 0,
  });

  // Keeper State: x in %, y in %, dive: 'idle' | 'dive_left' | 'dive_right' | 'dive_top_left' | 'dive_top_right' | 'center'
  const [keeperState, setKeeperState] = useState<{
    x: number;
    y: number;
    dive: string;
    diving: boolean;
  }>({
    x: 50,
    y: 42,
    dive: "idle",
    diving: false,
  });

  const canvasAreaRef = useRef<HTMLDivElement>(null);

  // Reset ball to penalty spot
  const resetBall = useCallback(() => {
    setBallPos({ x: 50, y: 88, scale: 1.0, rotation: 0 });
    setKeeperState({ x: 50, y: 42, dive: "idle", diving: false });
    setIsAiming(false);
    setDragStart(null);
    setDragCurrent(null);
    setShotInProgress(false);
    setShotFeedback(null);
  }, []);

  const startMatch = () => {
    soundFx.playWhistle();
    setCurrentRound(1);
    setPlayerScore(0);
    setKeeperSaves(0);
    setRoundHistory([]);
    setGameState("playing");
    resetBall();
  };

  // Drag Aim Handling
  const handlePointerDown = (e: React.PointerEvent) => {
    if (gameState !== "playing" || shotInProgress) return;
    const rect = canvasAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if pointer is near penalty spot (bottom 30%)
    if (y > 65) {
      setIsAiming(true);
      setDragStart({ x, y });
      setDragCurrent({ x, y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isAiming || !dragStart || shotInProgress) return;
    const rect = canvasAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDragCurrent({ x, y });
  };

  const handlePointerUp = () => {
    if (!isAiming || !dragStart || !dragCurrent || shotInProgress) {
      setIsAiming(false);
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    const dx = dragCurrent.x - dragStart.x;
    const dy = dragCurrent.y - dragStart.y;

    // If swipe was upward (shooting toward goal)
    if (dy < -4) {
      // Calculate target goal position
      // Aim target in goal area: Goal x ranges from 24% to 76%, y ranges from 22% to 48%
      const targetX = 50 + dx * 2.2;
      const targetY = 36 + dy * 1.8;
      const curveAmount = dx * 0.5;

      executeShot(targetX, targetY, curveAmount);
    }

    setIsAiming(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  // Quick click button shot helper for easy tap
  const quickShot = (targetKey: "top_left" | "top_right" | "bottom_left" | "bottom_right" | "center") => {
    if (gameState !== "playing" || shotInProgress) return;
    let tx = 50;
    let ty = 34;
    let curve = 0;

    if (targetKey === "top_left") {
      tx = 30;
      ty = 25;
      curve = -8;
    } else if (targetKey === "top_right") {
      tx = 70;
      ty = 25;
      curve = 8;
    } else if (targetKey === "bottom_left") {
      tx = 32;
      ty = 42;
      curve = -4;
    } else if (targetKey === "bottom_right") {
      tx = 68;
      ty = 42;
      curve = 4;
    } else {
      tx = 50;
      ty = 32;
      curve = 0;
    }

    executeShot(tx, ty, curve);
  };

  const executeShot = (targetX: number, targetY: number, curve: number) => {
    setShotInProgress(true);
    soundFx.playKick();

    // AI Goalkeeper Decision
    // Keeper dive target
    const keeperDiveOdds: ("left_high" | "left_low" | "center" | "right_high" | "right_low")[] = [
      "left_high",
      "left_low",
      "center",
      "right_high",
      "right_low",
    ];

    // Difficulty adjusts keeper intelligence
    let keeperTarget = keeperDiveOdds[Math.floor(Math.random() * keeperDiveOdds.length)];
    if (difficulty === "pro" && Math.random() > 0.3) {
      // Pro keeper guesses closer to actual target
      if (targetX < 45) keeperTarget = targetY < 33 ? "left_high" : "left_low";
      else if (targetX > 55) keeperTarget = targetY < 33 ? "right_high" : "right_low";
      else keeperTarget = "center";
    }

    // Determine Keeper coordinates
    let kx = 50;
    let ky = 42;
    if (keeperTarget === "left_high") {
      kx = 33;
      ky = 27;
    } else if (keeperTarget === "left_low") {
      kx = 35;
      ky = 42;
    } else if (keeperTarget === "right_high") {
      kx = 67;
      ky = 27;
    } else if (keeperTarget === "right_low") {
      kx = 65;
      ky = 42;
    } else {
      kx = 50;
      ky = 34;
    }

    // Trigger keeper dive animation
    setKeeperState({
      x: kx,
      y: ky,
      dive: keeperTarget,
      diving: true,
    });

    // Animate ball in flight
    let step = 0;
    const totalSteps = 16;
    const interval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const easeProgress = Math.pow(progress, 0.85);

      // Curve parabolic arc
      const currentX = 50 + (targetX - 50) * easeProgress + Math.sin(progress * Math.PI) * curve;
      const currentY = 88 + (targetY - 88) * easeProgress;
      const currentScale = 1.0 - progress * 0.62; // shrinks as it gets further away

      setBallPos({
        x: currentX,
        y: currentY,
        scale: Math.max(0.38, currentScale),
        rotation: progress * 720,
      });

      if (step >= totalSteps) {
        clearInterval(interval);
        evaluateOutcome(targetX, targetY, kx, ky);
      }
    }, 28);
  };

  const evaluateOutcome = (ballX: number, ballY: number, keeperX: number, keeperY: number) => {
    // Goal bounds: X between 26% and 74%, Y between 21% and 48%
    const inGoalX = ballX >= 26 && ballX <= 74;
    const inGoalY = ballY >= 21 && ballY <= 48;

    // Post / Crossbar hit check
    const isCrossbar = Math.abs(ballY - 21) < 2.5 && ballX >= 25 && ballX <= 75;
    const isPost = (Math.abs(ballX - 25.5) < 2 || Math.abs(ballX - 74.5) < 2) && ballY >= 21 && ballY <= 48;

    // Keeper Catch/Save radius check
    const distToKeeper = Math.hypot(ballX - keeperX, ballY - keeperY);
    const isSaved = distToKeeper < (difficulty === "pro" ? 11 : difficulty === "medium" ? 8.5 : 6.5);

    let result: "goal" | "save" | "miss" = "miss";

    if (isCrossbar || isPost) {
      soundFx.playPostHit();
      setShotFeedback(t.postHitText);
      setFeedbackColor("text-yellow-400");
      result = "miss";
    } else if (isSaved) {
      soundFx.playSave();
      setShotFeedback(t.savedText);
      setFeedbackColor("text-rose-400");
      result = "save";
      setKeeperSaves((prev) => prev + 1);
    } else if (inGoalX && inGoalY) {
      soundFx.playGoal();
      setShotFeedback(t.goalText);
      setFeedbackColor("text-emerald-400");
      result = "goal";
      setPlayerScore((prev) => prev + 1);

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#f59e0b", "#ffffff"],
        });
      } catch {
        // ignore
      }
    } else {
      setShotFeedback(t.missedText);
      setFeedbackColor("text-red-400");
      result = "miss";
    }

    setRoundHistory((prev) => [...prev, result]);

    // Next round or match finished
    setTimeout(() => {
      if (currentRound >= totalRounds) {
        finishMatch(result === "goal" ? playerScore + 1 : playerScore);
      } else {
        setCurrentRound((prev) => prev + 1);
        resetBall();
      }
    }, 1500);
  };

  const finishMatch = async (finalPlayerScore: number) => {
    // Opponent score based on keeper performance & difficulty
    // AI kicks simulated
    const aiGoals = Math.floor(Math.random() * 3) + (difficulty === "pro" ? 2 : 1);
    const isPlayerVictory = finalPlayerScore > aiGoals;

    setGameState("match_over");

    if (isPlayerVictory) {
      soundFx.playCoin();
      try {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      } catch {
        // ignore
      }
    }

    await onMatchFinish({
      gameMode: "penalty_shootout",
      stakeUsd: stakeType === "usd" ? stakeUsd : 0,
      stakeCoins: stakeType === "coins" ? stakeCoins : 0,
      playerScore: finalPlayerScore,
      opponentScore: aiGoals,
      difficulty,
      opponentName: "AI Goalkeeper Pro",
    });
  };

  // Potential Payout Calculation
  const currentStake = stakeType === "usd" ? stakeUsd : stakeCoins;
  const houseRakePct = 10;
  const potentialWinAmount =
    stakeType === "usd"
      ? (stakeUsd * 2 * (1 - houseRakePct / 100)).toFixed(2)
      : Math.round(stakeCoins * 2 * (1 - houseRakePct / 100));

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-white">
      {/* Top Match Bar */}
      <div className="w-full bg-slate-950/90 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Trophy className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-extrabold text-lg tracking-wide text-emerald-400 flex items-center gap-2">
              {t.penaltyShootout}
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase font-mono">
                {difficulty}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-urdu">{t.penaltyShootoutDesc}</p>
          </div>
        </div>

        {/* Round Tracker */}
        {gameState !== "betting" && (
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Round {currentRound}/{totalRounds}:</span>
            <div className="flex gap-1.5">
              {Array.from({ length: totalRounds }).map((_, idx) => {
                const roundResult = roundHistory[idx];
                return (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      roundResult === "goal"
                        ? "bg-emerald-500 text-white"
                        : roundResult === "save"
                        ? "bg-rose-500 text-white"
                        : roundResult === "miss"
                        ? "bg-red-700 text-white"
                        : idx === currentRound - 1
                        ? "bg-yellow-500 animate-pulse text-slate-900"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {roundResult === "goal" ? "✓" : roundResult ? "✕" : idx + 1}
                  </div>
                );
              })}
            </div>
            <span className="ml-2 font-mono font-bold text-emerald-400 text-sm">
              Goals: {playerScore}
            </span>
          </div>
        )}

        {/* House Rake Notice Badge */}
        <div className="text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-600/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>10% Platform Rake to Owner Vault</span>
        </div>
      </div>

      {/* Main Pitch Stadium & Goal Canvas Area */}
      <div
        ref={canvasAreaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] select-none touch-none overflow-hidden bg-radial from-slate-900 via-emerald-950 to-slate-950 flex items-center justify-center cursor-crosshair"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, #064e3b 0%, #022c22 45%, #090d16 100%)",
        }}
      >
        {/* Stadium Grandstand / Floodlight Atmosphere */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-slate-950/90 to-transparent pointer-events-none flex justify-between px-6 pt-2">
          {/* Stadium Lights Left */}
          <div className="flex gap-1.5 opacity-60">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_15px_#fef08a]" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_15px_#fef08a]" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_15px_#fef08a]" />
          </div>
          {/* Animated Crowd Silhouette */}
          <div className="text-xs text-slate-500 tracking-widest font-mono uppercase opacity-50">
            GOALRUSH ARENA 2026 • 60,000 SPECTATORS
          </div>
          {/* Stadium Lights Right */}
          <div className="flex gap-1.5 opacity-60">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_15px_#fef08a]" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_15px_#fef08a]" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-200 shadow-[0_0_15px_#fef08a]" />
          </div>
        </div>

        {/* Grass Pitch Stripes (Perspective Illusion) */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="w-full h-1/4 bg-emerald-800/20" />
          <div className="w-full h-1/4 bg-emerald-900/30" />
          <div className="w-full h-1/4 bg-emerald-700/20" />
          <div className="w-full h-1/4 bg-emerald-900/40" />
        </div>

        {/* Penalty Box Line Markers */}
        <div
          className="absolute border-2 border-white/25 rounded-t-lg pointer-events-none"
          style={{
            top: "22%",
            left: "18%",
            right: "18%",
            height: "70%",
          }}
        />

        {/* 3D Football Goal Frame & Mesh Net */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "20%",
            left: "24%",
            width: "52%",
            height: "28%",
          }}
        >
          {/* Net Depth Shadow Backing */}
          <div className="absolute inset-0 bg-slate-950/80 rounded-t-sm shadow-inner" />

          {/* Goal Net Grid Pattern */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />

          {/* Goal Crossbar (White Shiny Top) */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-slate-200 via-white to-slate-200 shadow-[0_2px_10px_rgba(255,255,255,0.6)] rounded-sm" />
          {/* Left Goal Post */}
          <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-b from-white to-slate-300 shadow-[2px_0_8px_rgba(0,0,0,0.5)] rounded-sm" />
          {/* Right Goal Post */}
          <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-gradient-to-b from-white to-slate-300 shadow-[-2px_0_8px_rgba(0,0,0,0.5)] rounded-sm" />
        </div>

        {/* Dynamic Goalkeeper */}
        <div
          className={`absolute transition-all duration-300 ease-out pointer-events-none flex flex-col items-center justify-center ${
            keeperState.diving ? "scale-95" : ""
          }`}
          style={{
            left: `${keeperState.x}%`,
            top: `${keeperState.y}%`,
            transform: `translate(-50%, -50%) ${
              keeperState.dive === "left_high"
                ? "rotate(-35deg) translate(-20px, -15px)"
                : keeperState.dive === "left_low"
                ? "rotate(-45deg) translate(-25px, 10px)"
                : keeperState.dive === "right_high"
                ? "rotate(35deg) translate(20px, -15px)"
                : keeperState.dive === "right_low"
                ? "rotate(45deg) translate(25px, 10px)"
                : keeperState.dive === "center"
                ? "scale(1.1) translateY(-10px)"
                : "translate(0, 0)"
            }`,
          }}
        >
          {/* Goalkeeper Avatar & Gloves */}
          <div className="relative flex flex-col items-center">
            {/* Gloves Left & Right */}
            <div className="flex justify-between w-14 absolute -top-1">
              <span className="text-xl filter drop-shadow-md">🧤</span>
              <span className="text-xl filter drop-shadow-md">🧤</span>
            </div>
            {/* Jersey Body */}
            <div className="w-8 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-t-xl shadow-lg border border-amber-300 flex items-center justify-center font-bold text-slate-900 text-xs mt-3">
              1
            </div>
            {/* Goalkeeper Shorts */}
            <div className="w-7 h-5 bg-slate-900 rounded-b-md" />
            <span className="text-[10px] bg-slate-900/80 px-1.5 py-0.5 rounded text-amber-300 font-mono mt-0.5 font-bold border border-slate-700">
              KEEPER
            </span>
          </div>
        </div>

        {/* Penalty Spot Dot */}
        <div
          className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_white] pointer-events-none"
          style={{ left: "50%", top: "88%", transform: "translate(-50%, -50%)" }}
        />

        {/* Aim Drag Trajectory Line */}
        {isAiming && dragStart && dragCurrent && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={`${dragStart.x}%`}
              y1={`${dragStart.y}%`}
              x2={`${50 + (dragCurrent.x - dragStart.x) * 2}%`}
              y2={`${88 + (dragCurrent.y - dragStart.y) * 2}%`}
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
            {/* Target Crosshair */}
            <circle
              cx={`${50 + (dragCurrent.x - dragStart.x) * 2}%`}
              cy={`${88 + (dragCurrent.y - dragStart.y) * 2}%`}
              r="14"
              fill="rgba(16, 185, 129, 0.3)"
              stroke="#10b981"
              strokeWidth="2"
            />
          </svg>
        )}

        {/* The Football */}
        <div
          className="absolute pointer-events-none z-20 flex items-center justify-center transition-transform"
          style={{
            left: `${ballPos.x}%`,
            top: `${ballPos.y}%`,
            transform: `translate(-50%, -50%) scale(${ballPos.scale}) rotate(${ballPos.rotation}deg)`,
          }}
        >
          {/* Ball Shadow on Grass */}
          <div
            className="absolute rounded-full bg-slate-950/70 blur-[2px]"
            style={{
              width: "36px",
              height: "14px",
              top: "22px",
              transform: `scale(${ballPos.scale})`,
            }}
          />

          {/* Ball Sprite */}
          <div className="relative text-3xl filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.7)] flex items-center justify-center">
            {user.selectedBall === "Fireball Meteor" ? "🔥" : user.selectedBall === "Golden Trophy Ball" ? "🏆" : "⚽"}
          </div>
        </div>

        {/* Real-time Feedback Text (GOAL, SAVED, MISSED) */}
        {shotFeedback && (
          <div className="absolute z-30 flex flex-col items-center animate-bounce pointer-events-none">
            <span
              className={`text-4xl sm:text-5xl font-black uppercase tracking-wider filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] ${feedbackColor}`}
            >
              {shotFeedback}
            </span>
          </div>
        )}

        {/* Aim Helper Overlay on First Load */}
        {gameState === "playing" && !isAiming && !shotInProgress && (
          <div className="absolute bottom-16 inset-x-0 flex flex-col items-center pointer-events-none text-center px-4 animate-pulse">
            <span className="px-4 py-1.5 rounded-full bg-slate-900/90 text-emerald-400 text-xs sm:text-sm font-bold border border-emerald-500/40 shadow-xl font-urdu">
              {t.swipeToShoot}
            </span>
          </div>
        )}
      </div>

      {/* Quick Corner Targets Buttons (Mobile & PC Friendly One-Tap) */}
      {gameState === "playing" && !shotInProgress && (
        <div className="w-full bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            Quick Corner Aim:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => quickShot("top_left")}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition border border-slate-700"
            >
              ↖ Top Left
            </button>
            <button
              onClick={() => quickShot("top_right")}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition border border-slate-700"
            >
              ↗ Top Right
            </button>
            <button
              onClick={() => quickShot("center")}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition border border-slate-700"
            >
              ⬆ Center
            </button>
            <button
              onClick={() => quickShot("bottom_left")}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition border border-slate-700"
            >
              ↙ Bottom Left
            </button>
            <button
              onClick={() => quickShot("bottom_right")}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white transition border border-slate-700"
            >
              ↘ Bottom Right
            </button>
          </div>
        </div>
      )}

      {/* Pre-Match Betting & Stake Control Bar */}
      {gameState === "betting" && (
        <div className="w-full p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Stake Currency Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-urdu">{t.stakeAmount}:</span>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setStakeType("usd")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    stakeType === "usd"
                      ? "bg-emerald-500 text-slate-950 shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  💵 USD ($)
                </button>
                <button
                  onClick={() => setStakeType("coins")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    stakeType === "coins"
                      ? "bg-yellow-500 text-slate-950 shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  🪙 Coins
                </button>
              </div>
            </div>

            {/* Quick Stake Values */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {stakeType === "usd" ? (
                [1, 5, 10, 25, 50].map((val) => (
                  <button
                    key={val}
                    onClick={() => setStakeUsd(val)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                      stakeUsd === val
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    ${val}
                  </button>
                ))
              ) : (
                [50, 100, 250, 500, 1000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setStakeCoins(val)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                      stakeCoins === val
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {val}
                  </button>
                ))
              )}
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(["easy", "medium", "pro"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition ${
                    difficulty === lvl
                      ? lvl === "pro"
                        ? "bg-rose-600 text-white"
                        : "bg-emerald-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Potential Win and Start Match Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-[11px] text-slate-400 font-urdu">{t.potentialWin}</div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {stakeType === "usd" ? `$${potentialWinAmount}` : `${potentialWinAmount} Coins`}
                </div>
              </div>
              <div className="text-xs text-slate-500 border-l border-slate-800 pl-3">
                <span className="text-emerald-400 font-semibold font-urdu">مالک کا ہاؤس ریونیو:</span> 10%
                (${(stakeType === "usd" ? stakeUsd * 0.2 : (stakeCoins * 0.2) / 100).toFixed(2)})
              </div>
            </div>

            <button
              onClick={startMatch}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition flex items-center gap-2 font-urdu"
            >
              <Play className="w-4 h-4 fill-current" />
              {t.playNow}
            </button>
          </div>
        </div>
      )}

      {/* Match Over Summary Modal */}
      {gameState === "match_over" && (
        <div className="w-full p-6 bg-slate-950 border-t border-slate-800 flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2 text-2xl font-black">
            {playerScore > keeperSaves ? (
              <span className="text-emerald-400 font-urdu flex items-center gap-2">
                <Trophy className="w-7 h-7 text-yellow-400" />
                {t.youWon} (+{stakeType === "usd" ? `$${potentialWinAmount}` : `${potentialWinAmount} Coins`})
              </span>
            ) : (
              <span className="text-rose-400 font-urdu">{t.youLost}</span>
            )}
          </div>

          <div className="flex gap-6 text-sm font-mono bg-slate-900 px-6 py-2 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400">Goals Scored:</span>{" "}
              <span className="font-bold text-emerald-400">{playerScore}</span>
            </div>
            <div>
              <span className="text-slate-400">Keeper Saves:</span>{" "}
              <span className="font-bold text-rose-400">{keeperSaves}</span>
            </div>
            <div>
              <span className="text-slate-400">Owner Rake:</span>{" "}
              <span className="font-bold text-yellow-400">10% Logged</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startMatch}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow transition flex items-center gap-2 font-urdu"
            >
              <RotateCcw className="w-4 h-4" />
              {t.rematch}
            </button>
            <button
              onClick={() => setGameState("betting")}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition font-urdu"
            >
              {t.returnLobby}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
