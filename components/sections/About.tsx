
import {
  Dumbbell,
  HeartPulse,
  Target,
  Zap,
  ArrowUpRight,
} from "lucide-react";

const facilities = [
  {
    icon: Dumbbell,
    title: "Modern Equipment",
    description: "Quality machines for effective workouts.",
  },
  {
    icon: HeartPulse,
    title: "Expert Training",
    description: "Professional guidance for your goals.",
  },
  {
    icon: Target,
    title: "Real Results",
    description: "Training plans that keep you progressing.",
  },
  {
    icon: Zap,
    title: "High Energy",
    description: "A motivating space to push your limits.",
  },
];

export default function About() {
  return (
    <section id="about" className="bg-[#0D101A] px-6 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">

        {/* About intro */}
        <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-14">

          <div>
            <p className="mb-3 text-xs font-bold tracking-[3px] text-[#FF7438]">
              ABOUT FITNOVA
            </p>

            <h2 className="text-3xl font-black leading-tight text-white md:text-4xl">
              MORE THAN A GYM.
              <span className="block text-[#287BFF]">A BETTER YOU.</span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-gray-400">
              Train smarter, build strength and achieve your fitness goals
              with modern facilities and expert guidance.
            </p>

            <a
              href="#membership"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white no-underline transition hover:text-[#FF7438]"
            >
              Explore Membership
              <ArrowUpRight size={17} />
            </a>
          </div>

          <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 sm:h-64">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=85"
              alt="Modern gym interior"
              className="h-full w-full object-cover transition duration-700 hover:scale-105"
            />

            <div className="absolute bottom-4 left-4 bg-[#090B12]/85 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-bold tracking-wider text-white">
                TRAIN DIFFERENT.
              </p>
              <p className="mt-1 text-[10px] text-[#FF7438]">
                LIVE DIFFERENT.
              </p>
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="mt-14">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-black text-white sm:text-2xl">
              WHY <span className="text-[#287BFF]">FITNOVA?</span>
            </h3>
            <span className="text-[10px] font-bold tracking-[2px] text-gray-500">
              WHAT WE OFFER
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {facilities.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group border border-white/10 bg-[#090B12] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#287BFF]/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#287BFF]/10 text-[#287BFF] transition group-hover:bg-[#287BFF] group-hover:text-white">
                      <Icon size={21} />
                    </div>

                    <span className="text-xs text-gray-600">
                      0{index + 1}
                    </span>
                  </div>

                  <h4 className="mt-5 text-sm font-bold text-white">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-xs leading-6 text-gray-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
