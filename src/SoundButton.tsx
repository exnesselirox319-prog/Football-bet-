"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundFx } from "@/lib/audio";

export function SoundToggle() {
  const [muted, setMuted] = useState(false);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    soundFx.setMuted(next);
    if (!next) {
      soundFx.playClick();
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold"
      title={muted ? "Unmute Audio" : "Mute Audio"}
    >
      {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
      <span className="hidden sm:inline">{muted ? "Muted" : "Sound"}</span>
    </button>
  );
}
