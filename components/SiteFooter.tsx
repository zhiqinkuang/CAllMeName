import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/site";

export function SupportEmailLink() {
  return <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-marks">
        <span className="brand">CallMeMing</span>
        <span>callmeming.com</span>
        <span>A Real Chinese Name</span>
      </div>
      <nav className="footer-legal" aria-label="Legal and contact">
        <SupportEmailLink />
        <Link href="/terms">Terms of Service</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </nav>
    </footer>
  );
}
