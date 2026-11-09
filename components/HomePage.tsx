"use client";

import { type GeneratorState } from "@/lib/demo-data";
import { CustomizeForm } from "./CustomizeForm";
import { Generator } from "./Generator";
import { Wordmark } from "./Wordmark";

export function HomePage({
  initialGenerator,
}: {
  initialGenerator: GeneratorState;
}) {
  function scrollToForm() {
    document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="page-shell">
      <nav className="site-nav">
        <Wordmark />
        <div className="links">
          <a href="#how">How it works</a>
          <a className="paid" href="#custom">
            Custom name · $6.99
          </a>
        </div>
      </nav>

      <Generator initialState={initialGenerator} onCustomize={scrollToForm} />

      <p className="section-title">Free vs Custom</p>
      <section className="catalog">
        <div className="catalog-row">
          <h2 className="lab">Free</h2>
          <p className="body">
            Hanzi + pinyin. Three specimen names. No signup.
            <span className="sub">One click. No account required.</span>
          </p>
        </div>
        <div className="catalog-row">
          <h2 className="lab">Custom · $6.99</h2>
          <p className="body">
            Meaning, audio, self-intro. Three complete paper cards.
            <span className="sub">One-time. Taxes may apply at checkout.</span>
          </p>
        </div>
      </section>

      <CustomizeForm />

      <p className="section-title" id="how">
        How it works
      </p>
      <section className="catalog">
        <div className="catalog-row">
          <h2 className="lab">01 · Generate</h2>
          <p className="body">
            Get three real-looking names with hanzi and pinyin—free, no signup.
          </p>
        </div>
        <div className="catalog-row">
          <h2 className="lab">02 · Customize</h2>
          <p className="body">
            Share your English name, style, and the feeling you want.
          </p>
        </div>
        <div className="catalog-row">
          <h2 className="lab">03 · Take it with you</h2>
          <p className="body">
            Meaning, pronunciation, and a line you can say when you introduce
            yourself.
          </p>
        </div>
      </section>

      <p className="section-title">FAQ</p>
      <section className="faq">
        <div className="faq-item">
          <strong>Is this fortune-telling?</strong>
          <p>
            No. CallMeMing is for learners who need a real personal name they can
            introduce themselves with—not 八字, 五行, or destiny scores.
          </p>
        </div>
        <div className="faq-item">
          <strong>What do I get for $6.99?</strong>
          <p>
            Three complete name cards: large hanzi, pinyin, playable audio, why
            it suits you, and a copyable self-introduction.
          </p>
        </div>
        <div className="faq-item" style={{ borderBottom: 0 }}>
          <strong>Do I need an account?</strong>
          <p>
            No account for free generation or to view your paid results on this
            device.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <span className="brand">CallMeMing</span>
        <span>callmeming.com</span>
        <span>A Real Chinese Name</span>
      </footer>
    </div>
  );
}
