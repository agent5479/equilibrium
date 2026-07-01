"use client";

import { useEffect, useState } from "react";

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
          <p>© Copyright - Equilibrium Kinesiology &amp; Nutrition. All rights reserved.</p>
        </div>
      </footer>
      <div className="socket-footer">
        Equilibrium Kinesiology &amp; Nutrition
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
