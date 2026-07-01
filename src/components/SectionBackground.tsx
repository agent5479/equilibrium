import { ReactNode } from "react";
import { assetUrl } from "@/lib/paths";

interface SectionBackgroundProps {
  image: string;
  overlayColor?: string;
  overlayOpacity?: number;
  position?: string;
  size?: string;
  repeat?: string;
  minHeight?: string;
  className?: string;
  children: ReactNode;
  darkText?: boolean;
}

export default function SectionBackground({
  image,
  overlayColor = "#ffffff",
  overlayOpacity = 0,
  position = "50% 50%",
  size = "cover",
  repeat = "no-repeat",
  minHeight,
  className = "",
  children,
  darkText = true,
}: SectionBackgroundProps) {
  const bgUrl = assetUrl(image);

  return (
    <section
      className={`bg-section${darkText ? "" : " bg-section--light-text"}${className ? ` ${className}` : ""}`}
      style={minHeight ? { minHeight } : undefined}
    >
      <div
        className="bg-section__image"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundPosition: position,
          backgroundSize: size,
          backgroundRepeat: repeat,
        }}
        aria-hidden
      />
      {overlayOpacity > 0 && (
        <div
          className="bg-section__overlay"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
          aria-hidden
        />
      )}
      <div className="bg-section__content">{children}</div>
    </section>
  );
}
