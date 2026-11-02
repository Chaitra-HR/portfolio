import poster from '../../assets/images/website-revamp/film.jpg';
import film from '../../assets/images/website-revamp/film.mp4';
import { FilmCover } from '../FilmCover';
import type { ArtProps } from '../types';

export function WebsiteCover({ className }: ArtProps) {
  return <FilmCover film={film} poster={poster} className={className} />;
}
