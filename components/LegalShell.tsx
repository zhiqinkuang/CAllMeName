import Link from "next/link";
import { SiteFooter } from "./SiteFooter";
import { Wordmark } from "./Wordmark";

export function LegalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell">
      <nav className="site-nav">
        <Wordmark />
        <div className="links">
          <Link href="/">Home</Link>
        </div>
      </nav>
      <main className="legal-main">
        <article className="legal-page">{children}</article>
      </main>
      <SiteFooter />
    </div>
  );
}
