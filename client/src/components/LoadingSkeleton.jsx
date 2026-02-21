import React from 'react'

export default function LoadingSkeleton() {
  const shimmerStyle = `
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    .shimmer {
      background: linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 20%, #f0f0f0 40%, #f0f0f0 100%);
      background-size: 1000px 100%;
      animation: shimmer 2s infinite;
    }
  `

  return (
    <>
      <style>{shimmerStyle}</style>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="space-y-4">
            {/* Header skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 shimmer"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 shimmer"></div>
            </div>

            {/* Content skeleton - 3 cards */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4 shimmer"></div>
                  <div className="h-4 bg-gray-200 rounded w-full shimmer"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 shimmer"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
