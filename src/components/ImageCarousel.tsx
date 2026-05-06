import { useState } from 'react';

interface CarouselImage {
  src: string;
  alt?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  width?: string;
  caption?: string;
}

export default function ImageCarousel({ images, width, caption }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <div className={`not-prose my-6 ${width ? 'mx-auto' : ''}`} style={width ? { width } : undefined}>
      <div className="group relative overflow-hidden rounded-lg bg-[#f4f4f4]">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((image, i) => (
            <div key={i} className="relative aspect-[4/3] w-full flex-none">
              <img
                src={image.src}
                alt={image.alt ?? ''}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          aria-label="이전 이미지"
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={next}
          aria-label="다음 이미지"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3L11 8L6 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mt-2.5 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`${i + 1}번째 이미지`}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i === current ? 'bg-[#111111]' : 'bg-[#e8e8e8] hover:bg-[#cccccc]'
            }`}
          />
        ))}
      </div>

      {caption && (
        <p className="mt-2 text-center text-[12.5px] leading-[1.6] text-[#999999]">{caption}</p>
      )}
    </div>
  );
}
