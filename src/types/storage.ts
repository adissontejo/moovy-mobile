import { Movie } from './api';

export interface Operation {
  type: 'post' | 'delete';
  movie: Movie;
}
