import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — CallMeMing",
  description:
    "Terms of Service for the CallMeMing website: a one-time USD $6.99 custom Chinese name-card purchase, not a subscription.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalShell>
      <header>
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: 11 November 2026</p>
        <p className="legal-disclaimer">
          These pages are provided to support payment-provider merchant review
          and to explain the rules that govern the CallMeMing website. They do
          not constitute legal advice. The provisions below are the terms that
          apply to your use of this website and the paid service.
        </p>
      </header>

      <h2>1. Who we are</h2>
      <p>
        CallMeMing (“A Real Chinese Name,” “we,” “us,” or “our”) operates this
        website. We provide Chinese personal names for language learners — not
        transliterations and not fortune-telling.
      </p>
      <p>
        Operator: [Legal name — to be provided]
        <br />
        Registered address: [Registered address — to be provided]
        <br />
        Support, billing, refunds, privacy, and legal contact:{" "}
        [Support email — to be provided]
      </p>

      <h2>2. Acceptance and eligibility</h2>
      <p>
        By using this website or completing checkout, you agree to these Terms
        of Service. If you do not agree, do not use the website or purchase the
        paid service.
      </p>
      <p>
        You must be at least 18 years old to use this website or complete a
        purchase. If you use the website on behalf of an organization, you
        confirm that you have authority to bind that organization.
      </p>

      <h2>3. The service</h2>
      <p>
        CallMeMing offers a free name generator and an optional paid custom
        name-card product. Both are digital services. Nothing physical is
        shipped.
      </p>
      <p>
        <strong>Free generation.</strong> You may generate three light name
        cards — Chinese characters and pinyin — drawn from our in-house
        lexicon. The free path does not call a large language model. It is not
        fortune-telling and it is not a phonetic transliteration of an English
        name. We apply hourly and daily rate limits by IP address to keep the
        free path available and to prevent abuse.
      </p>
      <p>
        <strong>Paid custom name cards.</strong> For a single one-time purchase
        of USD $6.99, you receive three complete custom name cards. Each card
        includes meaning, pronunciation, and an English self-introduction.
        Taxes may apply at checkout. This purchase is not a subscription, does
        not auto-renew, and is not a credit pack or auto-top-up.
      </p>
      <p>
        Characters and pinyin for paid cards also come from our lexicon. A
        third-party AI model writes the English explanations; it does not
        change the chosen characters.
      </p>
      <p>
        <strong>Delivery.</strong> After payment is confirmed, we deliver the
        paid results by email and by a secure result link. The link is valid
        for one year from order creation and then expires. You do not need an
        account, registration, or login to use the free generator, complete
        checkout, or open your result link. We do not issue passwords or user
        accounts in this version of the service.
      </p>
      <p>
        If an order is refunded, the result link stops working. An unavailable
        link is presented in the same way whether it is invalid, expired, or
        tied to a refunded order.
      </p>

      <h2>4. Payment authorization</h2>
      <p>
        When you complete checkout, you authorize a single, one-time charge of
        USD $6.99, plus any taxes that apply at checkout. This is not a
        recurring or auto-renewing authorization.
      </p>
      <p>
        Payments are processed by Waffo Pancake. Payment card data is processed
        exclusively by Waffo Pancake, which is responsible for PCI-DSS
        compliance. Card data does not pass through or get stored on CallMeMing
        servers. We may store the transaction amount and status, order
        identifiers, and the buyer email address as needed to fulfill the
        order and keep records.
      </p>

      <h2>5. Cancellation</h2>
      <p>
        Because this is a one-time purchase and not a subscription, there is no
        recurring plan to cancel and no auto-renewal to turn off. Requests for
        a refund of a completed or failed purchase are handled under the refund
        policy below.
      </p>

      <h2>6. Refund policy</h2>
      <p>
        We do not claim that refunds are never available. The following rules
        apply, together with any rights you have under applicable law.
      </p>
      <ul>
        <li>
          Duplicate or erroneous charges will be refunded.
        </li>
        <li>
          If generation fails after payment, or if your paid results are not
          delivered, you may request a refund. A failed generation is not
          refunded automatically; please email us and we will review the order.
        </li>
        <li>
          Statutory rights are reserved, including any cooling-off or withdrawal
          rights that apply to you (for example, in the EU or the United
          Kingdom) where those rights cannot be waived.
        </li>
        <li>
          After the name cards have been delivered, refunds are generally not
          available except as required by law or in the cases above.
        </li>
      </ul>
      <p>
        To request a refund, email [Support email — to be provided] with your
        order details or the email address used at checkout. We aim to reply
        within 2 business days. Eligible refunds are issued in 5–10 business
        days to the original payment method.
      </p>

      <h2>7. Billing disputes</h2>
      <p>
        If you believe a charge is incorrect, please contact us at{" "}
        [Support email — to be provided] before filing a chargeback with your
        card issuer. We will review the order and, where a refund is due, process
        it under the policy above. This does not limit any rights you have
        against your payment provider.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        We and our licensors own this website, our lexicon, our branding, and
        the software and design of the service. These terms do not transfer
        that ownership to you.
      </p>
      <p>
        You own the generated name cards and text created for you — including
        free specimen names and paid custom name cards — and may use them for
        personal purposes, such as introducing yourself. You grant us a
        limited license to generate, store, email, and display those materials
        solely as needed to provide the service and fulfill your order.
      </p>
      <p>
        You retain your rights in the inputs you provide, such as your English
        name and preferences. We will not use your inputs to train AI models
        without your consent.
      </p>

      <h2>9. Third-party AI</h2>
      <p>
        Paid English explanations are produced with a third-party AI model
        (Anthropic Claude). Characters and pinyin are selected from our
        lexicon; the model is not used to change those characters. AI-generated
        text may be inaccurate or incomplete. It is not professional, legal,
        medical, or financial advice, and it is not fortune-telling.
      </p>

      <h2>10. Acceptable use</h2>
      <p>You may not:</p>
      <ul>
        <li>use the service for any unlawful purpose;</li>
        <li>
          infringe, misappropriate, or violate the intellectual property or
          other rights of any person;
        </li>
        <li>
          use the service in connection with the exploitation of minors, or
          to generate or request sexual content involving minors;
        </li>
        <li>
          resell, sublicense, or commercially redistribute access to this
          website or the generation service;
        </li>
        <li>
          scrape or bulk-harvest names, or use the service or its outputs to
          train, develop, or improve a competing name-generation or AI model;
        </li>
        <li>
          attempt to bypass rate limits, probe or disrupt security, or
          interfere with other users; or
        </li>
        <li>
          submit content that is fraudulent, or that impersonates another
          person in order to deceive.
        </li>
      </ul>
      <p>
        We may refuse, rate-limit, or terminate access if we reasonably believe
        you have violated these terms or are abusing the service.
      </p>

      <h2>11. Privacy</h2>
      <p>
        Our collection and use of personal information is described in the{" "}
        <Link href="/privacy">Privacy Policy</Link>. By using this website, you
        acknowledge that policy.
      </p>

      <h2>12. Disclaimers</h2>
      <p>
        The service is provided “as is” and “as available.” To the fullest
        extent permitted by law, we disclaim warranties of merchantability,
        fitness for a particular purpose, and non-infringement. We do not
        warrant that the service will be uninterrupted, error-free, or that a
        generated name will meet a particular cultural, personal, or
        professional expectation.
      </p>
      <p>
        Generated names and explanations may be inaccurate. They are not a
        substitute for professional, legal, medical, or financial advice, and
        they are not fortune-telling, destiny scores, or traditional
        naming consultations such as 八字 or 五行.
      </p>

      <h2>13. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for indirect,
        incidental, special, consequential, or punitive damages, or for lost
        profits, data, or goodwill, arising out of or in connection with the
        service.
      </p>
      <p>
        Our total liability arising out of or in connection with the service
        will not exceed the amounts you paid to us for the service in the 12
        months before the claim.
      </p>
      <p>
        Nothing in these terms limits liability for death or personal injury
        caused by negligence, for fraud or fraudulent misrepresentation, or for
        any other liability that cannot be limited under applicable law.
      </p>

      <h2>14. Term, refusal of service, and deletion</h2>
      <p>
        These terms apply while you use this website and, for paid orders, for
        as long as needed to fulfill the order and meet our legal record-keeping
        duties. We may refuse or suspend access in cases of abuse, fraud, legal
        risk, or material breach of these terms.
      </p>
      <p>
        To request deletion of personal information we hold, email{" "}
        [Support email — to be provided]. We will handle the request as
        described in the Privacy Policy, subject to records we must retain
        under law.
      </p>

      <h2>15. Changes</h2>
      <p>
        We may update these terms from time to time. We will post the revised
        terms on this website and change the “Last updated” date. Where we have
        an email address for you (for example, from a paid order), we will give
        at least 14 days’ notice of material changes where reasonably
        practicable. If you continue to use the website after the updated terms
        take effect, you agree to the revised terms. If you do not agree, you
        should stop using the website and contact us about any open order.
      </p>

      <h2>16. Governing law and informal resolution</h2>
      <p>
        These terms are governed by the laws of{" "}
        [Governing law / country or region — to be provided], without regard to
        conflict-of-law rules, except where mandatory consumer-protection laws
        of your country or region of residence apply and cannot be waived.
      </p>
      <p>
        Before starting a formal dispute, please contact us at{" "}
        [Support email — to be provided] so we can try to resolve the matter
        informally.
      </p>

      <h2>17. Contact</h2>
      <div className="legal-contact">
        <p>[Legal name — to be provided]</p>
        <p>[Registered address — to be provided]</p>
        <p>[Support email — to be provided]</p>
      </div>
      <p>
        Related: <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalShell>
  );
}
