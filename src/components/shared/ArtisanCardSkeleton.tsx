import React from 'react';

export default function ArtisanCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-warm-sm border border-gray-100 flex flex-col">
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-cream to-gray-100">
         <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer opacity-60" />
      </div>
      <div className="relative px-5 pb-5 flex flex-col flex-1">
        <div className="-mt-8 mb-3 z-10 relative">
          <div className="w-16 h-16 rounded-full border-2 border-white shadow-warm-md overflow-hidden bg-gray-100 relative">
             <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
        <div className="h-5 bg-gray-100 rounded-full w-2/3 mb-2 overflow-hidden relative">
           <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="h-3 bg-gray-100 rounded-full w-1/3 mb-4 overflow-hidden relative">
           <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer" />
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 h-8 bg-gray-50 rounded-full w-full relative overflow-hidden">
           <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
