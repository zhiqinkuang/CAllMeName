/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomizeForm } from "@/components/CustomizeForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("CustomizeForm checkout wiring", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          checkoutUrl: "https://checkout.waffo.ai/cs_ok",
        }),
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not fetch when english name empty", async () => {
    const user = userEvent.setup();
    render(<CustomizeForm />);
    const input = screen.getByPlaceholderText("Your English name");
    await user.clear(input);
    await user.click(
      screen.getByRole("button", { name: /Continue to payment/i }),
    );
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByText(/Please enter your English name/i)).toBeInTheDocument();
  });

  it("submits contract feeling enum and redirects via location.href", async () => {
    const hrefSetter = vi.fn();
    const loc: { href: string } = { href: "" };
    Object.defineProperty(loc, "href", {
      configurable: true,
      get: () => "",
      set: hrefSetter,
    });
    const open = vi.fn();
    // jsdom has window — point its location at our stub
    Object.defineProperty(window, "location", {
      configurable: true,
      value: loc,
    });
    vi.stubGlobal("open", open);
    window.open = open;

    const user = userEvent.setup();
    render(<CustomizeForm />);
    // Feelings are now contract six — pick Calm (already default; click still OK)
    await user.click(screen.getByRole("button", { name: "Calm" }));
    await user.click(
      screen.getByRole("button", { name: /Continue to payment/i }),
    );
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse(
      (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(body.desiredFeeling).toBe("calm");
    expect(body.englishName).toBe("Elena");
    await waitFor(() =>
      expect(hrefSetter).toHaveBeenCalledWith("https://checkout.waffo.ai/cs_ok"),
    );
    expect(open).not.toHaveBeenCalled();
  });
});
