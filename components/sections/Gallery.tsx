
import { ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default async function Gallery() {
  const { data: images, error } = await supabase
    .from("gallery_items")
    .select("id, title, image_url, description")
    .eq("status", "Active")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Gallery loading error:", error);
    return null;
  }

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-[#090B12] px-5 py-16 sm:px-6 lg:py-20"
    >
      <div className="pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-[#287BFF]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-9 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[3px] text-[#FF7438]">
              LIFE AT FITNOVA
            </p>

            <h2 className="text-3xl font-black text-white sm:text-4xl">
              INSIDE THE <span className="text-[#287BFF]">GYM.</span>
            </h2>
          </div>

          <p className="max-w-xs text-xs leading-6 text-gray-400">
            A glimpse of the energy, dedication and strength that define us.
          </p>
        </div>

        <div className="grid auto-rows-[180px] gap-3 sm:auto-rows-[210px] md:grid-cols-3">
          {images.map((item, index) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-xl border border-white/10 ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <img
                src={item.image_url}
                alt={item.title || "FitNova Gym"}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#090B12] via-black/10 to-transparent transition group-hover:from-[#090B12]/90" />

              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-bold tracking-[2px] text-[#FF7438]">
                    {String(index + 1).padStart(2, "0")} / FITNOVA
                  </p>

                  <h3 className="mt-1 text-lg font-black text-white">
                    {item.title || "FITNOVA"}
                  </h3>

                  <p className="mt-1 text-[10px] text-gray-300">
                    {item.description || "Live stronger"}
                  </p>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white transition group-hover:border-[#287BFF] group-hover:bg-[#287BFF]">
                  <ArrowUpRight size={15} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
