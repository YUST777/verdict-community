'use client';

import React, { useState, useEffect, useRef } from 'react';

interface VirtualLeaderboardProps<T = unknown> {
  items: T[];
  itemSize: number;
  children: (props: { index: number; style: React.CSSProperties }) => React.ReactNode;
}

export default function VirtualLeaderboard<T = unknown>({ items, itemSize, children }: VirtualLeaderboardProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Reset scroll position when items change to avoid blank views
  // when switching from a long list to a short one while scrolled down.
  useEffect(() => {
    setScrollTop(0);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [items]);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  if (!items || items.length === 0) {
    return null;
  }

  const totalHeight = items.length * itemSize;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemSize) - 5);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemSize) + 5
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      offsetTop: i * itemSize,
    });
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        height: '100%',
        width: '100%',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, offsetTop }) => {
          const itemStyle: React.CSSProperties = {
            position: 'absolute',
            top: offsetTop,
            left: 0,
            right: 0,
            height: itemSize,
          };

          return (
            <React.Fragment key={`virtual-item-${index}`}>
              {children({ index, style: itemStyle })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
