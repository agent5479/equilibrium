"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { routePath } from "@/lib/paths";

export default function Footer() {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <footer className="site-footer">
        <div className="container">
          <p>
            © Copyright — Equilibrium Kinesiology &amp; Nutrition. Patricia Smith —
            Takaka, Golden Bay, New Zealand (NZ). All rights reserved.
          </p>
          <p className="footer-local-link">
            <Link href={routePath("/local/")}>
              Patricia Smith · Equilibrium · Takaka, Golden Bay, NZ
            </Link>
          </p>
        </div>
      </footer>
      <div className="socket-footer">
        Equilibrium Kinesiology &amp; Nutrition — Takaka, Golden Bay, NZ
      </div>
      <button
        className={`scroll-top${showScroll ? " visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </>
  );
}
