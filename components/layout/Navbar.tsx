
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { name: "HOME", href: "/#home" },
  { name: "ABOUT", href: "/#about" },
  { name: "MEMBERSHIP", href: "/#membership" },
  { name: "TRAINERS", href: "/#trainers" },
  { name: "GALLERY", href: "/#gallery" },
  { name: "REVIEWS", href: "/#testimonials" },
  { name: "CONTACT", href: "/#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 35);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-[#090B12]/95 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-[82px] max-w-[1450px] items-center justify-between px-6 lg:px-12">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="group flex items-center gap-2"
          >
            <span className="text-[25px] font-black tracking-[-1.5px]">
              FIT<span className="text-[#287BFF]">NOVA</span>
              <span className="text-[#FF7438]">.</span>
            </span>

            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FF7438] transition group-hover:scale-150" />
          </Link>

          <div className="hidden items-center gap-6 xl:flex">
            {links.map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                className="group relative py-3 text-[10px] font-bold tracking-[1.3px] text-gray-400 transition hover:text-white"
              >
                <span className="absolute -left-3 top-3 text-[8px] text-[#287BFF] opacity-0 transition group-hover:opacity-100">
                  0{index + 1}
                </span>

                {link.name}

                <span className="absolute bottom-1 left-0 h-px w-0 bg-[#287BFF] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <Link
            href="/#membership"
            className="group hidden items-center gap-3 border border-[#287BFF]/60 px-4 py-3 text-[10px] font-bold tracking-[1px] transition duration-300 hover:border-[#FF7438] hover:bg-[#FF7438] xl:flex"
          >
            BECOME A MEMBER
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center border border-white/15 text-white transition hover:border-[#287BFF] xl:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-[#090B12] transition-all duration-500 xl:hidden ${
          menuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-3 opacity-0"
        }`}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto px-7 pb-10 pt-28">
          <div>
            <p className="mb-6 text-[10px] font-bold tracking-[4px] text-[#287BFF]">
              EXPLORE / FITNOVA
            </p>

            {links.map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between border-b border-white/10 py-3.5"
              >
                <span className="text-xl font-black tracking-tight transition group-hover:text-[#287BFF]">
                  {link.name}
                </span>

                <span className="text-xs tracking-widest text-gray-600">
                  0{index + 1}
                </span>
              </Link>
            ))}
          </div>

          <div className="pt-8">
            <Link
              href="/#membership"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between bg-[#287BFF] px-6 py-5 text-xs font-bold tracking-[2px] transition hover:bg-[#FF7438]"
            >
              BECOME A MEMBER
              <ArrowUpRight size={20} />
            </Link>

            <p className="mt-6 text-[9px] tracking-[3px] text-gray-600">
              TRAIN DIFFERENT. LIVE DIFFERENT.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
