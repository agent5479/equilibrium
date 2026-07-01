import OptimizedImage from "@/components/OptimizedImage";
import { PAGE_IMAGES } from "@/lib/page-images";

export default function GalleryPage() {
  const images = PAGE_IMAGES.gallery;

  return (
    <div className="gallery-page">
      <div className="gallery-grid">
        {images.map((src, i) => (
          <figure key={src} className="gallery-item">
            <OptimizedImage
              src={src}
              alt={`Gallery image ${i + 1}`}
              sizes="(max-width: 768px) 100vw, 280px"
            />
          </figure>
        ))}
      </div>
    </div>
  );
}
