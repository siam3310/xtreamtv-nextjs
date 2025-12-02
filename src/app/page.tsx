import { parseXtreamPlaylist } from '@/lib/parser';
import XtreamApp from './XtreamApp';

export const revalidate = 0; // Disable revalidation, we handle caching manually

export default async function LiveTvPage() {
  let playlistData;
  let error;
  try {
    playlistData = await parseXtreamPlaylist('live');
  } catch (e) {
    error = e instanceof Error ? e.message : 'An unknown error occurred';
    playlistData = { channels: [], movies: [], series: [], categories: {live: [], movie: [], series: []} };
  }
  
  return <XtreamApp initialData={playlistData} mediaType="live" error={error} />;
}
