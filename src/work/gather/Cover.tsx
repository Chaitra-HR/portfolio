import poster from '../../assets/images/gather/film.jpg';
import film from '../../assets/images/gather/film.mp4';
import { FilmCover } from '../FilmCover';
import type { ArtProps } from '../types';

export function GatherCover({ className }: ArtProps) {
  return <FilmCover film={film} poster={poster} className={className} />;
}
