import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-warm-sm border border-gray-100 flex flex-col h-[400px]">
      {/* Image skeleton */}
      <div className="aspect-[4/5] sm:aspect-[4/3] bg-gradient-to-br from-cream to-gray-100 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer opacity-60" />
        {/* Faint arabesque pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/arabesque.png')" }} />
      </div>
      {/* Content skeleton */}
      <div className="p-4 space-y-3 flex flex-col flex-1">
        <div className="h-3 bg-gray-100 rounded-full w-1/3 overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="h-4 bg-gray-100 rounded-full w-3/4 overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="flex-1" />
        <div className="h-4 bg-gray-100 rounded-full w-1/2 overflow-hidden relative mt-auto">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
