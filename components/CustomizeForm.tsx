"use client";

import { useState, type FormEvent } from "react";
import { postCheckout, redirectToCheckout } from "@/lib/api/checkout";
import type { DesiredFeeling } from "@/lib/api/types";
import {
  FEELING_OPTIONS,
  NAME_STYLE_OPTIONS,
  type NameStyle,
} from "@/lib/demo-data";
import {
  isCheckoutValid,
  validateCheckoutForm,
} from "@/lib/validation/checkout";

export function CustomizeForm() {
  const [englishName, setEnglishName] = useState("");
  const [style, setStyle] = useState<NameStyle>("neutral");
  const [feeling, setFeeling] = useState<DesiredFeeling | "">("");
  const [fieldErrors, setFieldErrors] = useState<{
    englishName?: string;
    desiredFeeling?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const errors = validateCheckoutForm({
      englishName,
      genderPreference: style,
      desiredFeeling: feeling,
    });
    if (!isCheckoutValid(errors)) {
      setFieldErrors(errors);
      return;
    }
    if (!feeling) return;

    setFieldErrors({});
    setSubmitting(true);

    const result = await postCheckout({
      englishName: englishName.trim(),
      genderPreference: style,
      desiredFeeling: feeling,
    });

    if (!result.ok) {
      setSubmitting(false);
      if (result.kind === "validation_error") {
        setFieldErrors({
          englishName: result.fields?.englishName,
          desiredFeeling: result.fields?.desiredFeeling,
        });
        setFormError(result.message);
        return;
      }
      setFormError(result.message);
      return;
    }

    // Must use location.href — never window.open, never /results/demo.
    redirectToCheckout(result.checkoutUrl);
  }

  return (
    <section className="form-section" id="custom">
      <form className="form-exhibit" onSubmit={(e) => void onSubmit(e)} noValidate>
        <h2>Customize your Chinese name</h2>
        <p className="sub">Three complete cards · $6.99 one-time</p>

        <div className="field">
          <div className="lab">
            English name <span className="req">Required</span>
          </div>
          <input
            className={`input${fieldErrors.englishName ? " err" : ""}`}
            value={englishName}
            onChange={(e) => {
              setEnglishName(e.target.value);
              if (fieldErrors.englishName) {
                setFieldErrors((prev) => ({ ...prev, englishName: undefined }));
              }
            }}
            placeholder="Your English name"
            aria-invalid={!!fieldErrors.englishName}
            aria-describedby={fieldErrors.englishName ? "en-error" : undefined}
          />
          {fieldErrors.englishName && (
            <div className="err-msg" id="en-error">
              {fieldErrors.englishName}
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
          <div className="chips" role="group" aria-label="Desired feeling">
            {FEELING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`chip${feeling === opt.value ? " on" : ""}`}
                onClick={() => {
                  setFeeling(opt.value);
                  if (fieldErrors.desiredFeeling) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      desiredFeeling: undefined,
                    }));
                  }
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {fieldErrors.desiredFeeling && (
            <div className="err-msg">{fieldErrors.desiredFeeling}</div>
          )}
        </div>

        {formError && <div className="err-msg">{formError}</div>}

        <button type="submit" className="stamp cta" disabled={submitting}>
          Continue to payment · $6.99
        </button>
        <p className="tax">One-time. Taxes may apply at checkout.</p>
      </form>
    </section>
  );
}
