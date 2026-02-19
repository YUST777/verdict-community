import React from 'react'

const NUM_BARS = 15

function calculateHeight(index: number, total: number): number {
  const position = index / (total - 1)
  const center = 0.5
  const distanceFromCenter = Math.abs(position - center)
  const heightPercentage = Math.pow(distanceFromCenter * 2, 1.2)
  const minHeight = 30
  const maxHeight = 100

  return minHeight + (maxHeight - minHeight) * heightPercentage
}

export const GradientBars: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div
        className="flex h-full w-full"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {Array.from({ length: NUM_BARS }).map((_, index) => {
          const height = calculateHeight(index, NUM_BARS)
          return (
            <div
              key={index}
              className="animate-pulseBar"
              style={{
                flex: `1 0 calc(100% / ${NUM_BARS})`,
                maxWidth: `calc(100% / ${NUM_BARS})`,
                height: '100%',
                background:
                  'linear-gradient(to top, rgba(255, 255, 255, 0.15), transparent)',
                transform: `scaleY(${height / 100})`,
                transformOrigin: 'bottom',
                transition: 'transform 0.5s ease-in-out',
                animationDelay: `${index * 0.1}s`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
