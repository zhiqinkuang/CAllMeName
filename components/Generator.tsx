"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { postFreeNames } from "@/lib/api/free-names";
import type { FreeCard } from "@/lib/api/types";
import {
  NAME_STYLE_OPTIONS,
  type GeneratorState,
  type NameStyle,
} from "@/lib/demo-data";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Props = {
  initialState?: GeneratorState;
  onCustomize: () => void;
};

export function Generator({ initialState = "empty", onCustomize }: Props) {
  const [state, setState] = useState<GeneratorState>(
    initialState === "ready" ? "empty" : initialState,
  );
  const [style, setStyle] = useState<NameStyle>("neutral");
  const [cards, setCards] = useState<FreeCard[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [justRevealed, setJustRevealed] = useState(false);
  const inFlight = useRef(false);

  // Style-QA override: ?generator= can force visual state without API
  useEffect(() => {
    if (initialState === "empty") {
      setState("empty");
      setCards(null);
      setJustRevealed(false);
    } else if (initialState === "generating") {
      setState("generating");
      setCards(null);
    } else if (initialState === "limit") {
      setState("limit");
      setCards(null);
    } else if (initialState === "ready") {
      // Keep empty until Generate; do not seed demo names.
      setState("empty");
      setCards(null);
    }
  }, [initialState]);

  const generate = useCallback(async () => {
    if (inFlight.current || state === "generating") return;
    inFlight.current = true;
    setJustRevealed(false);
    setErrorMessage(null);
    setState("generating");
    setCards(null);

    const result = await postFreeNames(style);

    inFlight.current = false;

    if (result.ok) {
      setCards(result.cards);
      setState("ready");
      setJustRevealed(!prefersReducedMotion());
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
  }, [state, style]);

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
              onClick={() => void generate()}
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
              onClick={() => void generate()}
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
                <div className="hero-py" style={{ opacity: 0.35 }}>
                  ········
                </div>
                <p className="hero-hz pulse">···</p>
                <div className="hero-meta">Writing names…</div>
              </div>
              <aside className="support-col">
                <div className="support-item">
                  <div className="support-mob-label">Also</div>
                  <div className="hz pulse">··</div>
                </div>
                <div className="support-item">
                  <div className="support-mob-label">Also</div>
                  <div className="hz pulse">··</div>
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
