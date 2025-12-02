import type { PlaylistData, MediaItem, MediaType } from './types';
import fs from 'fs';
import path from 'path';

// Data paths are now relative to the project root
const DATA_DIR = path.join(process.cwd(), 'src', 'data');

function readJsonFileSync(filePath: string) {
  try {
    const fullPath = path.join(DATA_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      const data = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading or parsing ${filePath}:`, error);
  }
  return [];
}

export function getPlaylistDataForType(requestedType: MediaType): PlaylistData {
  const allCategories = readJsonFileSync('categories.json');
  let channels: MediaItem[] = [];
  let movies: MediaItem[] = [];
  let series: MediaItem[] = [];

  try {
    switch (requestedType) {
      case 'live':
        channels = readJsonFileSync('channels.json');
        break;
      case 'movie':
        movies = readJsonFileSync('movies.json');
        break;
      case 'series':
        series = readJsonFileSync('series.json');
        break;
    }

    return {
      channels,
      movies,
      series,
      categories: {
        live: allCategories.live || [],
        movie: allCategories.movie || [],
        series: allCategories.series || [],
      },
    };
  } catch (error) {
    console.error(`Error getting playlist for type ${requestedType}:`, error);
    // On error, return empty data structure to prevent app crash
    return { channels: [], movies: [], series: [], categories: { live: [], movie: [], series: [] }};
  }
}
