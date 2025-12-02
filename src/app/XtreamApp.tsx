"use client";

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import type { PlaylistData, MediaType } from '@/lib/types';
import VideoPlayer from '@/components/VideoPlayer';
import ContentBrowser from '@/components/ContentBrowser';
import { useToast } from '@/hooks/use-toast';

interface XtreamAppProps {
  initialData: PlaylistData;
  mediaType: MediaType;
  error?: string;
}

export default function XtreamApp({ initialData, mediaType, error }: XtreamAppProps) {
  const initializeData = useStore((state) => state.initializeData);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error Loading Content",
        description: error,
      });
    }
  }, [error, toast]);
  
  useEffect(() => {
    if (!error) {
      initializeData(initialData, mediaType);
    }
  }, [initialData, initializeData, mediaType, error]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-4">
        <div>
          <h2 className="text-xl font-semibold text-destructive">Failed to load content</h2>
          <p className="text-muted-foreground mt-2">The playlist could not be fetched or parsed. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <div id="video-player-container" className="w-full lg:w-[70%] lg:border-r border-white/10 bg-black flex-shrink-0 h-[56.25vw] lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16">
        <VideoPlayer />
      </div>
      <div className="w-full lg:w-[30%] flex flex-col overflow-hidden">
        <ContentBrowser />
      </div>
    </div>
  );
}
