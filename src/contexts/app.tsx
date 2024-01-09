import { addEventListener, useNetInfo } from '@react-native-community/netinfo';
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { DocumentDirectoryPath, unlink } from 'react-native-fs';
import { PERMISSIONS, request } from 'react-native-permissions';
import SoundPlayer from 'react-native-sound-player';

import { getOperations, saveOperations } from '~/repositories/operations';
import {
  addMovieReview,
  getSavedMovies,
  removeMovieReview,
} from '~/services/movies';
import { Movie } from '~/types/api';
import { Operation } from '~/types/storage';

export interface AppContextData {
  movies: Movie[];
  setMovies: Dispatch<SetStateAction<Movie[]>>;
  currentMovie: Movie | null;
  setCurrentMovie: Dispatch<SetStateAction<Movie | null>>;
  recording: boolean;
  playing: boolean;
  pendingSync: Record<string, boolean>;
  currentTime: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  startPlaying: () => void;
  stopPlaying: () => void;
  deleteCurrentReview: () => Promise<void>;
}

export const AppContext = createContext<AppContextData>({
  movies: [],
  setMovies: () => {},
  currentMovie: null,
  setCurrentMovie: () => {},
  recording: false,
  playing: false,
  pendingSync: {},
  currentTime: '00:00',
  startRecording: () => Promise.resolve(),
  stopRecording: () => Promise.resolve(),
  startPlaying: () => {},
  stopPlaying: () => {},
  deleteCurrentReview: () => Promise.resolve(),
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [pendingSync, setPendingSync] = useState<Record<string, boolean>>({});

  const recorder = useRef<AudioRecorderPlayer>(new AudioRecorderPlayer());
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const operations = useRef<Operation[]>([]);

  const netInfo = useNetInfo();

  const currentTime = useMemo(() => {
    return recorder.current.mmss(currentSeconds);
  }, [currentSeconds]);

  const reviewPath = DocumentDirectoryPath + `/${currentMovie?.id}.mp3`;

  const updateSeconds = () => {
    setCurrentSeconds(prev => prev + 1);
  };

  const startRecording = async () => {
    if (currentMovie === null) {
      return;
    }

    if (Platform.OS === 'android') {
      const permission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);

      if (permission !== 'granted') {
        return;
      }
    } else if (Platform.OS === 'ios') {
      const permission = await request(PERMISSIONS.IOS.MICROPHONE);

      if (permission !== 'granted') {
        return;
      }
    }

    await recorder.current.startRecorder(reviewPath);

    setCurrentSeconds(0);
    setRecording(true);

    intervalId.current = setInterval(updateSeconds, 1000);
  };

  const stopRecording = async () => {
    if (currentMovie === null || !recording) {
      return;
    }

    await recorder.current.stopRecorder();

    setRecording(false);
    setCurrentSeconds(0);

    clearInterval(intervalId.current!);

    await uploadReview(currentMovie);
  };

  const startPlaying = () => {
    if (currentMovie === null || !currentMovie.reviewUrl) {
      return;
    }

    SoundPlayer.seek(0);

    if (pendingSync[currentMovie.id]) {
      SoundPlayer.playUrl('file://' + reviewPath);
    } else {
      SoundPlayer.playUrl('http://' + currentMovie.reviewUrl);
    }

    setCurrentSeconds(0);
    setPlaying(true);

    intervalId.current = setInterval(updateSeconds, 1000);
  };

  const stopPlaying = useCallback(() => {
    if (currentMovie === null || !playing) {
      return;
    }

    SoundPlayer.pause();

    setPlaying(false);
    clearInterval(intervalId.current!);
  }, [currentMovie, playing]);

  const uploadReview = useCallback(
    async (movie: Movie) => {
      setPendingSync(prev => ({ ...prev, [movie.id]: true }));

      const path = DocumentDirectoryPath + `/${movie.id}.mp3`;

      operations.current = operations.current.filter(
        item => item.movie.id !== movie.id,
      );

      if (!netInfo.isConnected) {
        operations.current.push({
          type: 'post',
          movie,
        });

        setMovies(prev =>
          prev.map(item =>
            item.id === movie.id ? { ...item, reviewUrl: path } : item,
          ),
        );

        await saveOperations(operations.current);

        return;
      }

      const response = await addMovieReview(movie.id);

      const { reviewUrl } = JSON.parse(response.body);

      setMovies(prev =>
        prev.map(item =>
          item.id === movie.id ? { ...item, reviewUrl } : item,
        ),
      );

      setPendingSync(prev => ({ ...prev, [movie.id]: false }));

      try {
        await unlink(path);
      } catch (error) {}
    },
    [netInfo.isConnected, setMovies],
  );

  const deleteReview = useCallback(
    async (movie: Movie) => {
      setPendingSync(prev => ({ ...prev, [movie.id]: true }));

      const path = DocumentDirectoryPath + `/${movie.id}.mp3`;

      const index = operations.current.findIndex(
        operation =>
          operation.movie.id === movie.id && operation.type === 'post',
      );

      if (index !== -1) {
        operations.current.splice(index, 1);

        setPendingSync(prev => ({ ...prev, [movie.id]: false }));

        await saveOperations(operations.current);

        try {
          await unlink(path);
        } catch (error) {}
      } else if (!netInfo.isConnected) {
        operations.current.push({
          type: 'delete',
          movie,
        });

        await saveOperations(operations.current);
      } else {
        await removeMovieReview(movie.id);

        setPendingSync(prev => ({ ...prev, [movie.id]: false }));
      }

      setMovies(prev =>
        prev.map(item =>
          item.id === movie.id ? { ...item, reviewUrl: null } : item,
        ),
      );
    },
    [netInfo.isConnected, setMovies],
  );

  const deleteCurrentReview = async () => {
    if (currentMovie === null) {
      return;
    }

    if (playing) {
      stopPlaying();
    }

    await deleteReview(currentMovie);
  };

  useEffect(() => {
    const load = async () => {
      const response = await getSavedMovies();

      setMovies(response.data);
      setCurrentMovie(response.data[0]);

      operations.current = await getOperations();

      console.log(operations.current);
    };

    load();
  }, []);

  useEffect(() => {
    const listener = SoundPlayer.addEventListener(
      'FinishedPlaying',
      stopPlaying,
    );

    return () => listener.remove();
  }, [stopPlaying]);

  useEffect(() => {
    const load = async () => {
      if (playing) {
        stopPlaying();
      }

      if (recording) {
        await stopRecording();
      }

      setCurrentSeconds(0);
    };

    load();
  }, [currentMovie]);

  useEffect(() => {
    const unsub = addEventListener(async state => {
      if (state.isConnected) {
        await Promise.all(
          operations.current.map(operation => {
            const promise = async () => {
              if (operation.type === 'post') {
                await uploadReview(operation.movie);
              } else {
                await deleteReview(operation.movie);
              }
            };

            return promise();
          }),
        );

        operations.current = [];

        await saveOperations([]);
      }
    });

    return () => unsub();
  }, [uploadReview, deleteReview]);

  return (
    <AppContext.Provider
      value={{
        movies,
        setMovies,
        currentMovie,
        setCurrentMovie,
        recording,
        playing,
        pendingSync,
        currentTime,
        startRecording,
        stopRecording,
        startPlaying,
        stopPlaying,
        deleteCurrentReview,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
