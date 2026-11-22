/** @vitest-environment jsdom */
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { HomePage } from "@/components/HomePage";
import { CustomizeForm } from "@/components/CustomizeForm";
import { SiteFooter } from "@/components/SiteFooter";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import {
  GOVERNING_LAW,
  LEGAL_NAME,
  REGISTERED_ADDRESS,
  SUPPORT_EMAIL,
} from "@/lib/site";

const REMOVED_PLACEHOLDERS = [
  "[Legal name — to be provided]",
  "[Registered address — to be provided]",
  "[Governing law / country or region — to be provided]",
  "[Support email — to be provided]",
  "to be provided",
];

function expectSupportContact(container: HTMLElement, minCount = 1) {
  const links = within(container).getAllByRole("link", { name: SUPPORT_EMAIL });
  expect(links.length).toBeGreaterThanOrEqual(minCount);
  for (const link of links) {
    expect(link).toHaveAttribute("href", `mailto:${SUPPORT_EMAIL}`);
  }
}

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
    expectSupportContact(footer as HTMLElement);
  });

  it("shows Terms and Privacy links in the homepage footer without login", () => {
    render(<HomePage forcedState="empty" />);
    const footer = screen.getByRole("contentinfo");
    expectLegalLinks(footer);
    expectSupportContact(footer);
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
  it("renders Waffo review terms: processor, one-time price, and operator identity", () => {
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
    expect(text).toContain(LEGAL_NAME);
    expect(text).toContain(REGISTERED_ADDRESS);
    expect(text).toContain(GOVERNING_LAW);
    expect(text).toContain(`Operator: ${LEGAL_NAME}`);
    expect(text).toContain(`Registered address: ${REGISTERED_ADDRESS}`);
    expect(text).toContain(
      `These terms are governed by ${GOVERNING_LAW}`,
    );
    for (const placeholder of REMOVED_PLACEHOLDERS) {
      expect(text).not.toContain(placeholder);
    }
    expect(text).toContain(SUPPORT_EMAIL);
    expectSupportContact(container, 7);
    expectLegalLinks(screen.getByRole("contentinfo"));
  });

  it("renders the privacy policy with Waffo, card-data, and controller identity", () => {
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
    expect(text).toContain(LEGAL_NAME);
    expect(text).toContain(REGISTERED_ADDRESS);
    expect(text).not.toContain(GOVERNING_LAW);
    for (const placeholder of REMOVED_PLACEHOLDERS) {
      expect(text).not.toContain(placeholder);
    }
    expect(text).toContain(SUPPORT_EMAIL);
    expectSupportContact(container, 6);
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
