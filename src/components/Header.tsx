"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation, type NavItem } from "@/lib/navigation";
import { routePath } from "@/lib/paths";
import OptimizedImage from "@/components/OptimizedImage";

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function isActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  const normalized = routePath(href);
  if (normalized === "/") return pathname === "/" || pathname === "";
  return pathname.startsWith(normalized.replace(/\/$/, ""));
}

function DesktopDropdownItem({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  if (item.children?.length) {
    return (
      <li className="nav-dropdown-group">
        <span className="nav-dropdown-label">{item.label}</span>
        <ul className="nav-dropdown-sublist">
          {item.children.map((child) => (
            <DesktopDropdownItem key={child.label} item={child} onNavigate={onNavigate} />
          ))}
        </ul>
      </li>
    );
  }

  if (!item.href) {
    return (
      <li>
        <span className="nav-dropdown-label">{item.label}</span>
      </li>
    );
  }

  const active = isActive(pathname, item.href);
  return (
    <li>
      <Link
        href={routePath(item.href)}
        className={`nav-link${active ? " nav-link--active" : ""}`}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    </li>
  );
}

function NavItemComponent({
  item,
  depth = 0,
  mobile = false,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hasChildren = Boolean(item.children?.length);
  const isBookCta = item.label === "Book a Session";
  const active = item.href ? isActive(pathname, item.href) : false;

  if (hasChildren && mobile) {
    return (
      <li className={`nav-item nav-item--depth-${depth}`}>
        <button
          type="button"
          className="nav-link nav-accordion-trigger"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          {item.label}
          <span className={`nav-chevron${open ? " nav-chevron--open" : ""}`}>▾</span>
        </button>
        {open && (
          <ul className="nav-dropdown nav-dropdown--mobile">
            {item.children!.map((child) => (
              <NavItemComponent
                key={child.label}
                item={child}
                depth={depth + 1}
                mobile
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  if (hasChildren && !mobile) {
    return (
      <li className="nav-item nav-item--has-children">
        <span className="nav-link nav-link--parent">
          {item.label}
          <span className="nav-chevron">▾</span>
        </span>
        <ul className="nav-dropdown">
          {item.children!.map((child) => (
            <DesktopDropdownItem key={child.label} item={child} onNavigate={onNavigate} />
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li className={`nav-item nav-item--depth-${depth}`}>
      {item.href ? (
        <Link
          href={routePath(item.href)}
          className={`nav-link${active ? " nav-link--active" : ""}${isBookCta ? " nav-link--cta" : ""}`}
          onClick={onNavigate}
        >
          {item.label}
        </Link>
      ) : (
        <span className="nav-link nav-link--parent">{item.label}</span>
      )}
    </li>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <div className="container header-inner">
        <Link href="/" className="logo">
          <OptimizedImage
            src="/assets/wp-content/uploads/2023/02/logo.png"
            alt="Equilibrium Kinesiology & Nutrition"
            className="logo-img"
            sizes="200px"
            priority
          />
        </Link>

        <button
          type="button"
          className={`mobile-toggle${menuOpen ? " mobile-toggle--open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`main-nav${menuOpen ? " main-nav--open" : ""}`} aria-label="Main">
          <ul className="nav-list nav-list--desktop">
            {navigation.map((item) => (
              <NavItemComponent key={item.label} item={item} onNavigate={closeMenu} />
            ))}
          </ul>
          <ul className="nav-list nav-list--mobile">
            {navigation.map((item) => (
              <NavItemComponent key={item.label} item={item} mobile onNavigate={closeMenu} />
            ))}
          </ul>
        </nav>

        <div className="header-social">
          <a
            href="https://www.facebook.com/equilibriumnutritionandyoga"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <FacebookIcon />
          </a>
        </div>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="nav-backdrop"
          onClick={closeMenu}
          aria-label="Close menu"
        />
      )}
    </header>
  );
}
