/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { HomePage } from "@/components/HomePage";
import { CustomizeForm } from "@/components/CustomizeForm";
import { SiteFooter } from "@/components/SiteFooter";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";

const PLACEHOLDERS = [
  "[Legal name — to be provided]",
  "[Registered address — to be provided]",
  "[Support email — to be provided]",
  "[Governing law / country or region — to be provided]",
];

function expectLegalLinks(container: HTMLElement) {
  const terms = within(container).getByRole("link", { name: "Terms of Service" });
  const privacy = within(container).getByRole("link", { name: "Privacy Policy" });
  expect(terms).toHaveAttribute("href", "/terms");
  expect(privacy).toHaveAttribute("href", "/privacy");
}

describe("SiteFooter and checkout legal links", () => {
  it("links to /terms and /privacy from the shared footer", () => {
    const { container } = render(<SiteFooter />);
    const footer = container.querySelector("footer");
    expect(footer).not.toBeNull();
    expectLegalLinks(footer as HTMLElement);
    expect(footer).toHaveTextContent("CallMeMing");
    expect(footer).toHaveTextContent("callmeming.com");
    expect(footer).toHaveTextContent("A Real Chinese Name");
  });

  it("shows Terms and Privacy links in the homepage footer without login", () => {
    render(<HomePage initialGenerator="empty" />);
    const footer = screen.getByRole("contentinfo");
    expectLegalLinks(footer);
  });

  it("shows Terms and Privacy links near the paid checkout CTA", () => {
    render(<CustomizeForm />);
    const cta = screen.getByRole("button", { name: /Continue to payment/i });
    const form = cta.closest("form");
    expect(form).not.toBeNull();
    expectLegalLinks(form as HTMLElement);
  });
});

describe("Terms of Service and Privacy Policy pages", () => {
  it("renders Waffo review terms: processor, one-time price, and placeholders", () => {
    const { container } = render(<TermsPage />);
    const text = container.textContent ?? "";

    expect(screen.getByRole("heading", { name: "Terms of Service" })).toBeInTheDocument();
    expect(text).toContain("Waffo Pancake");
    expect(text).toContain("$6.99");
    expect(text).toMatch(/one-time/i);
    expect(text).toMatch(/not a subscription/i);
    expect(text).toMatch(/does not auto-renew/i);
    expect(text).toMatch(
      /does not pass through or get stored on CallMeMing servers/i,
    );
    for (const placeholder of PLACEHOLDERS) {
      expect(text).toContain(placeholder);
    }
    expectLegalLinks(screen.getByRole("contentinfo"));
  });

  it("renders the privacy policy with Waffo, card-data, and placeholder copy", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";

    expect(screen.getByRole("heading", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(text).toContain("Waffo Pancake");
    expect(text).toContain("$6.99");
    expect(text).toMatch(/one-time/i);
    expect(text).toMatch(
      /does not pass through or get stored on CallMeMing servers/i,
    );
    expect(text).toContain("DPO: Not appointed");
    expect(text).toContain("[Legal name — to be provided]");
    expect(text).toContain("[Registered address — to be provided]");
    expect(text).toContain("[Support email — to be provided]");
    expectLegalLinks(screen.getByRole("contentinfo"));
    const termsLinks = within(container).getAllByRole("link", {
      name: "Terms of Service",
    });
    expect(termsLinks.length).toBeGreaterThan(1);
    for (const link of termsLinks) {
      expect(link).toHaveAttribute("href", "/terms");
    }
  });
});
