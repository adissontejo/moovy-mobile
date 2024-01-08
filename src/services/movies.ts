import type { Movie } from '~/types/api';
import { api } from './api';

export const getSavedMovies = () => {
  return api.get<Movie[]>('/movies/saved');
};
