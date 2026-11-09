import Link from "next/link";

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="wm" aria-label="CallMeMing home">
      <span className="mark" aria-hidden>
        名
      </span>
      <span className="wm-text">CallMeMing</span>
    </Link>
  );
}
