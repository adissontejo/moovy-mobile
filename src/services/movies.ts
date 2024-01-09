import RNFS from 'react-native-fs';

import type { Movie } from '~/types/api';
import { api } from './api';

export const getSavedMovies = () => {
  return api.get<Movie[]>('/movies/saved');
};

export const addMovieReview = (id: string) => {
  return RNFS.uploadFiles({
    files: [
      {
        name: 'review',
        filename: `${id}.mp3`,
        filepath: RNFS.DocumentDirectoryPath + `/${id}.mp3`,
        filetype: 'audio/mpeg',
      },
    ],
    toUrl: `${api.defaults.baseURL}/movies/${id}/review`,
  }).promise;
};
