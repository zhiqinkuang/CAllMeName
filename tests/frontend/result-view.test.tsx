/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const getResult = vi.fn();

vi.mock("@/lib/api/results", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/results")>(
    "@/lib/api/results",
  );
  return {
    ...actual,
    getResult: (...args: unknown[]) => getResult(...args),
  };
});

import { ResultView } from "@/components/ResultView";

const card = (hanzi: string) => ({
  hanzi,
  pinyin: `Pinyin ${hanzi}`,
  phoneticHint: `hint-${hanzi}`,
  audioUrl: null as string | null,
  whyItFitsYou: `why ${hanzi}`,
  selfIntroduction: `Hi, my Chinese name is ${hanzi}.`,
});

describe("ResultView F-T7/F-T8", () => {
  beforeEach(() => {
    getResult.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("polls generating then renders ready cards", async () => {
    getResult
      .mockResolvedValueOnce({ ok: true, status: "generating" })
      .mockResolvedValueOnce({
        ok: true,
        status: "ready",
        cards: [card("林安然"), card("苏景行"), card("沈清越")],
      });

    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<ResultView token="tok_abc" />);

    await waitFor(() => {
      expect(
        screen.getByText(/preparing your Chinese names/i),
      ).toBeInTheDocument();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });

    await waitFor(() => {
      expect(screen.getByText("林安然")).toBeInTheDocument();
    });
    expect(getResult).toHaveBeenCalledTimes(2);
  });

  it("Copy name copies hanzi; Copy intro copies selfIntroduction", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    // jsdom may lack clipboard; install a writable mock
    // @ts-expect-error test shim
    navigator.clipboard = { writeText };

    getResult.mockResolvedValue({
      ok: true,
      status: "ready",
      cards: [card("林安然"), card("苏景行"), card("沈清越")],
    });

    render(<ResultView token="tok_copy" />);
    await waitFor(() => expect(screen.getByText("林安然")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("copy-name"));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("林安然"));
    expect(screen.getByText(/Copied name/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("copy-intro"));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("Hi, my Chinese name is 林安然."),
    );
  });

  it("Open paper elevates another card to primary", async () => {
    getResult.mockResolvedValue({
      ok: true,
      status: "ready",
      cards: [card("林安然"), card("苏景行"), card("沈清越")],
    });
    const user = userEvent.setup();
    render(<ResultView token="tok" />);
    await waitFor(() => expect(screen.getByText("林安然")).toBeInTheDocument());
    const openButtons = screen.getAllByRole("button", { name: /Open paper/i });
    await user.click(openButtons[0]);
    await waitFor(() => {
      expect(
        screen.getByText(/State · Open paper → 苏景行/),
      ).toBeInTheDocument();
    });
  });

  it("shows not_found without name cards", async () => {
    getResult.mockResolvedValue({
      ok: false,
      status: "not_found",
      message: "This result link is invalid.",
    });
    render(<ResultView token="bad" />);
    await waitFor(() => {
      expect(
        screen.getByText(/This result link is not available/i),
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /Copy name/i })).toBeNull();
  });
});
