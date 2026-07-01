import { resolveOptimizedSrc } from "@/lib/images";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority,
  width,
  height,
}: OptimizedImageProps) {
  const optimized = resolveOptimizedSrc(src);

  if (optimized.srcSet) {
    return (
      <picture>
        <source srcSet={optimized.srcSet} sizes={sizes} type="image/webp" />
        <img
          src={optimized.src}
          alt={alt}
          className={className}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          width={width}
          height={height}
        />
      </picture>
    );
  }

  return (
    <img
      src={optimized.src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      width={width}
      height={height}
    />
  );
}
