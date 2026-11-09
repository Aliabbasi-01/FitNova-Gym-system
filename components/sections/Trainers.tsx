
import { Award, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default async function Trainers() {
  const { data: trainers, error } = await supabase
    .from("trainers")
    .select("id, name, role, experience, image_url, status")
    .eq("status", "Active")
    .order("created_at", { ascending: true });

  if (error || !trainers || trainers.length === 0) {
    return null;
  }

  return (
    <section
      id="trainers"
      className="relative overflow-hidden bg-[#0D101A] px-5 py-16 sm:px-6 lg:py-20"
    >
      <div className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-[#287BFF]/10 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-[#FF7438]/[0.06] blur-[110px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-9 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[3px] text-[#FF7438]">
              THE PEOPLE BEHIND YOUR PROGRESS
            </p>

            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              MEET THE <span className="text-[#287BFF]">EXPERTS.</span>
            </h2>
          </div>

          <p className="max-w-xs text-xs leading-6 text-gray-400">
            Experience, motivation and guidance to help you move forward.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer, index) => (
            <div
              key={trainer.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#090B12] transition-all duration-500 hover:-translate-y-2 hover:border-[#287BFF]/50 hover:shadow-[0_15px_40px_rgba(40,123,255,0.12)]"
            >
              <div className="relative h-64 overflow-hidden sm:h-72">
                {trainer.image_url ? (
                  <img
                    src={trainer.image_url}
                    alt={trainer.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#151B29]">
                    <Award size={55} className="text-[#287BFF]/50" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#090B12] via-black/10 to-transparent" />

                <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-[#090B12]/75 px-3 py-1.5 text-[9px] font-bold tracking-wider text-white backdrop-blur-sm">
                  <Award size={12} className="text-[#FF7438]" />
                  {trainer.experience} YEARS
                </div>

                <span className="absolute bottom-3 right-4 text-4xl font-black text-white/20">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <h3 className="text-base font-black text-white transition group-hover:text-[#287BFF]">
                    {trainer.name}
                  </h3>

                  <p className="mt-1 text-[11px] font-medium text-[#FF7438]">
                    {trainer.role}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition duration-300 group-hover:border-[#287BFF] group-hover:bg-[#287BFF] group-hover:text-white">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
