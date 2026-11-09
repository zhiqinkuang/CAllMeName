"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DEMO_CUSTOMER,
  FEELING_CHIPS,
  NAME_STYLE_OPTIONS,
  type NameStyle,
} from "@/lib/demo-data";

export function CustomizeForm() {
  const router = useRouter();
  const [englishName, setEnglishName] = useState(DEMO_CUSTOMER.englishName);
  const [style, setStyle] = useState<NameStyle>(DEMO_CUSTOMER.nameStyle);
  const [feeling, setFeeling] = useState(DEMO_CUSTOMER.feeling);
  const [activeChip, setActiveChip] = useState<string>("Calm");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function onChip(chip: string) {
    setActiveChip(chip);
    setFeeling(chip.toLowerCase());
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!englishName.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitting(true);
    router.push("/results/demo");
  }

  return (
    <section className="form-section" id="custom">
      <form className="form-exhibit" onSubmit={onSubmit} noValidate>
        <h2>Customize your Chinese name</h2>
        <p className="sub">Three complete cards · $6.99 one-time</p>

        <div className="field">
          <div className="lab">
            English name <span className="req">Required</span>
          </div>
          <input
            className={`input${error ? " err" : ""}`}
            value={englishName}
            onChange={(e) => {
              setEnglishName(e.target.value);
              if (error && e.target.value.trim()) setError(false);
            }}
            placeholder="Your English name"
            aria-invalid={error}
            aria-describedby={error ? "en-error" : undefined}
          />
          {error && (
            <div className="err-msg" id="en-error">
              Please enter your English name.
            </div>
          )}
        </div>

        <div className="field">
          <div className="lab">Name style</div>
          <div className="seg" role="group" aria-label="Name style">
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
        </div>

        <div className="field">
          <div className="lab">Feeling you want the name to convey</div>
          <input
            className="input"
            value={feeling}
            onChange={(e) => setFeeling(e.target.value)}
            placeholder="calm and clear"
          />
          <div className="chips">
            {FEELING_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`chip${activeChip === chip ? " on" : ""}`}
                onClick={() => onChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="stamp cta" disabled={submitting}>
          Continue to payment · $6.99
        </button>
        <p className="tax">One-time. Taxes may apply at checkout.</p>
      </form>
    </section>
  );
}
