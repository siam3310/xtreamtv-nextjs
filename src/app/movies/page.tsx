import { parseXtreamPlaylist } from '@/lib/parser';
import XtreamApp from '../XtreamApp';

export const revalidate = 3600;

export default async function MoviesPage() {
  let playlistData;
  let error;
  try {
    playlistData = await parseXtreamPlaylist();
  } catch (e) {
    error = e instanceof Error ? e.message : 'An unknown error occurred';
    playlistData = { channels: [], movies: [], series: [], categories: {live: [], movie: [], series: []} };
  }

  return <XtreamApp initialData={playlistData} mediaType="movie" error={error} />;
}
