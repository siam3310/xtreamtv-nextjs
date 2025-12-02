import type { PlaylistData, MediaItem, MediaType } from './types';
import fs from 'fs/promises';
import path from 'path';

const M3U_URL = 'http://filex.me:8080/get.php?username=MAS101A&password=MAS101AABB&type=m3u_plus&output=m3u8';
const CACHE_DIR = path.join(process.cwd(), '.next', 'cache');
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

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
        live: Array.from(categorySet.live),
        movie: Array.from(categorySet.movie),
        series: Array.from(categorySet.series),
      },
    };
}

async function updatePlaylistCache() {
  try {
    console.log('Refreshing playlist cache...');
    const playlistData = await fetchAndParseM3U();
    await fs.mkdir(CACHE_DIR, { recursive: true });

    const fullData: PlaylistData = {
        channels: playlistData.channels,
        movies: playlistData.movies,
        series: playlistData.series,
        categories: playlistData.categories
    };

    await fs.writeFile(path.join(CACHE_DIR, 'full_playlist.json'), JSON.stringify(fullData), 'utf-8');
    
    console.log('Playlist cache refreshed successfully.');
    return fullData;
  } catch (error) {
    console.error('Failed to update playlist cache:', error);
    throw error;
  }
}

async function getPlaylistData(): Promise<PlaylistData> {
  const cacheFilePath = path.join(CACHE_DIR, 'full_playlist.json');
  
  try {
    if (await fileExists(cacheFilePath)) {
      const stats = await fs.stat(cacheFilePath);
      const isCacheValid = (Date.now() - stats.mtime.getTime()) < CACHE_DURATION_MS;
      if (isCacheValid) {
        const cachedData = await fs.readFile(cacheFilePath, 'utf-8');
        return JSON.parse(cachedData);
      }
    }
  } catch (e) {
    console.error("Error reading cache, will refetch.", e);
  }
  
  // If cache is invalid or doesn't exist, refetch
  return await updatePlaylistCache();
}


export async function parseXtreamPlaylist(requestedType: MediaType): Promise<PlaylistData> {
  try {
    const playlistData = await getPlaylistData();

    switch (requestedType) {
      case 'live':
        return { ...playlistData, channels: playlistData.channels, movies: [], series: [] };
      case 'movie':
        return { ...playlistData, movies: playlistData.movies, channels: [], series: [] };
      case 'series':
        return { ...playlistData, series: playlistData.series, channels: [], movies: [] };
      default:
        // This case should ideally not be hit if types are correct
        return { channels: [], movies: [], series: [], categories: { live: [], movie: [], series: [] }};
    }
  } catch (error) {
    console.error("Error getting playlist:", error);
    // On error, return empty data structure to prevent app crash
    return { channels: [], movies: [], series: [], categories: { live: [], movie: [], series: [] }};
  }
}
