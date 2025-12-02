export type MediaItem = {
  id: string;
  name: string;
  logo: string | null;
  category: string;
  url: string;
  type: 'live' | 'movie' | 'series';
};

export type PlaylistData = {
  channels: MediaItem[];
  movies: MediaItem[];
  series: MediaItem[];
  categories: {
    live: string[];
    movie: string[];
    series: string[];
  };
};

export type MediaType = 'live' | 'movie' | 'series';

export type ViewMode = 'grid' | 'list';
