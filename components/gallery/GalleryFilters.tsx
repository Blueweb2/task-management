"use client";

import { galleryCategories } from "./constants";

interface GalleryFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function GalleryFilters({
  activeCategory,
  onCategoryChange,
}: GalleryFiltersProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-max gap-2 pb-2">
        {galleryCategories.map((category) => {
          const active =
            activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() =>
                onCategoryChange(category)
              }
              className={[
                "rounded-full px-5 py-2.5 text-sm font-medium",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30",
                active
                  ? "bg-[#3b82f6] text-white shadow-sm"
                  : [
                      "border border-[#dbeafe]",
                      "bg-white text-[#5f574f]",
                      "hover:border-[#c7b39a]",
                      "hover:bg-[#ffffff]",
                    ].join(" "),
              ].join(" ")}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}