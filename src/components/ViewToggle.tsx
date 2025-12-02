"use client";

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';

export default function ViewToggle() {
  const { viewMode, setViewMode } = useStore();
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="flex items-center gap-1"><div className="h-10 w-10 bg-zinc-900 rounded-md animate-pulse" /><div className="h-10 w-10 bg-zinc-900 rounded-md animate-pulse" /></div>;
  }

  return (
    <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-md">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode('list')}
        className={cn(
          'h-8 w-8',
          viewMode === 'list' ? 'bg-zinc-700 hover:bg-zinc-700 text-white' : 'text-gray-400 hover:text-white'
        )}
        aria-pressed={viewMode === 'list'}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List View</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode('grid')}
        className={cn(
          'h-8 w-8',
          viewMode === 'grid' ? 'bg-zinc-700 hover:bg-zinc-700 text-white' : 'text-gray-400 hover:text-white'
        )}
        aria-pressed={viewMode === 'grid'}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Grid View</span>
      </Button>
    </div>
  );
}
