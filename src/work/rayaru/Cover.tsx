import poster from '../../assets/images/rayaru/film.jpg';
import film from '../../assets/images/rayaru/film.mp4';
import { FilmCover } from '../FilmCover';
import type { ArtProps } from '../types';

/** The opening scene of lifeofrayaru.com and the camera's glide into it, recorded frame by frame from the live site. */
export function RayaruCover({ className }: ArtProps) {
  return <FilmCover film={film} poster={poster} className={className} />;
}
