import { Images } from "lucide-react";

export default function GalleryHero() {
  return (
    <section className="border-b border-[#dbeafe] bg-[#f8fbff]">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1e7d9] text-[#1d4ed8]">
          <Images size={27} />
        </div>

        {/* Label */}
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">
          Our Gallery
        </p>

        {/* Heading */}
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0f172a] sm:text-5xl lg:text-6xl">
          Moments we've helped create
        </h1>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#475569] sm:text-lg">
          Explore celebrations, beautiful event setups, and
          memorable moments from events we've helped organize.
        </p>
      </div>
    </section>
  );
}