import { useRef, useState } from 'react';

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
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - touchStartX.current;
    const atStart = current === 0 && diff > 0;
    const atEnd = current === images.length - 1 && diff < 0;
    setDragOffset(atStart || atEnd ? diff / 3 : diff);
  };

  const handleTouchEnd = () => {
    const containerWidth = containerRef.current?.offsetWidth ?? 300;
    if (dragOffset < -(containerWidth * 0.3)) {
      next();
    } else if (dragOffset > containerWidth * 0.3) {
      prev();
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  return (
    <div
      className={`not-prose my-6 ${width ? 'mx-auto' : ''}`}
      style={width ? { width } : undefined}
    >
      <div
        ref={containerRef}
        className="group relative overflow-hidden rounded-lg bg-[#f4f4f4]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 300ms ease-in-out',
          }}
        >
          {images.map((image, i) => (
            <div key={i} className="relative aspect-[4/3] w-full flex-none">
              <img src={image.src} alt={image.alt ?? ''} className="h-full w-full object-contain" />
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          aria-label="이전 이미지"
          className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8L10 13"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          onClick={next}
          aria-label="다음 이미지"
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3L11 8L6 13"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
