
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Daniel Smith",
    role: "Member for 2 Years",
    review:
      "The atmosphere here keeps me motivated. Great equipment, professional trainers and a genuinely positive environment.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=85",
  },
  {
    name: "Sarah Johnson",
    role: "Member for 1 Year",
    review:
      "I've become stronger and more confident since joining FitNova. The trainers really understand how to help you improve.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=85",
  },
  {
    name: "Michael Brown",
    role: "Member for 3 Years",
    review:
      "A fantastic place to train. The facilities are excellent and every workout feels like a step towards my goals.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=85",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-[#0D101A] px-5 py-16 sm:px-6 lg:py-20"
    >
      <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-[#287BFF]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-9 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[3px] text-[#FF7438]">
              REAL PEOPLE. REAL PROGRESS.
            </p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              MEMBER <span className="text-[#287BFF]">STORIES.</span>
            </h2>
          </div>

          <p className="max-w-xs text-xs leading-6 text-gray-400">
            The best measure of our work is the progress of our members.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <article
              key={item.name}
              className="group relative rounded-xl border border-white/10 bg-[#090B12] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#287BFF]/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-[#FF7438]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <Quote
                  size={27}
                  className="text-[#287BFF]/30 transition group-hover:text-[#287BFF]"
                />
              </div>

              <p className="mt-5 min-h-[105px] text-sm leading-7 text-gray-300">
                "{item.review}"
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="h-11 w-11 rounded-full border border-white/15 object-cover"
                />

                <div>
                  <h3 className="text-sm font-bold text-white">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {item.role}
                  </p>
                </div>

                <span className="ml-auto text-[10px] font-bold text-[#287BFF]">
                  0{index + 1}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
