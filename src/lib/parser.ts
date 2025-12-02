import type { PlaylistData, MediaItem } from './types';

const M3U_URL = 'http://filex.me:8080/get.php?username=MAS101A&password=MAS101AABB&type=m3u_plus&output=m3u8';

function getMediaType(url: string, groupTitle: string): 'live' | 'movie' | 'series' {
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

export async function parseXtreamPlaylist(): Promise<PlaylistData> {
  try {
    const response = await fetch(M3U_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

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
        const mediaType = getMediaType(urlLine, category);

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
  } catch (error) {
    console.error("Error parsing M3U playlist:", error);
    throw new Error("Could not load or parse the playlist.");
  }
}
