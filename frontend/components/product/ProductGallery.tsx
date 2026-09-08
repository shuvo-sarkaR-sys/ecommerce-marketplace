"use client";

import { useState } from "react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/utils";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [active, setActive] = useState(0);
  const count = Math.max(images.length, 1);
  const activeImage = images[active];

  return (
    <div className="flex flex-col gap-3">
      {activeImage ? <img src={activeImage} alt={name} className="aspect-[3/4] w-full object-cover" /> : <ImagePlaceholder label={name} aspect="aspect-[3/4]" />}
      {count > 1 && (
        <div className="flex gap-2">
          {images.map((image, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${count}`}
              aria-current={active === i}
              className={cn(
                "h-16 w-14 flex-none border transition-colors",
                active === i ? "border-ink" : "border-sand",
              )}
            >
              <img src={image} alt={`${name} view ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
