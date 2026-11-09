"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEMO_FREE_NAMES,
  NAME_STYLE_OPTIONS,
  type GeneratorState,
  type NameStyle,
} from "@/lib/demo-data";

type Props = {
  initialState?: GeneratorState;
  onCustomize: () => void;
};

export function Generator({ initialState = "empty", onCustomize }: Props) {
  const [state, setState] = useState<GeneratorState>(initialState);
  const [style, setStyle] = useState<NameStyle>("feminine");
  const [justRevealed, setJustRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(initialState);
    setJustRevealed(false);
  }, [initialState]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const generate = useCallback(() => {
    if (state === "generating") return;
    setJustRevealed(false);
    setState("generating");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setState("ready");
      setJustRevealed(true);
    }, 900);
  }, [state]);

  const hero = DEMO_FREE_NAMES[0];
  const support = DEMO_FREE_NAMES.slice(1);

  return (
    <>
      <div className="eyebrow-block">
        <div>
          <div className="kicker">A Real Chinese Name</div>
          <h1>
            Get a real Chinese name you can actually introduce yourself with.
          </h1>
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
              onClick={generate}
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
          <div className="limit-box">
            You can generate a few names each day. Come back tomorrow, or
            customize three complete cards for $6.99.
            <br />
            <button type="button" className="text-link" onClick={onCustomize}>
              Customize three complete cards for $6.99 →
            </button>
          </div>
        </section>
      ) : (
        <section className="stage-band" aria-label="Name specimens">
          {state === "empty" && (
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

          {state === "ready" && (
            <>
              <div className="hero-name">
                <div className={`hero-py${justRevealed ? " reveal-py" : ""}`}>
                  {hero.pinyinBracket}
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
                    key={n.hanzi}
                    className={`support-item${justRevealed ? ` reveal-sup d${i + 1}` : ""}`}
                  >
                    <div className="support-mob-label">Also</div>
                    <div className="py">{n.pinyinBracket}</div>
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
          Like a direction? Get three complete cards with meaning, audio, and a
          self-intro you can say.
        </p>
        <button type="button" className="text-link" onClick={onCustomize}>
          Customize for $6.99 →
        </button>
      </div>
    </>
  );
}
