import Image from "next/image";

type CoverImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export function CoverImage({
  src,
  alt,
  sizes,
  className = "object-contain",
  priority = false,
}: CoverImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={src.endsWith(".svg")}
    />
  );
}
