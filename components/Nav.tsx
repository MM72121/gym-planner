"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { label: "Home", href: "/" },
  { label: "Import", href: "/import" },
  { label: "Volume", href: "/volume" },
  { label: "Recommend", href: "/recommend" },
  { label: "Exercises", href: "/exercises" },
  { label: "Preferences", href: "/preferences" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-black text-white border-b border-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 overflow-x-auto">
        <div className="flex gap-4 sm:gap-8 min-w-min sm:min-w-0">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
