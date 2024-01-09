import { Movie } from './api';

export interface Operation {
  type: 'post';
  movie: Movie;
}
