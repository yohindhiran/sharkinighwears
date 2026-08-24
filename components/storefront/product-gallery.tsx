"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name, tone }: { images: string[]; name: string; tone: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden" style={{ backgroundColor: tone }}>
        {current ? (
          <Image key={current} src={current} alt={name} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 55vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><span className="display text-6xl text-ink/20">SHARKI</span></div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${name}`}
              className={`relative aspect-square overflow-hidden border transition ${index === active ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              <Image src={image} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
