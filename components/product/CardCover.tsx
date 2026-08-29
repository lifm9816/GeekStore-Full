"use client";

import { useState } from "react";
import Image from "next/image";

type CardCoverProps = {
  src: string;
  alt: string;
};

export function CardCover({ src, alt }: CardCoverProps) {
  const [landscape, setLandscape] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.4)] ${
        landscape ? "h-[102px] w-[180px]" : "h-[160px] w-[128px]"
      }`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="180px"
        onLoad={(event) => {
          const { naturalWidth, naturalHeight } = event.currentTarget;
          setLandscape(naturalWidth > naturalHeight);
        }}
        className="object-cover object-center"
        unoptimized={src.endsWith(".svg")}
      />
    </div>
  );
}
