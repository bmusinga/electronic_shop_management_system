"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

export default function ProductImage({
  src,
  alt,
  width = 400,
  height = 300,
  fill = false,
  sizes,
  className = "",
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-700 ${className}`}>
        <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}