"use client";

import { useState } from "react";
import Link from "next/link";
import { navigation, type NavItem } from "@/lib/navigation";
import { routePath } from "@/lib/paths";

function NavLinks({ items, depth = 0 }: { items: NavItem[]; depth?: number }) {
  return (
    <ul className={depth === 0 ? "nav-list" : "nav-dropdown"}>
      {items.map((item) => (
        <li key={item.label} className="nav-item">
          {item.href ? (
            <Link href={routePath(item.href)} className="nav-link">
              {item.label}
            </Link>
          ) : (
            <span className="nav-link">{item.label}</span>
          )}
          {item.children && <NavLinks items={item.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <img
            src="/equilibrium/assets/wp-content/uploads/2023/02/logo.png"
            alt="Equilibrium Kinesiology & Nutrition"
            width={200}
            height={80}
          />
        </Link>

        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <nav className={`main-nav${menuOpen ? " open" : ""}`}>
          <NavLinks items={navigation} />
        </nav>

        <div className="header-social">
          <a
            href="https://www.facebook.com/equilibriumnutritionandyoga"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            f
          </a>
        </div>
      </div>
    </header>
  );
}
