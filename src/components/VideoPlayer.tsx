"use client";

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import { useStore } from '@/store/useStore';
import { LogoIcon } from './icons';

export default function VideoPlayer() {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const currentlyPlaying = useStore((state) => state.currentlyPlaying);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered", "w-full", "h-full");
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [],
      });
      
      player.on('error', () => {
        const error = player.error();
        console.error('Video.js Error:', error);
      });
    }
  }, []);

  useEffect(() => {
    const player = playerRef.current;

    if (player && currentlyPlaying) {
      player.src({
        src: currentlyPlaying.url,
        type: 'application/x-mpegURL',
      });
      player.poster(currentlyPlaying.logo || '');
      player.play();
    }
  }, [currentlyPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center relative">
      {!currentlyPlaying && (
        <div className="text-gray-400 text-center space-y-2">
          <LogoIcon className="w-16 h-16 mx-auto text-zinc-800" />
          <p className="text-lg font-semibold text-zinc-600">Select a stream to begin</p>
          <p className="text-sm text-zinc-700">Choose from Live TV, Movies, or Series</p>
        </div>
      )}
      <div data-vjs-player className={!currentlyPlaying ? 'hidden' : 'w-full h-full'}>
        <div ref={videoRef} className='w-full h-full' />
      </div>
    </div>
  );
}
