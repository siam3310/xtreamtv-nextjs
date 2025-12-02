import fs from 'fs/promises';
import path from 'path';

// Define types locally for the script
type MediaItem = {
  id: string;
  name: string;
  logo: string | null;
  category: string;
  url: string;
  type: 'live' | 'movie' | 'series';
};

type Categories = {
  live: string[];
  movie: string[];
  series: string[];
};

const M3U_URL = 'http://filex.me:8080/get.php?username=MAS101A&password=MAS101AABB&type=m3u_plus&output=m3u8';
const DATA_DIR = path.join(process.cwd(), 'src', 'data');

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

async function fetchAndProcessM3U() {
  console.log('Starting playlist fetch from:', M3U_URL);
  
  try {
    const response = await fetch(M3U_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.status} ${response.statusText}`);
    }

    const m3uText = await response.text();
    if (!m3uText.startsWith('#EXTM3U')) {
        throw new Error('Invalid M3U playlist format: Does not start with #EXTM3U');
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
          id: urlLine,
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
    
    console.log(`Processing complete. Found:`);
    console.log(`- ${channels.length} Live TV channels`);
    console.log(`- ${movies.length} Movies`);
    console.log(`- ${series.length} Series`);

    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    const categories: Categories = {
      live: Array.from(categorySet.live),
      movie: Array.from(categorySet.movie),
      series: Array.from(categorySet.series),
    };

    // Write files
    await fs.writeFile(path.join(DATA_DIR, 'channels.json'), JSON.stringify(channels, null, 2));
    await fs.writeFile(path.join(DATA_DIR, 'movies.json'), JSON.stringify(movies, null, 2));
    await fs.writeFile(path.join(DATA_DIR, 'series.json'), JSON.stringify(series, null, 2));
    await fs.writeFile(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2));

    console.log('Successfully saved data to JSON files in src/data/');

  } catch (error) {
    console.error('Error during data preparation:', error);
    // Exit with an error code to stop the build/dev process if data prep fails
    process.exit(1);
  }
}

fetchAndProcessM3U();
