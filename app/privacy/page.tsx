import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — CallMeMing",
  description:
    "Privacy Policy for the CallMeMing website, describing the personal information we collect and how we use it.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalShell>
      <header>
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: 11 November 2026</p>
        <p className="legal-disclaimer">
          These pages are provided to support payment-provider merchant review
          and to explain how CallMeMing handles personal information. They do
          not constitute legal advice. The provisions below describe our actual
          practices on this website.
        </p>
      </header>

      <h2>1. Who is responsible</h2>
      <p>
        The controller of personal information collected through the CallMeMing
        website is:
      </p>
      <div className="legal-contact">
        <p>[Legal name — to be provided]</p>
        <p>[Registered address — to be provided]</p>
        <p>[Support email — to be provided]</p>
      </div>
      <p>DPO: Not appointed</p>
      <p>
        For privacy questions, the same address — [Support email — to be
        provided] — is the contact we monitor.
      </p>

      <h2>2. Information we collect</h2>
      <p>
        We collect only what we need to run the generator, fulfill a paid order,
        keep the service secure, and meet legal duties. We do not require an
        account, password, or registration. We do not collect a shipping
        address. We do not use third-party social login. We do not collect
        precise location; we may see an IP address as described below.
      </p>
      <p>You may provide:</p>
      <ul>
        <li>your English name;</li>
        <li>a name-style or gender preference;</li>
        <li>the feeling you want a name to convey;</li>
        <li>a buyer email address at checkout; and</li>
        <li>whatever you choose to include in a support email to us.</li>
      </ul>
      <p>We collect automatically:</p>
      <ul>
        <li>
          IP address, which we hash for rate limiting on the free generator;
        </li>
        <li>
          basic device and browser information, and request logs; and
        </li>
        <li>error logs.</li>
      </ul>
      <p>
        When you pay, Waffo Pancake processes the payment. We may receive and
        store the transaction amount and status, order identifiers, and the
        buyer email address as needed to fulfill the order. Payment card data
        is processed exclusively by Waffo Pancake (PCI-DSS) and does not pass
        through or get stored on CallMeMing servers.
      </p>

      <h2>3. How we use information and legal bases</h2>
      <p>
        Where data-protection law requires a legal basis, we rely on the bases
        below.
      </p>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Legal basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              Provide free name generation and enforce hourly and daily rate
              limits
            </td>
            <td>Legitimate interests in operating and protecting the service</td>
          </tr>
          <tr>
            <td>
              Process a one-time USD $6.99 purchase, fulfill the order, and
              send the result email and service notices about that order
            </td>
            <td>Performance of a contract with you</td>
          </tr>
          <tr>
            <td>
              Provide your information to Waffo Pancake as needed to process
              payment
            </td>
            <td>Performance of a contract with you</td>
          </tr>
          <tr>
            <td>
              Generate paid English explanations with a third-party AI model
            </td>
            <td>Performance of a contract with you</td>
          </tr>
          <tr>
            <td>Respond to support, refund, and billing requests</td>
            <td>
              Performance of a contract and our legitimate interests in helping
              you
            </td>
          </tr>
          <tr>
            <td>Security, fraud prevention, and abuse detection</td>
            <td>
              Legitimate interests in keeping the website and payments safe
            </td>
          </tr>
          <tr>
            <td>Tax, accounting, and other legal record-keeping</td>
            <td>Legal obligation</td>
          </tr>
        </tbody>
      </table>
      <p>
        Email we send in the ordinary course is for fulfillment and service
        notices (for example, delivering your result link). We do not operate a
        marketing-email program. If we ever send marketing email, we will do so
        only with your consent, and you may withdraw that consent at any time.
      </p>
      <p>
        We will not use your inputs to train AI models without your consent.
      </p>

      <h2>4. Cookies and similar technologies</h2>
      <p>
        We do not use advertising cookies, marketing pixels, or an analytics
        suite such as Google Analytics. We do not present a cookie-consent
        banner because we do not use non-essential cookies for analytics or
        advertising.
      </p>
      <p>
        This website and our hosting provider may use strictly necessary
        technical cookies or similar storage solely to operate and secure the
        service (for example, to deliver the page or maintain basic
        infrastructure). You can block cookies in your browser, but parts of
        the website may then not work as intended.
      </p>

      <h2>5. How we share information</h2>
      <p>We do not sell personal information, including in the CCPA sense.</p>
      <p>
        We share information with service providers who process it on our
        instructions and only as needed to provide the service:
      </p>
      <ul>
        <li>
          Waffo Pancake, which processes payments and payment card data;
        </li>
        <li>
          Anthropic, which provides the Claude model used to write paid English
          explanations (characters and pinyin come from our lexicon and are not
          changed by the model); and
        </li>
        <li>
          third-party hosting and email providers that may store or transmit
          order data, result emails, and technical logs in order to run this
          website.
        </li>
      </ul>
      <p>
        We may also disclose information if required by law, to protect the
        rights or safety of our users or the public, or in connection with a
        genuine legal claim. If we were to transfer the service as part of a
        reorganization or sale, information would move with it under this
        policy or a successor policy.
      </p>

      <h2>6. International transfers</h2>
      <p>
        Our processors and hosting providers may be located outside your
        country or region, including in places that may not provide the same
        legal protections. Where required, we use appropriate safeguards such
        as Standard Contractual Clauses (SCCs) or an equivalent lawful transfer
        mechanism.
      </p>

      <h2>7. Retention</h2>
      <p>We keep personal information only as long as needed for the purposes
        above, including the periods below.</p>
      <table>
        <thead>
          <tr>
            <th>Information</th>
            <th>Retention</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Secure result links</td>
            <td>
              1 year from order creation, after which the link expires. If an
              order is refunded, the link stops working sooner.
            </td>
          </tr>
          <tr>
            <td>
              Transaction records (amount, status, order identifiers, and buyer
              email as needed)
            </td>
            <td>7 years, for tax and accounting obligations</td>
          </tr>
          <tr>
            <td>Support email correspondence</td>
            <td>2 years</td>
          </tr>
          <tr>
            <td>Security, request, and error logs</td>
            <td>12 months</td>
          </tr>
          <tr>
            <td>Hashed IP addresses used for rate limiting</td>
            <td>
              Only as needed to enforce hourly and daily limits, and in
              security logs for up to 12 months
            </td>
          </tr>
        </tbody>
      </table>

      <h2>8. Security</h2>
      <p>
        We take reasonable technical and organizational measures to protect
        personal information. In production, this website is served over TLS.
        Result links use hashed tokens; we do not store the raw result token
        as a standing database field. Payment card data is not stored on our
        servers. IP addresses used for rate limiting are stored in hashed
        form.
      </p>
      <p>
        No method of transmission or storage is completely secure. We do not
        claim ISO 27001, SOC 2, or similar certifications.
      </p>

      <h2>9. Personal data breaches</h2>
      <p>
        Where a personal data breach is required to be reported, we aim to
        notify the competent authority within 72 hours of becoming aware of
        it, and to inform affected individuals when the law requires us to do
        so.
      </p>

      <h2>10. Your rights</h2>
      <p>
        Depending on the law that applies to you (including the GDPR and
        similar frameworks), you may have the right to:
      </p>
      <ul>
        <li>access the personal information we hold about you;</li>
        <li>correct inaccurate information;</li>
        <li>request erasure;</li>
        <li>restrict or object to certain processing;</li>
        <li>receive a portable copy of information you provided; and</li>
        <li>withdraw consent where processing is based on consent.</li>
      </ul>
      <p>
        To exercise these rights, email [Support email — to be provided]. We
        will respond within 30 calendar days, or sooner if a shorter period is
        required by law. You may also lodge a complaint with your local data
        protection authority.
      </p>
      <p>
        Because this version of the service has no user accounts, we may need
        to ask you for information (such as the email used at checkout or an
        order identifier) so we can locate and verify your request.
      </p>

      <h2>11. Children</h2>
      <p>
        The service is for individuals who are 18 years or older. We do not
        knowingly collect personal information from anyone under 18. If you
        believe a child has provided information to us, contact{" "}
        [Support email — to be provided] and we will delete it.
      </p>

      <h2>12. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the
        revised policy on this website and change the “Last updated” date.
        Where we have an email address for you, we aim to give about 15 days’
        notice of material changes. The updated policy applies from its
        effective date.
      </p>

      <h2>13. Contact</h2>
      <div className="legal-contact">
        <p>[Legal name — to be provided]</p>
        <p>[Registered address — to be provided]</p>
        <p>[Support email — to be provided]</p>
      </div>
      <p>DPO: Not appointed</p>
      <p>
        Related: <Link href="/terms">Terms of Service</Link>.
      </p>
    </LegalShell>
  );
}
