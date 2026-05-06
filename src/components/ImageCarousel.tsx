import { useCallback, useEffect, useRef, useState } from 'react';

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
  const touchStartY = useRef(0);
  const currentRef = useRef(current);
  const dragOffsetRef = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  currentRef.current = current;

  // non-passive로 직접 등록해야 preventDefault()가 실제 기기에서 동작함
  const handleTouchMoveNative = useCallback(
    (e: TouchEvent) => {
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      if (isHorizontalSwipe.current === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
        isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
      }

      if (!isHorizontalSwipe.current) return;

      e.preventDefault();

      const cur = currentRef.current;
      const atStart = cur === 0 && dx > 0;
      const atEnd = cur === images.length - 1 && dx < 0;
      const offset = atStart || atEnd ? dx / 3 : dx;
      dragOffsetRef.current = offset;
      setDragOffset(offset);
    },
    [images.length],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchmove', handleTouchMoveNative, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMoveNative);
  }, [handleTouchMoveNative]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    const containerWidth = containerRef.current?.offsetWidth ?? 300;
    const offset = dragOffsetRef.current;

    if (offset < -(containerWidth * 0.3)) {
      setCurrent((c) => Math.min(c + 1, images.length - 1));
    } else if (offset > containerWidth * 0.3) {
      setCurrent((c) => Math.max(c - 1, 0));
    }

    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsDragging(false);
    isHorizontalSwipe.current = null;
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
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); }}
          aria-label="이전 이미지"
          className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); }}
          aria-label="다음 이미지"
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
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
