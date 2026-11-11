"use client";

import { Check, Copy, Play, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getResult,
  RESULTS_POLL_MS,
  RESULTS_TIMEOUT_MS,
} from "@/lib/api/results";
import type { FullCard } from "@/lib/api/types";
import { SiteFooter } from "./SiteFooter";
import { Wordmark } from "./Wordmark";

const COPY_MS = 1600;
const PLAY_MS = 1600;
const PAPER_EXIT_MS = 240;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type ViewStatus =
  | "loading"
  | "generating"
  | "ready"
  | "failed"
  | "not_found"
  | "error"
  | "timeout";

export function ResultView({
  token,
  initialPaperIndex = 0,
}: {
  token: string;
  initialPaperIndex?: number;
}) {
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [cards, setCards] = useState<FullCard[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(
    Math.min(Math.max(initialPaperIndex, 0), 2),
  );
  const [swapKey, setSwapKey] = useState(0);
  const [useSwapIn, setUseSwapIn] = useState(false);
  const [exitingPaper, setExitingPaper] = useState<FullCard | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copiedName, setCopiedName] = useState(false);
  const [copiedIntro, setCopiedIntro] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [timedOutHint, setTimedOutHint] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAt = useRef<number>(Date.now());
  const cancelled = useRef(false);

  function later(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }

  const clearPoll = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const applyReady = useCallback(
    (next: FullCard[]) => {
      setCards(next);
      setStatus("ready");
      setMessage(null);
      setTimedOutHint(false);
      const idx = Math.min(Math.max(initialPaperIndex, 0), next.length - 1);
      setActiveIndex(idx);
    },
    [initialPaperIndex],
  );

  const poll = useCallback(async () => {
    if (cancelled.current) return;
    const result = await getResult(token);
    if (cancelled.current) return;

    if (result.ok && result.status === "ready") {
      clearPoll();
      applyReady(result.cards);
      return;
    }

    if (result.ok && result.status === "generating") {
      setStatus("generating");
      const elapsed = Date.now() - startedAt.current;
      if (elapsed >= RESULTS_TIMEOUT_MS) {
        setTimedOutHint(true);
      }
      clearPoll();
      pollTimer.current = setTimeout(() => {
        void poll();
      }, RESULTS_POLL_MS);
      return;
    }

    clearPoll();
    if (!result.ok && result.status === "failed") {
      setStatus("failed");
      setMessage(result.message);
      return;
    }
    if (!result.ok && result.status === "not_found") {
      setStatus("not_found");
      setMessage(result.message);
      return;
    }
    setStatus("error");
    setMessage(
      !result.ok ? result.message : "Something went wrong. Please try again.",
    );
  }, [token, clearPoll, applyReady]);

  useEffect(() => {
    cancelled.current = false;
    startedAt.current = Date.now();
    setStatus("loading");
    setCards(null);
    setTimedOutHint(false);
    void poll();
    return () => {
      cancelled.current = true;
      clearPoll();
      timers.current.forEach(clearTimeout);
      timers.current = [];
      if (exitTimer.current) {
        clearTimeout(exitTimer.current);
        exitTimer.current = null;
      }
    };
  }, [token, poll, clearPoll]);

  useEffect(() => {
    setActiveIndex(Math.min(Math.max(initialPaperIndex, 0), 2));
    setUseSwapIn(false);
    setExitingPaper(null);
    setSwapKey((k) => k + 1);
    setCopiedName(false);
    setCopiedIntro(false);
    setCopyError(null);
    setPlaying(false);
  }, [initialPaperIndex]);

  async function copyText(text: string, kind: "name" | "intro") {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("clipboard unavailable");
      }
      await navigator.clipboard.writeText(text);
      setCopyError(null);
      if (kind === "name") {
        setCopiedName(true);
        later(() => setCopiedName(false), COPY_MS);
      } else {
        setCopiedIntro(true);
        later(() => setCopiedIntro(false), COPY_MS);
      }
    } catch {
      setCopiedName(false);
      setCopiedIntro(false);
      setCopyError(
        "Couldn't copy. You can select the text on the card instead.",
      );
    }
  }

  function onPlay() {
    // audioUrl is always null this MVP round — visual Playing… only.
    setPlaying(true);
    later(() => setPlaying(false), PLAY_MS);
  }

  function openPaper(index: number) {
    if (index === activeIndex || !cards) return;

    // Interrupt any in-flight Open paper exit.
    if (exitTimer.current) {
      clearTimeout(exitTimer.current);
      exitTimer.current = null;
    }

    const previous = cards[activeIndex];
    setCopiedName(false);
    setCopiedIntro(false);
    setCopyError(null);
    setPlaying(false);

    if (prefersReducedMotion()) {
      setExitingPaper(null);
      setUseSwapIn(false);
      setActiveIndex(index);
      setSwapKey((k) => k + 1);
    } else {
      setExitingPaper(previous);
      setUseSwapIn(true);
      setActiveIndex(index);
      setSwapKey((k) => k + 1);
      exitTimer.current = setTimeout(() => {
        setExitingPaper(null);
        exitTimer.current = null;
      }, PAPER_EXIT_MS);
    }

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("paper", String(index));
      window.history.replaceState({}, "", url.toString());
    }
  }

  if (status === "loading" || status === "generating") {
    return (
      <div className="page-shell">
        <div className="result-wrap">
          <div className="result-top">
            <Wordmark />
            <span className="result-badge">Preparing your names</span>
          </div>
          <div className="result-head">
            <h1>We are preparing your Chinese names</h1>
            <p className="result-lead">
              This usually takes a moment. Keep this page open—we will show your
              three complete cards as soon as they are ready.
            </p>
            {timedOutHint && (
              <p className="result-lead" style={{ marginTop: 12 }}>
                Still working. Check the email you used at checkout if this page
                stays blank—we also send the result link there.
              </p>
            )}
          </div>
          <div className="limit-box" aria-live="polite">
            Writing your name cards…
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (status === "failed" || status === "not_found" || status === "error") {
    const title =
      status === "not_found"
        ? "This result link is not available"
        : status === "failed"
          ? "We could not prepare your names"
          : "Something went wrong";
    return (
      <div className="page-shell">
        <div className="result-wrap">
          <div className="result-top">
            <Wordmark />
            <span className="result-badge">Results</span>
          </div>
          <div className="result-head">
            <h1>{title}</h1>
            <p className="result-lead">
              {message ||
                (status === "not_found"
                  ? "This result link is invalid."
                  : "Please try again or contact support with your payment email.")}
            </p>
          </div>
          {status !== "not_found" && (
            <button
              type="button"
              className="stamp"
              onClick={() => {
                startedAt.current = Date.now();
                setTimedOutHint(false);
                setStatus("loading");
                void poll();
              }}
            >
              Try again
            </button>
          )}
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!cards || cards.length !== 3) {
    return null;
  }

  const primary = cards[activeIndex];
  const others = cards
    .map((c, i) => ({ card: c, index: i }))
    .filter((x) => x.index !== activeIndex);
  const showStateTag = activeIndex !== 0;

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
          <h1>Here are three names you can take with you</h1>
          <p className="result-lead">
            Three complete name cards. One primary paper shows Play, Copy name,
            Why this suits you, a self-intro, and Copy intro. Open paper on
            Other candidates elevates that name to the primary paper—every name
            has the full set when it is primary.
          </p>
        </div>

        <div className="paper-stage">
          {exitingPaper && (
            <PrimaryPaper
              name={exitingPaper}
              swapped={false}
              exiting
              copiedName={false}
              copiedIntro={false}
              copyError={null}
              playing={false}
              onPlay={() => {}}
              onCopyName={() => {}}
              onCopyIntro={() => {}}
            />
          )}
          <PrimaryPaper
            key={swapKey}
            name={primary}
            swapped={useSwapIn}
            exiting={false}
            copiedName={copiedName}
            copiedIntro={copiedIntro}
            copyError={copyError}
            playing={playing}
            onPlay={onPlay}
            onCopyName={() => copyText(primary.hanzi, "name")}
            onCopyIntro={() => copyText(primary.selfIntroduction, "intro")}
          />
        </div>

        <p className="alt-label">Other candidates</p>
        {others.map(({ card, index }) => (
          <div className="alt-row" key={`${card.hanzi}-${index}`}>
            <div>
              <div className="hz">{card.hanzi}</div>
              <div className="py">{card.pinyin}</div>
            </div>
            <p className="blurb">{card.whyItFitsYou}</p>
            <button
              type="button"
              className="pick"
              onClick={() => openPaper(index)}
            >
              Open paper →
            </button>
          </div>
        ))}

        <p className="result-help">
          Pick one to take with you. CallMeMing does not sell destiny readings.
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}

function PrimaryPaper({
  name,
  swapped,
  exiting = false,
  copiedName,
  copiedIntro,
  copyError,
  playing,
  onPlay,
  onCopyName,
  onCopyIntro,
}: {
  name: FullCard;
  swapped: boolean;
  exiting?: boolean;
  copiedName: boolean;
  copiedIntro: boolean;
  copyError: string | null;
  playing: boolean;
  onPlay: () => void;
  onCopyName: () => void;
  onCopyIntro: () => void;
}) {
  const paperClass = exiting
    ? "primary-paper paper-out"
    : swapped
      ? "primary-paper swap-in"
      : "primary-paper";
  return (
    <article className={paperClass} aria-hidden={exiting || undefined}>
      <div className="pp-left">
        <div className="py">[{name.pinyin}]</div>
        <div className="hz">{name.hanzi}</div>
        <div className="roman">{name.phoneticHint}</div>
        <div className="acts">
          <button
            type="button"
            className={`chip play${playing ? " playing" : ""}`}
            onClick={onPlay}
            aria-pressed={playing}
            tabIndex={exiting ? -1 : undefined}
          >
            {playing ? (
              <Volume2 size={14} strokeWidth={2} aria-hidden />
            ) : (
              <Play size={14} strokeWidth={2} aria-hidden />
            )}
            {playing ? "Playing…" : "Play"}
          </button>
          <button
            type="button"
            className={`chip${copiedName ? " done" : ""}`}
            data-testid="copy-name"
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
        <p className="why-b">{name.whyItFitsYou}</p>
        <div className="intro-block">
          <div className="intro-h">Say it like this</div>
          <p className="intro-en">{name.selfIntroduction}</p>
          <button
            type="button"
            className={`chip${copiedIntro ? " done" : ""}`}
            data-testid="copy-intro"
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
      {copyError && (
        <p className="err-msg copy-error" role="status">
          {copyError}
        </p>
      )}
    </article>
  );
}
