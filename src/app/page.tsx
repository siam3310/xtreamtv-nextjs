import { getPlaylistDataForType } from '@/lib/parser';
import XtreamApp from './XtreamApp';

export const revalidate = 0; 

export default function LiveTvPage() {
  let playlistData;
  let error;
  try {
    // This now reads from pre-generated JSON files
    playlistData = getPlaylistDataForType('live');
  } catch (e) {
    error = e instanceof Error ? e.message : 'An unknown error occurred';
    playlistData = { channels: [], movies: [], series: [], categories: {live: [], movie: [], series: []} };
  }
  
  return <XtreamApp initialData={playlistData} mediaType="live" error={error} />;
}
