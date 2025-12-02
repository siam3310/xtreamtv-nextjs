import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MediaItem, PlaylistData, MediaType, ViewMode } from '@/lib/types';

const ITEMS_PER_PAGE = 50;

interface AppState {
  // Raw data
  allChannels: MediaItem[];
  allMovies: MediaItem[];
  allSeries: MediaItem[];
  categories: PlaylistData['categories'];
  
  // Current page state
  mediaType: MediaType;
  
  // Filters & View
  searchQuery: string;
  categoryFilter: string;
  viewMode: ViewMode;
  currentPage: number;

  // Playback
  currentlyPlaying: MediaItem | null;

  // Actions
  initializeData: (data: PlaylistData, mediaType: MediaType) => void;
  setMediaType: (type: MediaType) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setViewMode: (mode: ViewMode) => void;
  loadMore: () => void;
  playMedia: (item: MediaItem) => void;
  stopMedia: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      allChannels: [],
      allMovies: [],
      allSeries: [],
      categories: { live: [], movie: [], series: [] },
      mediaType: 'live',
      searchQuery: '',
      categoryFilter: 'All',
      viewMode: 'list',
      currentPage: 1,
      currentlyPlaying: null,

      initializeData: (data, mediaType) => {
        set({
          mediaType: mediaType,
          allChannels: data.channels,
          allMovies: data.movies,
          allSeries: data.series,
          categories: data.categories,
          searchQuery: '',
          categoryFilter: 'All',
          currentPage: 1,
        });
      },
      
      setMediaType: (type) => {
        if (get().mediaType !== type) {
          set({ 
            mediaType: type,
            searchQuery: '',
            categoryFilter: 'All',
            currentPage: 1,
            currentlyPlaying: null,
          });
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
      
      setCategoryFilter: (category) => set({ categoryFilter: category, currentPage: 1 }),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      loadMore: () => set((state) => ({ currentPage: state.currentPage + 1 })),
      
      playMedia: (item) => set({ currentlyPlaying: item }),

      stopMedia: () => set({ currentlyPlaying: null }),
    }),
    {
      name: 'xtream-tv-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ viewMode: state.viewMode }),
    }
  )
);

export const useFilteredMedia = () => {
  const { 
    mediaType, 
    allChannels, 
    allMovies, 
    allSeries,
    searchQuery, 
    categoryFilter, 
    currentPage 
  } = useStore();

  const mediaList = {
    live: allChannels,
    movie: allMovies,
    series: allSeries,
  }[mediaType] || [];

  const filtered = mediaList
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(item => 
      categoryFilter === 'All' || item.category === categoryFilter
    );

  const paginated = filtered.slice(0, currentPage * ITEMS_PER_PAGE);

  return {
    items: paginated,
    totalCount: mediaList.length,
    totalFiltered: filtered.length,
    hasMore: paginated.length < filtered.length,
  };
};

export const useCurrentCategories = () => {
  const { mediaType, categories } = useStore();
  const currentCats = categories[mediaType] || [];
  return ['All', ...currentCats];
};
