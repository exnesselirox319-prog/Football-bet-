"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Trophy, Zap, Shield, Flame, Activity } from "lucide-react";
import confetti from "canvas-confetti";
import { soundFx } from "@/lib/audio";
import { Language, translations } from "@/lib/translations";

interface SoccerMatch1v1Props {
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

export function SoccerMatch1v1({ user, onMatchFinish, lang }: SoccerMatch1v1Props) {
  const t = translations[lang];

  // Match Configuration
  const [stakeType, setStakeType] = useState<"usd" | "coins">("usd");
  const [stakeUsd, setStakeUsd] = useState<number>(5);
  const [stakeCoins, setStakeCoins] = useState<number>(100);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "pro">("medium");

  // Match State
  const [gameState, setGameState] = useState<"betting" | "playing" | "game_over">("betting");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [commentary, setCommentary] = useState<string>("Ready for Kick-off!");

  // Canvas Reference & Game Loop
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Entities
  const gameStateRef = useRef({
    player: { x: 150, y: 200, vx: 0, vy: 0, speed: 4.5, radius: 16, color: "#3b82f6" },
    opponent: { x: 650, y: 200, vx: 0, vy: 0, speed: 3.8, radius: 16, color: "#ef4444" },
    ball: { x: 400, y: 200, vx: 0, vy: 0, radius: 10, friction: 0.985 },
    pitchWidth: 800,
    pitchHeight: 400,
    goalHeight: 120,
    keys: { w: false, a: false, s: false, d: false, space: false, shift: false },
    touchDir: { x: 0, y: 0 },
    isSprinting: false,
    scoreP: 0,
    scoreO: 0,
    active: false,
  });

  const resetPositions = () => {
    const s = gameStateRef.current;
    s.player.x = 200;
    s.player.y = 200;
    s.player.vx = 0;
    s.player.vy = 0;
    s.opponent.x = 600;
    s.opponent.y = 200;
    s.opponent.vx = 0;
    s.opponent.vy = 0;
    s.ball.x = 400;
    s.ball.y = 200;
    s.ball.vx = 0;
    s.ball.vy = 0;
  };

  const startMatch = () => {
    soundFx.playWhistle();
    setPlayerScore(0);
    setOpponentScore(0);
    setTimeLeft(60);
    gameStateRef.current.scoreP = 0;
    gameStateRef.current.scoreO = 0;
    gameStateRef.current.active = true;
    resetPositions();
    setGameState("playing");
    setCommentary("Match started! High press from both sides!");
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const keys = gameStateRef.current.keys;
      if (k === "w" || k === "arrowup") keys.w = true;
      if (k === "a" || k === "arrowleft") keys.a = true;
      if (k === "s" || k === "arrowdown") keys.s = true;
      if (k === "d" || k === "arrowright") keys.d = true;
      if (k === " ") {
        keys.space = true;
        shootBall();
      }
      if (k === "shift") keys.shift = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const keys = gameStateRef.current.keys;
      if (k === "w" || k === "arrowup") keys.w = false;
      if (k === "a" || k === "arrowleft") keys.a = false;
      if (k === "s" || k === "arrowdown") keys.s = false;
      if (k === "d" || k === "arrowright") keys.d = false;
      if (k === " ") keys.space = false;
      if (k === "shift") keys.shift = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Shoot button trigger
  const shootBall = () => {
    const s = gameStateRef.current;
    const dx = s.ball.x - s.player.x;
    const dy = s.ball.y - s.player.y;
    const dist = Math.hypot(dx, dy);

    // If player is close to ball, kick with power toward opponent goal (right side x = 800)
    if (dist < s.player.radius + s.ball.radius + 15) {
      soundFx.playKick();
      const angle = Math.atan2(200 - s.ball.y + (Math.random() * 40 - 20), 800 - s.ball.x);
      const power = 13 + (s.keys.shift ? 4 : 0);
      s.ball.vx = Math.cos(angle) * power;
      s.ball.vy = Math.sin(angle) * power;
      setCommentary("Boom! Powerful shot on goal!");
    }
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endMatch();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const s = gameStateRef.current;
      if (!s.active) return;

      // 1. Update Player position
      let moveX = 0;
      let moveY = 0;
      if (s.keys.a) moveX -= 1;
      if (s.keys.d) moveX += 1;
      if (s.keys.w) moveY -= 1;
      if (s.keys.s) moveY += 1;

      // Mobile joystick input
      if (s.touchDir.x !== 0 || s.touchDir.y !== 0) {
        moveX = s.touchDir.x;
        moveY = s.touchDir.y;
      }

      const currentSpeed = s.keys.shift || s.isSprinting ? s.player.speed * 1.4 : s.player.speed;
      if (moveX !== 0 || moveY !== 0) {
        const len = Math.hypot(moveX, moveY);
        s.player.x += (moveX / len) * currentSpeed;
        s.player.y += (moveY / len) * currentSpeed;
      }

      // Constrain player within pitch
      s.player.x = Math.max(s.player.radius, Math.min(s.pitchWidth - s.player.radius, s.player.x));
      s.player.y = Math.max(s.player.radius, Math.min(s.pitchHeight - s.player.radius, s.player.y));

      // 2. Update AI Opponent behavior
      const aiSpeed = difficulty === "pro" ? 4.2 : difficulty === "medium" ? 3.6 : 3.0;
      const targetBallX = s.ball.x;
      const targetBallY = s.ball.y;

      const aiDx = targetBallX - s.opponent.x;
      const aiDy = targetBallY - s.opponent.y;
      const aiDist = Math.hypot(aiDx, aiDy);

      if (aiDist > 5) {
        s.opponent.x += (aiDx / aiDist) * aiSpeed;
        s.opponent.y += (aiDy / aiDist) * aiSpeed;
      }

      // AI kick when close
      if (aiDist < s.opponent.radius + s.ball.radius + 8) {
        // AI shoots toward player's goal (left side x = 0, y = 200)
        soundFx.playKick();
        const shootAngle = Math.atan2(200 - s.ball.y + (Math.random() * 50 - 25), 0 - s.ball.x);
        s.ball.vx = Math.cos(shootAngle) * (10 + Math.random() * 3);
        s.ball.vy = Math.sin(shootAngle) * (10 + Math.random() * 3);
      }

      // Constrain AI within pitch
      s.opponent.x = Math.max(s.opponent.radius, Math.min(s.pitchWidth - s.opponent.radius, s.opponent.x));
      s.opponent.y = Math.max(s.opponent.radius, Math.min(s.pitchHeight - s.opponent.radius, s.opponent.y));

      // 3. Ball Physics & Collisions with players
      // Player ball touch
      const pDist = Math.hypot(s.ball.x - s.player.x, s.ball.y - s.player.y);
      if (pDist < s.player.radius + s.ball.radius) {
        const angle = Math.atan2(s.ball.y - s.player.y, s.ball.x - s.player.x);
        s.ball.vx = Math.cos(angle) * (currentSpeed + 2);
        s.ball.vy = Math.sin(angle) * (currentSpeed + 2);
      }

      // Ball Movement
      s.ball.x += s.ball.vx;
      s.ball.y += s.ball.vy;
      s.ball.vx *= s.ball.friction;
      s.ball.vy *= s.ball.friction;

      // Pitch Boundaries and Wall Bounces
      // Top & Bottom walls
      if (s.ball.y - s.ball.radius < 0) {
        s.ball.y = s.ball.radius;
        s.ball.vy *= -0.8;
      }
      if (s.ball.y + s.ball.radius > s.pitchHeight) {
        s.ball.y = s.pitchHeight - s.ball.radius;
        s.ball.vy *= -0.8;
      }

      const goalTop = (s.pitchHeight - s.goalHeight) / 2;
      const goalBottom = (s.pitchHeight + s.goalHeight) / 2;

      // Check Goal Scored in Left Goal (Opponent Goal / AI scores on Player)
      if (s.ball.x - s.ball.radius <= 0) {
        if (s.ball.y >= goalTop && s.ball.y <= goalBottom) {
          // Goal for Opponent
          soundFx.playGoal();
          s.scoreO += 1;
          setOpponentScore(s.scoreO);
          setCommentary("Goal for the opponent! What a strike!");
          resetPositions();
        } else {
          s.ball.x = s.ball.radius;
          s.ball.vx *= -0.8;
        }
      }

      // Check Goal Scored in Right Goal (Player scores on Opponent)
      if (s.ball.x + s.ball.radius >= s.pitchWidth) {
        if (s.ball.y >= goalTop && s.ball.y <= goalBottom) {
          // Goal for Player
          soundFx.playGoal();
          s.scoreP += 1;
          setPlayerScore(s.scoreP);
          setCommentary("GOOOOAL! Stunning finish by the player!");
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
          resetPositions();
        } else {
          s.ball.x = s.pitchWidth - s.ball.radius;
          s.ball.vx *= -0.8;
        }
      }

      // 4. Render Pitch & Match
      renderPitch(ctx, s);

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      clearInterval(timer);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gameState, difficulty]);

  const renderPitch = (ctx: CanvasRenderingContext2D, s: typeof gameStateRef.current) => {
    const w = s.pitchWidth;
    const h = s.pitchHeight;

    // Grass Turf
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(0, 0, w, h);

    // Grass stripes
    ctx.fillStyle = "#047857";
    const stripeWidth = w / 10;
    for (let i = 0; i < 10; i += 2) {
      ctx.fillRect(i * stripeWidth, 0, stripeWidth, h);
    }

    // White Pitch Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 3;

    // Outer Boundary
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Halfway Line
    ctx.beginPath();
    ctx.moveTo(w / 2, 10);
    ctx.lineTo(w / 2, h - 10);
    ctx.stroke();

    // Center Circle & Center Spot
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Penalty Boxes & Goal Nets
    const gh = s.goalHeight;
    const gt = (h - gh) / 2;

    // Left Goal Net
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.fillRect(0, gt, 10, gh);
    ctx.strokeRect(10, gt - 30, 90, gh + 60);

    // Right Goal Net
    ctx.fillRect(w - 10, gt, 10, gh);
    ctx.strokeRect(w - 100, gt - 30, 90, gh + 60);

    // Draw Player 1
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#3b82f6";
    ctx.fillStyle = s.player.color;
    ctx.beginPath();
    ctx.arc(s.player.x, s.player.y, s.player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Player 1 number
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("YOU", s.player.x, s.player.y);

    // Draw Opponent AI
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#ef4444";
    ctx.fillStyle = s.opponent.color;
    ctx.beginPath();
    ctx.arc(s.opponent.x, s.opponent.y, s.opponent.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Opponent text
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("AI", s.opponent.x, s.opponent.y);

    // Draw Football
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(s.ball.x, s.ball.y, s.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ball inner pentagon pattern
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(s.ball.x, s.ball.y, s.ball.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const endMatch = async () => {
    gameStateRef.current.active = false;
    soundFx.playWhistle();
    setGameState("game_over");

    const finalP = gameStateRef.current.scoreP;
    const finalO = gameStateRef.current.scoreO;

    if (finalP > finalO) {
      soundFx.playCoin();
      try {
        confetti({ particleCount: 150, spread: 90 });
      } catch {
        // ignore
      }
    }

    await onMatchFinish({
      gameMode: "stadium_1v1",
      stakeUsd: stakeType === "usd" ? stakeUsd : 0,
      stakeCoins: stakeType === "coins" ? stakeCoins : 0,
      playerScore: finalP,
      opponentScore: finalO,
      difficulty,
      opponentName: "AI Striker Pro",
    });
  };

  // Touch Virtual Joystick Handler
  const handleTouchControl = (dirX: number, dirY: number) => {
    gameStateRef.current.touchDir = { x: dirX, y: dirY };
  };

  const potentialWinAmount =
    stakeType === "usd" ? (stakeUsd * 2 * 0.9).toFixed(2) : Math.round(stakeCoins * 2 * 0.9);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-white">
      {/* Match Bar */}
      <div className="w-full bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Flame className="w-5 h-5" />
          </span>
          <div>
            <h2 className="font-extrabold text-lg text-blue-400 flex items-center gap-2">
              {t.match1v1}
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase font-mono">
                {difficulty}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-urdu">{t.match1v1Desc}</p>
          </div>
        </div>

        {/* Live Scoreboard */}
        {gameState === "playing" && (
          <div className="flex items-center gap-4 bg-slate-900 px-4 py-1.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-bold text-sm">YOU: {playerScore}</span>
            </div>
            <div className="font-mono text-base font-black px-2.5 py-0.5 rounded-lg bg-slate-950 text-amber-400 border border-slate-800">
              ⏱ {timeLeft}s
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-rose-400">AI: {opponentScore}</span>
              <span className="w-3 h-3 rounded-full bg-rose-500" />
            </div>
          </div>
        )}

        <div className="text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-600/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>10% Platform Rake to Owner</span>
        </div>
      </div>

      {/* 2D Canvas Arena Pitch */}
      <div className="relative w-full bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full max-w-[800px] h-auto aspect-[2/1] rounded-2xl border-2 border-slate-700 shadow-2xl bg-emerald-900"
        />

        {/* Live Commentary Marquee */}
        {gameState === "playing" && (
          <div className="mt-2 w-full max-w-[800px] bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Commentary:
            </span>
            <span className="font-semibold text-amber-300 font-mono">{commentary}</span>
            <span className="text-slate-500 text-[10px]">Controls: WASD / Arrows + Space to Shoot</span>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls & Shoot Buttons */}
      {gameState === "playing" && (
        <div className="w-full bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between gap-4">
          {/* Virtual D-Pad for Mobile */}
          <div className="grid grid-cols-3 gap-1 w-32 h-32">
            <div />
            <button
              onPointerDown={() => handleTouchControl(0, -1)}
              onPointerUp={() => handleTouchControl(0, 0)}
              className="p-3 bg-slate-800 active:bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow border border-slate-700"
            >
              ▲
            </button>
            <div />
            <button
              onPointerDown={() => handleTouchControl(-1, 0)}
              onPointerUp={() => handleTouchControl(0, 0)}
              className="p-3 bg-slate-800 active:bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow border border-slate-700"
            >
              ◀
            </button>
            <button
              onPointerDown={() => handleTouchControl(0, 1)}
              onPointerUp={() => handleTouchControl(0, 0)}
              className="p-3 bg-slate-800 active:bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow border border-slate-700"
            >
              ▼
            </button>
            <button
              onPointerDown={() => handleTouchControl(1, 0)}
              onPointerUp={() => handleTouchControl(0, 0)}
              className="p-3 bg-slate-800 active:bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow border border-slate-700"
            >
              ▶
            </button>
          </div>

          {/* Action Buttons: Sprint & Shoot */}
          <div className="flex gap-3">
            <button
              onPointerDown={() => {
                gameStateRef.current.isSprinting = true;
              }}
              onPointerUp={() => {
                gameStateRef.current.isSprinting = false;
              }}
              className="w-16 h-16 rounded-2xl bg-amber-500/20 active:bg-amber-500 text-amber-300 active:text-slate-950 border border-amber-500/40 flex flex-col items-center justify-center text-xs font-black shadow-lg"
            >
              <Zap className="w-5 h-5" />
              <span>SPRINT</span>
            </button>
            <button
              onClick={shootBall}
              className="w-20 h-16 rounded-2xl bg-emerald-500 active:bg-emerald-400 text-slate-950 flex flex-col items-center justify-center text-xs font-black shadow-lg shadow-emerald-500/30"
            >
              <span className="text-xl">⚽</span>
              <span>SHOOT</span>
            </button>
          </div>
        </div>
      )}

      {/* Pre-Match Stakes Selector */}
      {gameState === "betting" && (
        <div className="w-full p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-urdu">{t.stakeAmount}:</span>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setStakeType("usd")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    stakeType === "usd" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                  }`}
                >
                  💵 USD ($)
                </button>
                <button
                  onClick={() => setStakeType("coins")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    stakeType === "coins" ? "bg-yellow-500 text-slate-950" : "text-slate-400"
                  }`}
                >
                  🪙 Coins
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {stakeType === "usd"
                ? [1, 5, 10, 25, 50].map((val) => (
                    <button
                      key={val}
                      onClick={() => setStakeUsd(val)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                        stakeUsd === val
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      ${val}
                    </button>
                  ))
                : [50, 100, 250, 500].map((val) => (
                    <button
                      key={val}
                      onClick={() => setStakeCoins(val)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                        stakeCoins === val
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(["easy", "medium", "pro"] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition ${
                    difficulty === lvl ? "bg-blue-600 text-white" : "text-slate-400"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400 font-urdu">{t.potentialWin}</div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {stakeType === "usd" ? `$${potentialWinAmount}` : `${potentialWinAmount} Coins`}
              </div>
            </div>

            <button
              onClick={startMatch}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/20 hover:scale-105 transition flex items-center gap-2 font-urdu"
            >
              <Play className="w-4 h-4 fill-current" />
              {t.playNow}
            </button>
          </div>
        </div>
      )}

      {/* Game Over Summary Modal */}
      {gameState === "game_over" && (
        <div className="w-full p-6 bg-slate-950 border-t border-slate-800 flex flex-col items-center gap-4 text-center">
          <div className="text-2xl font-black">
            {playerScore > opponentScore ? (
              <span className="text-emerald-400 font-urdu flex items-center gap-2">
                <Trophy className="w-7 h-7 text-yellow-400" />
                {t.youWon} (+{stakeType === "usd" ? `$${potentialWinAmount}` : `${potentialWinAmount} Coins`})
              </span>
            ) : playerScore === opponentScore ? (
              <span className="text-yellow-400 font-urdu">میچ برابر رہا! (DRAW)</span>
            ) : (
              <span className="text-rose-400 font-urdu">{t.youLost}</span>
            )}
          </div>

          <div className="flex gap-6 text-sm font-mono bg-slate-900 px-6 py-2 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400">Your Goals:</span>{" "}
              <span className="font-bold text-emerald-400">{playerScore}</span>
            </div>
            <div>
              <span className="text-slate-400">AI Goals:</span>{" "}
              <span className="font-bold text-rose-400">{opponentScore}</span>
            </div>
            <div>
              <span className="text-slate-400">Owner Rake:</span>{" "}
              <span className="font-bold text-yellow-400">10% Platform Fee Logged</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={startMatch}
              className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow transition flex items-center gap-2 font-urdu"
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
