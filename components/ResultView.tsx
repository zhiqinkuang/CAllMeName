"use client";

import { Check, Copy, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DEMO_CUSTOMER,
  DEMO_PAID_NAMES,
  type PaidName,
  type PaperId,
} from "@/lib/demo-data";
import { Wordmark } from "./Wordmark";

const COPY_MS = 1600;
const PLAY_MS = 1600;

export function ResultView({ initialPaper = "anran" }: { initialPaper?: PaperId }) {
  const [activeId, setActiveId] = useState<PaperId>(initialPaper);
  const [swapKey, setSwapKey] = useState(0);
  const [copiedName, setCopiedName] = useState(false);
  const [copiedIntro, setCopiedIntro] = useState(false);
  const [playing, setPlaying] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setActiveId(initialPaper);
    setSwapKey((k) => k + 1);
    setCopiedName(false);
    setCopiedIntro(false);
    setPlaying(false);
  }, [initialPaper]);

  useEffect(() => {
    const bag = timers.current;
    return () => bag.forEach(clearTimeout);
  }, []);

  function later(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }

  const primary = DEMO_PAID_NAMES.find((n) => n.id === activeId)!;
  const others = DEMO_PAID_NAMES.filter((n) => n.id !== activeId);
  const showStateTag = activeId !== "anran";

  async function copyText(text: string, kind: "name" | "intro") {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* style preview */
    }
    if (kind === "name") {
      setCopiedName(true);
      later(() => setCopiedName(false), COPY_MS);
    } else {
      setCopiedIntro(true);
      later(() => setCopiedIntro(false), COPY_MS);
    }
  }

  function onPlay() {
    // audioUrl is always null this round — visual Playing… only.
    setPlaying(true);
    later(() => setPlaying(false), PLAY_MS);
  }

  function openPaper(id: PaperId) {
    if (id === activeId) return;
    setActiveId(id);
    setSwapKey((k) => k + 1);
    setCopiedName(false);
    setCopiedIntro(false);
    setPlaying(false);
    // Update URL for QA without navigation lock
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("paper", id);
      window.history.replaceState({}, "", url.toString());
    }
  }

  return (
    <div className="page-shell">
      <div className="result-wrap">
        <div className="result-top">
          <Wordmark />
          <span className="result-badge">Your custom names · $6.99</span>
        </div>

        <div className="result-head">
          {showStateTag && (
            <span className="state-tag">
              State · Open paper → {primary.hanzi}
            </span>
          )}
          <h1>
            {DEMO_CUSTOMER.englishName}, here are three names you can take with
            you
          </h1>
          <p className="result-lead">
            Three complete name cards. One primary paper shows Play, Copy name,
            Why this suits you, a bilingual self-intro, and Copy intro. Open
            paper on Other candidates elevates that name to the primary
            paper—every name has the full set when it is primary.
          </p>
        </div>

        <PrimaryPaper
          key={swapKey}
          name={primary}
          swapped={swapKey > 0 && activeId !== "anran"}
          copiedName={copiedName}
          copiedIntro={copiedIntro}
          playing={playing}
          onPlay={onPlay}
          onCopyName={() => copyText(primary.hanzi, "name")}
          onCopyIntro={() => copyText(primary.introZh, "intro")}
        />

        <p className="alt-label">Other candidates</p>
        {others.map((n) => (
          <div className="alt-row" key={n.id}>
            <div>
              <div className="hz">{n.hanzi}</div>
              <div className="py">
                {n.pinyinBracket} · {n.pinyinRoman}
              </div>
            </div>
            <p className="blurb">{n.blurb}</p>
            <button
              type="button"
              className="pick"
              onClick={() => openPaper(n.id)}
            >
              Open paper →
            </button>
          </div>
        ))}

        <p className="result-help">
          Pick one to take with you. CallMeMing does not sell destiny readings.
        </p>
      </div>
    </div>
  );
}

function PrimaryPaper({
  name,
  swapped,
  copiedName,
  copiedIntro,
  playing,
  onPlay,
  onCopyName,
  onCopyIntro,
}: {
  name: PaidName;
  swapped: boolean;
  copiedName: boolean;
  copiedIntro: boolean;
  playing: boolean;
  onPlay: () => void;
  onCopyName: () => void;
  onCopyIntro: () => void;
}) {
  return (
    <article className={`primary-paper${swapped ? " swap-in" : ""}`}>
      <div className="pp-left">
        <div className="py">{name.pinyinBracket}</div>
        <div className="hz">{name.hanzi}</div>
        <div className="roman">{name.pinyinRoman}</div>
        <div className="acts">
          <button
            type="button"
            className={`chip play${playing ? " playing" : ""}`}
            onClick={onPlay}
            aria-pressed={playing}
          >
            <Volume2 size={14} strokeWidth={2} aria-hidden />
            {playing ? "Playing…" : "Play"}
          </button>
          <button
            type="button"
            className={`chip${copiedName ? " done" : ""}`}
            onClick={onCopyName}
          >
            {copiedName ? (
              <>
                <Check size={14} strokeWidth={2.5} aria-hidden /> Copied name
              </>
            ) : (
              <>
                <Copy size={14} strokeWidth={2} aria-hidden /> Copy name
              </>
            )}
          </button>
        </div>
        {playing && (
          <p className="phonetic-hint">Approx. · {name.phoneticHint}</p>
        )}
      </div>
      <div className="pp-right">
        <div className="why-h">Why this suits you</div>
        <p className="why-b">{name.why}</p>
        <div className="intro-block">
          <div className="intro-h">Say it like this</div>
          <p className="intro-zh">{name.introZh}</p>
          <p className="intro-en">{name.introEn}</p>
          <button
            type="button"
            className={`chip${copiedIntro ? " done" : ""}`}
            onClick={onCopyIntro}
          >
            {copiedIntro ? (
              <>
                <Check size={14} strokeWidth={2.5} aria-hidden /> Copied
              </>
            ) : (
              <>
                <Copy size={14} strokeWidth={2} aria-hidden /> Copy intro
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
