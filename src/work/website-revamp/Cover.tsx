import poster from '../../assets/images/website-revamp/film.webp';
import hevc from '../../assets/images/website-revamp/film-hevc.mp4';
import film from '../../assets/images/website-revamp/film.mp4';
import { FilmCover } from '../FilmCover';
import type { ArtProps } from '../types';

export function WebsiteCover({ className }: ArtProps) {
  return <FilmCover film={film} hevc={hevc} poster={poster} arrive className={className} />;
}
