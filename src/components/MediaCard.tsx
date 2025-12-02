
"use client";

import Image from 'next/image';
import { Tv2, Clapperboard, Film, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import type { MediaItem } from '@/lib/types';

interface MediaCardProps {
  item: MediaItem;
}

const fallbackIcons = {
  live: <Tv2 className="w-6 h-6 text-gray-500" />,
  movie: <Film className="w-6 h-6 text-gray-500" />,
  series: <Clapperboard className="w-6 h-6 text-gray-500" />,
};

export default function MediaCard({ item }: MediaCardProps) {
  const { playMedia, currentlyPlaying, viewMode } = useStore((state) => ({
    playMedia: state.playMedia,
    currentlyPlaying: state.currentlyPlaying,
    viewMode: state.viewMode,
  }));
  const isActive = currentlyPlaying?.id === item.id;

  const aspectRatio = item.type === 'live' ? 'aspect-video' : 'aspect-[2/3]';
  const listImageSize = item.type === 'live' ? 'w-[80px] h-[45px]' : 'w-[40px] h-[60px]';

  const CardImage = () => (
    <div className={cn(
      "relative overflow-hidden bg-zinc-800 rounded-md flex-shrink-0 group",
      viewMode === 'grid' ? aspectRatio : listImageSize
    )}>
      {item.logo ? (
        <Image
          src={item.logo}
          alt={item.name}
          fill
          className="object-cover"
          sizes={viewMode === 'grid' ? "(max-width: 1024px) 50vw, 10vw" : "80px"}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : null}
      <div className={cn("w-full h-full flex items-center justify-center", item.logo ? 'hidden' : 'flex')}>
        {fallbackIcons[item.type]}
      </div>
      {isActive && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <PlayCircle className="w-8 h-8 text-white" />
        </div>
      )}
    </div>
  );

  const CardInfo = () => (
    <div className="flex-grow overflow-hidden">
      <p className="font-medium text-sm truncate text-white">{item.name}</p>
      <p className="text-xs text-gray-400 truncate">{item.category}</p>
    </div>
  );

  return (
    <button
      onClick={() => playMedia(item)}
      className={cn(
        'w-full text-left rounded-lg transition-colors bg-zinc-900',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring focus-visible:ring-offset-black',
        viewMode === 'grid' ? 'flex flex-col gap-2 p-2' : 'flex items-center gap-3 p-2',
        isActive ? 'ring-2 ring-white bg-zinc-800' : 'hover:bg-zinc-800'
      )}
      aria-label={`Play ${item.name}`}
    >
      <CardImage />
      <CardInfo />
    </button>
  );
}
