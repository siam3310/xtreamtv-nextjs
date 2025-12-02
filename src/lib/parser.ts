import type { PlaylistData, MediaItem, MediaType } from './types';
import fs from 'fs/promises';
import path from 'path';

const M3U_URL = 'http://filex.me:8080/get.php?username=MAS101A&password=MAS101AABB&type=m3u_plus&output=m3u8';
const CACHE_FILE_PATH = path.join(process.cwd(), '.next', 'playlist_cache.json');
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

function getMediaTypeFromUrl(url: string, groupTitle: string): 'live' | 'movie' | 'series' {
  if (url.includes('/movie/')) {
    return 'movie';
  }
  if (url.includes('/series/')) {
    return 'series';
  }
  
  const lowerGroup = groupTitle.toLowerCase();
  if (lowerGroup.includes('series') || lowerGroup.includes('séries')) {
      return 'series';
  }
  if (lowerGroup.includes('movie') || lowerGroup.includes('vod') || lowerGroup.includes('film')) {
      return 'movie';
  }
  
  return 'live';
}

function parseAttributes(line: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /(\S+?)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

async function fetchAndParseM3U(): Promise<PlaylistData> {
    const response = await fetch(M3U_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.statusText}`);
    }

    const m3uText = await response.text();
    if (!m3uText.startsWith('#EXTM3U')) {
        throw new Error('Invalid M3U playlist format');
    }
    const lines = m3uText.split('\n');

    const channels: MediaItem[] = [];
    const movies: MediaItem[] = [];
    const series: MediaItem[] = [];

    const categorySet = {
      live: new Set<string>(),
      movie: new Set<string>(),
      series: new Set<string>(),
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const infoLine = line;
        const urlLine = lines[++i]?.trim();
        if (!urlLine || urlLine.startsWith('#')) {
            continue;
        }

        const name = infoLine.substring(infoLine.lastIndexOf(',') + 1);
        const attributes = parseAttributes(infoLine);
        
        const category = attributes['group-title'] || 'Uncategorized';
        const mediaType = getMediaTypeFromUrl(urlLine, category);

        const item: MediaItem = {
          id: urlLine, // URL is a reliable unique ID
          name: name,
          logo: attributes['tvg-logo'] || null,
          category: category,
          url: urlLine,
          type: mediaType,
        };

        switch (mediaType) {
          case 'live':
            channels.push(item);
            categorySet.live.add(category);
            break;
          case 'movie':
            movies.push(item);
            categorySet.movie.add(category);
            break;
          case 'series':
            series.push(item);
            categorySet.series.add(category);
            break;
        }
      }
    }

    return {
      channels,
      movies,
      series,
      categories: {
        live: Array.from(categorySet.live).sort(),
        movie: Array.from(categorySet.movie).sort(),
        series: Array.from(categorySet.series).sort(),
      },
    };
}

async function getCachedPlaylist(): Promise<PlaylistData | null> {
  try {
    const fileStats = await fs.stat(CACHE_FILE_PATH);
    const isCacheValid = (Date.now() - fileStats.mtime.getTime()) < CACHE_DURATION_MS;
    
    if (isCacheValid) {
      const cachedData = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    // If file doesn't exist or other errors, return null to fetch fresh data
    return null;
  }
}

async function updatePlaylistCache() {
  try {
    console.log('Refreshing playlist cache...');
    const playlistData = await fetchAndParseM3U();
    await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true });
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(playlistData), 'utf-8');
    console.log('Playlist cache refreshed successfully.');
    return playlistData;
  } catch (error) {
    console.error('Failed to update playlist cache:', error);
    throw error;
  }
}

export async function parseXtreamPlaylist(requestedType: MediaType, forceRefresh = false): Promise<PlaylistData> {
  try {
    let playlistData = forceRefresh ? null : await getCachedPlaylist();
    
    if (!playlistData) {
      playlistData = await updatePlaylistCache();
    }

    const filterData = (data: MediaItem[]) => data.filter(item => item.type === requestedType);

    switch (requestedType) {
      case 'live':
        return { ...playlistData, channels: playlistData.channels, movies: [], series: [] };
      case 'movie':
        return { ...playlistData, movies: playlistData.movies, channels: [], series: [] };
      case 'series':
        return { ...playlistData, series: playlistData.series, channels: [], movies: [] };
      default:
        return playlistData;
    }
  } catch (error) {
    console.error("Error getting playlist:", error);
    // Fallback: try to read from cache even if it's stale
    const staleCache = await getCachedPlaylist().catch(() => null);
    if(staleCache) {
      console.warn("Serving stale cache due to fetch error.");
      return staleCache;
    }
    throw new Error("Could not load or parse the playlist.");
  }
}
