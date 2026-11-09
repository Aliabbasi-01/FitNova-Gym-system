
import Link from "next/link";
import { ArrowUpRight, Dumbbell } from "lucide-react";

const links = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Membership", href: "#membership" },
  { name: "Trainers", href: "#trainers" },
  { name: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#090B12]">
      <div className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-[#287BFF]/10 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-6 pb-7 pt-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.3fr_0.7fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 no-underline">
              <Dumbbell size={25} className="text-[#287BFF]" />
              <span className="text-2xl font-black text-white">
                FIT<span className="text-[#287BFF]">NOVA</span><span className="text-[#FF7438]">.</span>
              </span>
            </Link>

            <h2 className="mt-6 text-3xl font-black leading-tight text-white">
              STRONGER <span className="text-[#287BFF]">STARTS HERE.</span>
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-400">
              Build strength, improve your fitness and become a better version
              of yourself with FitNova.
            </p>

            <div className="mt-5 flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-xs font-bold text-gray-400 no-underline transition hover:border-[#FF7438] hover:bg-[#FF7438] hover:text-white">
                IG
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-base font-bold text-gray-400 no-underline transition hover:border-[#287BFF] hover:bg-[#287BFF] hover:text-white">
                f
              </a>
            </div>
          </div>

          <div>
            <p className="mb-5 text-[10px] font-bold tracking-[3px] text-[#287BFF]">
              EXPLORE
            </p>

            <div className="flex flex-col gap-4">
              {links.map((link, index) => (
                <Link key={link.name} href={link.href}
                  className="flex items-center gap-3 text-sm text-gray-400 no-underline transition hover:text-white">
                  <span className="text-[9px] text-[#FF7438]">0{index + 1}</span>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-5 text-[10px] font-bold tracking-[3px] text-[#287BFF]">
              YOUR NEXT CHAPTER
            </p>

            <div className="group relative h-44 overflow-hidden rounded-xl">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=85"
                alt="Modern gym interior"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#090B12] via-black/20 to-transparent" />

              <div className="absolute bottom-4 left-4">
                <p className="text-lg font-black text-white">MAKE YOUR MOVE.</p>
                <Link href="#membership"
                  className="mt-2 inline-flex items-center gap-2 text-[10px] font-bold text-white no-underline transition hover:text-[#FF7438]">
                  EXPLORE MEMBERSHIP <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 text-center sm:flex-row">
          <p className="text-xs text-gray-500">
            © 2026 FitNova. All rights reserved.
          </p>

          <p className="text-[9px] font-bold tracking-[2px] text-gray-500">
            TRAIN DIFFERENT. LIVE DIFFERENT.
          </p>

          <Link href="#home"
            className="text-xs text-gray-400 no-underline transition hover:text-[#287BFF]">
            BACK TO TOP ↑
          </Link>
        </div>
      </div>
    </footer>
  );
}
