import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-marks">
        <span className="brand">CallMeMing</span>
        <span>callmeming.com</span>
        <span>A Real Chinese Name</span>
      </div>
      <nav className="footer-legal" aria-label="Legal">
        <Link href="/terms">Terms of Service</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </nav>
    </footer>
  );
}
