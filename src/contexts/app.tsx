import { addEventListener, useNetInfo } from '@react-native-community/netinfo';
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
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

import { getOperations, saveOperations } from '~/repositories/operations';
import { addMovieReview, getSavedMovies } from '~/services/movies';
import { Movie } from '~/types/api';
import { Operation } from '~/types/storage';

export interface AppContextData {
  movies: Movie[];
  setMovies: Dispatch<SetStateAction<Movie[]>>;
  currentMovie: Movie | null;
  setCurrentMovie: Dispatch<SetStateAction<Movie | null>>;
  recording: boolean;
  setRecording: Dispatch<SetStateAction<boolean>>;
  currentTime: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

export const AppContext = createContext<AppContextData>({
  movies: [],
  setMovies: () => {},
  currentMovie: null,
  setCurrentMovie: () => {},
  recording: false,
  setRecording: () => {},
  currentTime: '00:00',
  startRecording: () => Promise.resolve(),
  stopRecording: () => Promise.resolve(),
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [recording, setRecording] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);

  const preventRecording = useRef(false);
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
    if (currentMovie === null || preventRecording.current) {
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

    preventRecording.current = true;

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

    preventRecording.current = false;

    clearInterval(intervalId.current!);

    await uploadReview(currentMovie);
  };

  const uploadReview = async (movie: Movie) => {
    const path = DocumentDirectoryPath + `/${movie.id}.mp3`;

    if (!netInfo.isConnected) {
      operations.current.push({
        type: 'post',
        movie,
      });

      await saveOperations(operations.current);

      return;
    }

    if (currentMovie === null) {
      return;
    }

    await addMovieReview(movie.id);

    try {
      await unlink(path);
    } catch (error) {}
  };

  useEffect(() => {
    const load = async () => {
      const response = await getSavedMovies();

      setMovies(response.data);
      setCurrentMovie(response.data[0]);

      operations.current = await getOperations();

      addEventListener(async state => {
        if (state.isConnected) {
          await Promise.all(
            operations.current.map(operation => {
              const promise = async () => {
                if (operation.type === 'post') {
                  await uploadReview(operation.movie);
                }
              };

              return promise();
            }),
          );

          operations.current = [];

          await saveOperations([]);
        }
      });
    };

    load();
  }, []);

  return (
    <AppContext.Provider
      value={{
        movies,
        setMovies,
        currentMovie,
        setCurrentMovie,
        recording,
        setRecording,
        currentTime,
        startRecording,
        stopRecording,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
