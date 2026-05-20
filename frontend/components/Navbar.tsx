"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/methodology", label: "Methodology" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="border-b" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-8">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Calgary Crime Forecast
        </Link>
        <div className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === l.href
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
