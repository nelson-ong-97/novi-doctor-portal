'use client';

import * as React from 'react';

interface InfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  next: () => unknown;
  threshold?: number;
  root?: Element | Document | null;
  rootMargin?: string;
  children?: React.ReactNode;
}

export default function InfiniteScroll({
  isLoading,
  hasMore,
  next,
  threshold = 1,
  root = null,
  rootMargin = '0px',
  children,
}: InfiniteScrollProps) {
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = sentinelRef.current;
    if (!element || isLoading || !hasMore) return;

    let safeThreshold = threshold;
    if (threshold < 0 || threshold > 1) {
      safeThreshold = 1;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          next();
        }
      },
      { threshold: safeThreshold, root, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, isLoading, next, threshold, root, rootMargin]);

  return (
    <>
      {children}
      <div ref={sentinelRef} className="h-px" />
    </>
  );
}
