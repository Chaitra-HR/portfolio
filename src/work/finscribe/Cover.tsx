import poster from '../../assets/images/finscribe/film.jpg';
import film from '../../assets/images/finscribe/film.mp4';
import { FilmCover } from '../FilmCover';
import type { ArtProps } from '../types';

export function FinScribeCover({ className }: ArtProps) {
  return <FilmCover film={film} poster={poster} className={className} />;
}
