"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FreeCard } from "@/lib/api/types";
import {
  NAME_STYLE_OPTIONS,
  type GeneratorState,
  type NameStyle,
} from "@/lib/demo-data";
import {
  readFreeNamesSession,
  requestFreeNames,
  writeFreeNamesSession,
} from "@/lib/free-session";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasSampleCards(cards: FreeCard[] | null | undefined): cards is FreeCard[] {
  return Array.isArray(cards) && cards.length === 3;
}

type Props = {
  /** QA visual override from ?generator=; disables auto-preview. */
  forcedState?: GeneratorState | null;
  /** Crawler SSR specimens; shown as-is, no generation request. */
  sampleCards?: FreeCard[] | null;
  onCustomize: () => void;
};

export function Generator({
  forcedState = null,
  sampleCards = null,
  onCustomize,
}: Props) {
  const qaLocked = forcedState != null;
  const crawlerSamples = hasSampleCards(sampleCards) ? sampleCards : null;

  const [state, setState] = useState<GeneratorState>(() => {
    if (forcedState === "ready") return "empty";
    if (forcedState) return forcedState;
    if (crawlerSamples) return "ready";
    return "generating";
  });
  const [style, setStyle] = useState<NameStyle>("neutral");
  const [cards, setCards] = useState<FreeCard[] | null>(() => crawlerSamples);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [justRevealed, setJustRevealed] = useState(false);
  const inFlight = useRef(false);

  useLayoutEffect(() => {
    if (qaLocked || crawlerSamples) return;
    const stored = readFreeNamesSession();
    if (!stored) return;
    setCards(stored.cards);
    setState("ready");
    setJustRevealed(false);
  }, [qaLocked, crawlerSamples]);

  const generate = useCallback(async (preference: NameStyle) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setJustRevealed(false);
    setErrorMessage(null);
    setState("generating");
    setCards(null);

    const result = await requestFreeNames(preference);

    inFlight.current = false;

    if (result.ok) {
      setCards(result.cards);
      setState("ready");
      setJustRevealed(!prefersReducedMotion());
      writeFreeNamesSession({ cards: result.cards });
      return;
    }

    if (result.kind === "rate_limited") {
      setState("limit");
      setCards(null);
      return;
    }

    setState("error");
    setErrorMessage(result.message);
    setCards(null);
  }, []);

  useEffect(() => {
    if (qaLocked || crawlerSamples) return;
    if (readFreeNamesSession()) return;
    void generate("neutral");
  }, [generate, qaLocked, crawlerSamples]);

  useEffect(() => {
    if (!qaLocked) return;
    if (forcedState === "empty" || forcedState === "ready") {
      setState("empty");
      setCards(null);
      setJustRevealed(false);
    } else if (forcedState === "generating") {
      setState("generating");
      setCards(null);
    } else if (forcedState === "limit") {
      setState("limit");
      setCards(null);
    }
  }, [qaLocked, forcedState]);

  const hero = cards?.[0];
  const support = cards?.slice(1) ?? [];

  return (
    <>
      <div className="eyebrow-block">
        <div>
          <div className="kicker">A Real Chinese Name</div>
          <h1>
            Get a real Chinese name you can actually introduce yourself with
          </h1>
          <p className="definition">CallMeMing gives you a real Chinese name—not a transliteration and not a fortune-telling reading—so you can say who you are in Chinese with confidence.</p>
        </div>
        <div className="controls">
          <div className="style-lab">Name style</div>
          <div className="style-row" role="group" aria-label="Name style">
            {NAME_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={style === opt.value ? "on" : undefined}
                onClick={() => setStyle(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="cta-row">
            <button
              type="button"
              className="stamp"
              onClick={() => void generate(style)}
              disabled={state === "generating"}
            >
              Generate free names
            </button>
            <button type="button" className="text-link" onClick={onCustomize}>
              Customize →
            </button>
          </div>
        </div>
      </div>

      {state === "limit" ? (
        <section className="stage-band limit-mode" aria-label="Name specimens">
          <div className="limit-box fade-in-240">
            You can generate a few names each day. Come back tomorrow, or
            customize three complete cards for $6.99.
            <br />
            <button type="button" className="text-link" onClick={onCustomize}>
              Customize three complete cards for $6.99 →
            </button>
          </div>
        </section>
      ) : state === "error" ? (
        <section className="stage-band limit-mode" aria-label="Name specimens">
          <div className="limit-box fade-in-240">
            {errorMessage || "Something went wrong. Please try again."}
            <br />
            <button
              type="button"
              className="text-link"
              onClick={() => void generate(style)}
            >
              Try again →
            </button>
          </div>
        </section>
      ) : (
        <section className="stage-band" aria-label="Name specimens">
          {(state === "empty" || (state === "ready" && !hero)) && (
            <>
              <div className="hero-name">
                <div className="hero-py" style={{ visibility: "hidden" }}>
                  [······]
                </div>
                <p className="hero-hz faint">— — —</p>
                <div className="hero-meta">Waiting for a click</div>
              </div>
              <aside className="support-col">
                <div className="support-item">
                  <div className="support-mob-label">Also</div>
                  <div className="hz faint">— —</div>
                </div>
                <div className="support-item">
                  <div className="support-mob-label">Also</div>
                  <div className="hz faint">— —</div>
                </div>
              </aside>
            </>
          )}

          {state === "generating" && (
            <>
              <div className="hero-name">
                <div className="hero-py" style={{ visibility: "hidden" }}>
                  [······]
                </div>
                <p className="hero-hz faint pulse">— — —</p>
              </div>
              <aside className="support-col">
                <div className="support-item">
                  <div className="support-mob-label">Also</div>
                  <div className="hz faint pulse">— —</div>
                </div>
                <div className="support-item">
                  <div className="support-mob-label">Also</div>
                  <div className="hz faint pulse">— —</div>
                </div>
              </aside>
            </>
          )}

          {state === "ready" && hero && (
            <>
              <div className="hero-name">
                <div className={`hero-py${justRevealed ? " reveal-py" : ""}`}>
                  {hero.pinyin}
                </div>
                <p className={`hero-hz${justRevealed ? " reveal-hero" : ""}`}>
                  {hero.hanzi}
                </p>
                <div className="hero-meta">Specimen · free · hanzi + pinyin</div>
              </div>
              <aside className="support-col">
                <div className="support-label">Also generated</div>
                {support.map((n, i) => (
                  <div
                    key={`${n.hanzi}-${i}`}
                    className={`support-item${justRevealed ? ` reveal-sup d${i + 1}` : ""}`}
                  >
                    <div className="support-mob-label">Also</div>
                    <div className="py">{n.pinyin}</div>
                    <div className="hz">{n.hanzi}</div>
                  </div>
                ))}
              </aside>
            </>
          )}
        </section>
      )}

      <div className="after-stage">
        <p>
          Like a direction? Get three complete cards with meaning, pronunciation, and a
          self-intro you can say.
        </p>
        <button type="button" className="text-link" onClick={onCustomize}>
          Customize for $6.99 →
        </button>
      </div>
    </>
  );
}
