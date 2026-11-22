/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Generator } from "@/components/Generator";
import { CRAWLER_SAMPLE_CARDS } from "@/lib/crawlers";
import { FREE_NAMES_SESSION_KEY, writeFreeNamesSession } from "@/lib/free-session";

function okCards(overrides?: { hanzi?: [string, string, string] }) {
  const [a, b, c] = overrides?.hanzi ?? ["甲乙丙", "丁戊己", "庚辛壬"];
  return {
    ok: true,
    status: 200,
    json: async () => ({
      cards: [
        { hanzi: a, pinyin: "Jiǎ Yǐbǐng" },
        { hanzi: b, pinyin: "Dīng Wùjǐ" },
        { hanzi: c, pinyin: "Gēng Xīnrén" },
      ],
    }),
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("Generator first-load auto-preview", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okCards()));
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("auto-generates with default Either is fine on first visit, without a click", async () => {
    render(<Generator onCustomize={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Either is fine" }),
    ).toHaveClass("on");
    await waitFor(() => {
      expect(screen.getByText("甲乙丙")).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ genderPreference: "neutral" });
    expect(screen.queryByText("Waiting for a click")).not.toBeInTheDocument();
  });

  it("never shows Waiting for a click while the first auto-preview is in flight", async () => {
    const pending = deferred<ReturnType<typeof okCards>>();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => pending.promise),
    );
    render(<Generator onCustomize={() => {}} />);
    expect(screen.queryByText("Waiting for a click")).not.toBeInTheDocument();
    expect(screen.getAllByText("— — —").length).toBeGreaterThan(0);
    pending.resolve(okCards());
    await waitFor(() => {
      expect(screen.getByText("甲乙丙")).toBeInTheDocument();
    });
    expect(screen.queryByText("Waiting for a click")).not.toBeInTheDocument();
  });

  it("plays the same main-name entrance animation used after clicking Generate", async () => {
    render(<Generator onCustomize={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("甲乙丙")).toBeInTheDocument();
    });
    expect(screen.getByText("甲乙丙")).toHaveClass("reveal-hero");
  });

  it("reuses the session set on remount without a new request or count", async () => {
    writeFreeNamesSession({
      cards: [
        { hanzi: "林安然", pinyin: "Lín Ānrán" },
        { hanzi: "苏景行", pinyin: "Sū Jǐngxíng" },
        { hanzi: "沈清越", pinyin: "Shěn Qīngyuè" },
      ],
    });
    const { unmount } = render(<Generator onCustomize={() => {}} />);
    expect(screen.getByText("林安然")).toBeInTheDocument();
    expect(screen.getByText("[lín · ān rán]")).toBeInTheDocument();
    expect(screen.getByText("[sū · jǐng xíng]")).toBeInTheDocument();
    expect(screen.queryByText("Lín Ānrán")).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
    unmount();
    render(<Generator onCustomize={() => {}} />);
    expect(screen.getByText("林安然")).toBeInTheDocument();
    expect(screen.getByText("苏景行")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("does not auto-regenerate when only Name style changes", async () => {
    const user = userEvent.setup();
    render(<Generator onCustomize={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("甲乙丙")).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    await user.click(
      screen.getByRole("button", { name: "Typically feminine" }),
    );
    expect(
      screen.getByRole("button", { name: "Typically feminine" }),
    ).toHaveClass("on");
    expect(screen.getByText("甲乙丙")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("generates a new counted set only after clicking Generate", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(okCards())
      .mockResolvedValueOnce(okCards({ hanzi: ["赵梅雪", "钱雅琴", "孙秋水"] }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<Generator onCustomize={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText("甲乙丙")).toBeInTheDocument();
    });
    await user.click(
      screen.getByRole("button", { name: "Typically feminine" }),
    );
    await user.click(screen.getByRole("button", { name: "Generate free names" }));
    await waitFor(() => {
      expect(screen.getByText("赵梅雪")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, init] = fetchMock.mock.calls[1];
    expect(JSON.parse(init.body)).toEqual({ genderPreference: "feminine" });
    const stored = JSON.parse(
      sessionStorage.getItem(FREE_NAMES_SESSION_KEY) || "null",
    );
    expect(stored.cards[0].hanzi).toBe("赵梅雪");
  });

  it("shows the rate-limit bar immediately on a limited first visit, never empty cards", async () => {
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
    render(<Generator onCustomize={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText(/a few names each day/i)).toBeInTheDocument();
    });
    expect(screen.queryByText("Waiting for a click")).not.toBeInTheDocument();
    expect(screen.queryByText("甲乙丙")).not.toBeInTheDocument();
  });

  it("does not auto-fetch when QA forces the empty visual state", async () => {
    render(<Generator forcedState="empty" onCustomize={() => {}} />);
    expect(screen.getByText("Waiting for a click")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("renders crawler sample cards without calling the generation API", () => {
    render(
      <Generator
        sampleCards={CRAWLER_SAMPLE_CARDS}
        onCustomize={() => {}}
      />,
    );
    expect(screen.getByText(CRAWLER_SAMPLE_CARDS[0].hanzi)).toBeInTheDocument();
    expect(screen.getByText(CRAWLER_SAMPLE_CARDS[1].hanzi)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.queryByText("Waiting for a click")).not.toBeInTheDocument();
  });

  it("dedupes overlapping first-load requests so Strict Mode remounts do not double-count", async () => {
    const pending = deferred<ReturnType<typeof okCards>>();
    const fetchMock = vi.fn().mockImplementation(() => pending.promise);
    vi.stubGlobal("fetch", fetchMock);
    const first = render(<Generator onCustomize={() => {}} />);
    first.unmount();
    render(<Generator onCustomize={() => {}} />);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    pending.resolve(okCards());
    await waitFor(() => {
      expect(screen.getByText("甲乙丙")).toBeInTheDocument();
    });
  });
});
