"use client";

import { useFilteredMedia, useStore } from '@/store/useStore';
import MediaCard from './MediaCard';
import LoadMoreButton from './LoadMoreButton';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { useEffect, useState } from 'react';

export default function MediaList() {
  const { items, totalFiltered, hasMore } = useFilteredMedia();
  const viewMode = useStore((state) => state.viewMode);
  const allChannels = useStore((state) => state.allChannels);

  // To prevent flash of "No items found" on initial load
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLoading = !isMounted || allChannels.length === 0;

  if (isLoading) {
    return (
      <div className={cn("p-3", viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3" : "flex flex-col gap-2")}>
        {Array.from({ length: 20 }).map((_, i) => (
          viewMode === 'grid' 
            ? <div key={i} className="flex flex-col gap-2"><Skeleton className="aspect-video w-full" /><Skeleton className="h-4 w-3/4"/></div>
            : <div key={i} className="flex gap-3 items-center"><Skeleton className="w-20 h-[45px] flex-shrink-0"/><div className="space-y-2 flex-grow"><Skeleton className="h-4 w-full"/><Skeleton className="h-4 w-1/2"/></div></div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 min-h-64">
        <p className="font-semibold">No items found</p>
        <p className="text-sm">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div
        className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3'
            : 'flex flex-col gap-2'
        )}
      >
        {items.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
      {hasMore && <LoadMoreButton />}
    </div>
  );
}
