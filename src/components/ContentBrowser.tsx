"use client";

import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import ViewToggle from './ViewToggle';
import MediaList from './MediaList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/store/useStore';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function ContentBrowser() {
  const mediaType = useStore((state) => state.mediaType);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 border-b border-white/10 flex-shrink-0">
        <SearchBar />
        <div className="flex items-center justify-between mt-3">
          <CategoryFilter />
          <ViewToggle />
        </div>
      </div>
      <ScrollArea className="flex-grow">
        <MediaList />
      </ScrollArea>
    </div>
  );
}
