
import Navbar from "@/components/layout/Navbar";
import {
  ArrowUpRight,
  ArrowDown,
  Activity,
  MoveUpRight,
  Zap,
} from "lucide-react";
import About from "@/components/sections/About";
import Membership from "@/components/sections/Membership";
import Trainers from "@/components/sections/Trainers";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import Gallery from "@/components/sections/Gallery";
import Testimonials from "@/components/sections/Testimonials";
export const instant = false;
export default function Home() {
  return (
    <main className="relative overflow-hidden bg-[#090B12] text-white">
      <Navbar />

      <section
        id="home"
        className="relative flex min-h-[760px] items-center overflow-hidden border-b border-white/10"
      >
        {/* Technical grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "65px 65px",
          }}
        />

        <div className="absolute -left-40 top-40 h-[420px] w-[420px] rounded-full bg-[#287BFF]/10 blur-[140px]" />

        <div className="relative mx-auto w-full max-w-[1400px] px-6 pb-20 pt-32 lg:px-14">
          {/* Top editorial line */}
          <div className="mb-12 flex items-center justify-between border-b border-white/15 pb-5">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 animate-pulse bg-[#FF7438]" />
              <span className="text-[10px] font-semibold tracking-[4px] text-gray-400">
                FITNESS IS A MINDSET
              </span>
            </div>
            <span className="hidden text-[10px] tracking-[3px] text-gray-500 sm:block">
              FITNOVA / EST. 2026
            </span>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Editorial typography */}
            <div className="relative z-10 animate-[fadeUp_.9s_ease-out_both]">
              <p className="mb-7 text-[11px] font-bold tracking-[5px] text-[#287BFF]">
                THE NEXT VERSION OF YOU.
              </p>

              <h1 className="text-[clamp(3.8rem,7.5vw,7.2rem)] font-black leading-[0.86] tracking-[-0.065em]">
                MAKE
                <br />
                <span className="text-[#287BFF]">YOUR</span>
                <br />
                <span className="font-light italic text-transparent"
                  style={{ WebkitTextStroke: "1px #FFFFFF" }}>
                  MOVE.
                </span>
              </h1>

              <div className="mt-9 flex max-w-[420px] gap-5">
                <div className="w-[3px] shrink-0 bg-[#FF7438]" />
                <p className="text-sm leading-7 text-gray-400">
                  Strength is built in the moments nobody sees.
                  Find your focus, push your limits and make every
                  session count.
                </p>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-6">
               <a
  href="/membership"
  className="group flex items-center gap-5 bg-[#287BFF] px-6 py-4 text-[11px] font-bold tracking-[1.5px] transition duration-300 hover:-translate-y-1 hover:bg-[#FF7438]"
>
  FIND YOUR MEMBERSHIP
  <ArrowUpRight
    size={18}
    className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
  />
</a>

                <a
                  href="#about"
                  className="flex items-center gap-2 text-[11px] font-bold tracking-[1.5px] text-gray-400 transition hover:text-white"
                >
                  DISCOVER FITNOVA
                  <ArrowDown size={15} />
                </a>
              </div>

              {/* Stats */}
              <div className="mt-16 grid max-w-[420px] grid-cols-3 border-t border-white/15 pt-6">
                <div>
                  <p className="text-2xl font-black">500<span className="text-[#287BFF]">+</span></p>
                  <p className="mt-1 text-[9px] tracking-[2px] text-gray-500">MEMBERS</p>
                </div>
                <div className="border-l border-white/15 pl-5">
                  <p className="text-2xl font-black">15<span className="text-[#FF7438]">+</span></p>
                  <p className="mt-1 text-[9px] tracking-[2px] text-gray-500">TRAINERS</p>
                </div>
                <div className="border-l border-white/15 pl-5">
                  <p className="text-2xl font-black">10<span className="text-[#287BFF]">+</span></p>
                  <p className="mt-1 text-[9px] tracking-[2px] text-gray-500">YEARS</p>
                </div>
              </div>
            </div>

            {/* Cinematic portrait */}
            <div className="relative mx-auto w-full max-w-[440px] animate-[fadeIn_.9s_.2s_ease-out_both] lg:ml-auto">
              <div className="absolute -right-3 -top-3 z-10 h-20 w-20 border-r border-t border-[#FF7438]" />
              <div className="absolute -bottom-3 -left-3 z-10 h-20 w-20 border-b border-l border-[#287BFF]" />

              <div className="relative overflow-hidden border border-white/10 bg-[#111725] p-1">
                <img
                  src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1000&q=90"
                  alt="Athlete training in a gym"
                  className="h-[390px] w-full object-cover object-center grayscale-[25%] transition duration-1000 hover:scale-[1.035] hover:grayscale-0 sm:h-[470px]"
                />

                <div className="absolute inset-1 bg-gradient-to-t from-[#090B12]/90 via-transparent to-transparent" />

                <div className="absolute bottom-7 left-7">
                  <p className="text-[9px] tracking-[4px] text-[#FF7438]">
                    STRENGTH / FOCUS / DISCIPLINE
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">
                    EARN YOUR
                    <br />
                    OWN RESPECT.
                  </h2>
                </div>

                <div className="absolute right-5 top-5 flex items-center gap-2 border border-white/20 bg-[#090B12]/60 px-3 py-2 backdrop-blur-md">
                  <Activity size={13} className="text-[#287BFF]" />
                  <span className="text-[9px] tracking-[2px]">TRAIN DIFFERENT</span>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-5 flex h-14 w-14 items-center justify-center border border-white/15 bg-[#090B12]">
                <Zap size={23} className="text-[#FF7438]" />
              </div>

              <span className="absolute -right-8 top-1/2 hidden -translate-y-1/2 rotate-90 text-[9px] tracking-[5px] text-gray-500 lg:block">
                PERFORMANCE CULTURE
              </span>
            </div>
          </div>

          {/* Animated ticker */}
          <div className="mt-20 overflow-hidden border-y border-white/10 py-4">
            <div className="flex w-max animate-[ticker_25s_linear_infinite] items-center gap-12 whitespace-nowrap text-[11px] font-bold tracking-[4px] text-gray-500">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="flex items-center gap-12">
                  TRAIN WITH PURPOSE
                  <span className="text-[#287BFF]">✳</span>
                  BUILD YOUR STRENGTH
                  <span className="text-[#FF7438]">✳</span>
                  BREAK YOUR LIMITS
                  <span className="text-[#287BFF]">✳</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <About />
      <Membership />
      <Trainers />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />

    </main>
  );
}
