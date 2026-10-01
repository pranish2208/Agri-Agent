'use client';

import React, { useState, useEffect } from 'react';
import { Sprout } from 'lucide-react';

interface CropImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export const CropImage: React.FC<CropImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/images/crops/rice.jpg',
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (imgSrc !== fallbackSrc && fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-950 text-slate-400 border border-slate-800 p-4 ${className}`}>
        <Sprout className="w-10 h-10 text-emerald-500 mb-2" />
        <span className="text-xs font-semibold text-slate-300 text-center">{alt}</span>
        <span className="text-[10px] text-slate-500">AgriAgent Crop Repository</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
    />
  );
};
