import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

import { cn } from './ui/utils';

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  className?: string;
};

export function ImageWithFallback({ src, alt, className }: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="size-10 opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
