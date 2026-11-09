/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Generator } from "@/components/Generator";

function okCards() {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      cards: [
        { hanzi: "甲乙丙", pinyin: "Jiǎ Yǐbǐng" },
        { hanzi: "丁戊己", pinyin: "Dīng Wùjǐ" },
        { hanzi: "庚辛壬", pinyin: "Gēng Xīnrén" },
      ],
    }),
  };
}

describe("Generator API wiring", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okCards()));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults Name style to Either is fine and posts neutral", async () => {
    const user = userEvent.setup();
    render(<Generator onCustomize={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Either is fine" }),
    ).toHaveClass("on");
    await user.click(screen.getByRole("button", { name: "Generate free names" }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ genderPreference: "neutral" });
    await waitFor(() => {
      expect(screen.getByText("甲乙丙")).toBeInTheDocument();
    });
  });

  it("posts feminine when Typically feminine is selected", async () => {
    const user = userEvent.setup();
    render(<Generator onCustomize={() => {}} />);
    await user.click(
      screen.getByRole("button", { name: "Typically feminine" }),
    );
    expect(
      screen.getByRole("button", { name: "Typically feminine" }),
    ).toHaveClass("on");
    await user.click(screen.getByRole("button", { name: "Generate free names" }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ genderPreference: "feminine" });
  });

  it("posts masculine when Typically masculine is selected", async () => {
    const user = userEvent.setup();
    render(<Generator onCustomize={() => {}} />);
    await user.click(
      screen.getByRole("button", { name: "Typically masculine" }),
    );
    expect(
      screen.getByRole("button", { name: "Typically masculine" }),
    ).toHaveClass("on");
    await user.click(screen.getByRole("button", { name: "Generate free names" }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ genderPreference: "masculine" });
  });

  it("shows rate-limit copy with a few names each day", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          error: "rate_limited",
          retryAfterSeconds: 9,
          message: "Too many",
        }),
      }),
    );
    const user = userEvent.setup();
    render(<Generator onCustomize={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Generate free names" }));
    await waitFor(() => {
      expect(screen.getByText(/a few names each day/i)).toBeInTheDocument();
    });
  });

  it("surfaces 400 validation_error message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: "validation_error",
          message: "Invalid genderPreference",
          fields: { genderPreference: "Invalid" },
        }),
      }),
    );
    const user = userEvent.setup();
    render(<Generator onCustomize={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Generate free names" }));
    await waitFor(() => {
      expect(screen.getByText(/Invalid genderPreference/i)).toBeInTheDocument();
    });
  });
});
