import React, { useRef, useState } from 'react';
import { Dimensions, Image, Platform, View } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { IconButton, Text } from 'react-native-paper';
import { PERMISSIONS, check, request } from 'react-native-permissions';
import RNFS from 'react-native-fs';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import MicrophoneIcon from '~/assets/microphone.svg';
import SendIcon from '~/assets/send.svg';
import StarIcon from '~/assets/star.svg';

import { addMovieReview } from '~/services/movies';
import { theme } from '~/styles';
import { Movie } from '~/types/api';

export interface MovieCardProps {
  movie: Movie;
  selected: boolean;
  onRecordStart: () => void;
  onRecordStop: () => void;
}

export const MovieCard = ({
  movie,
  selected,
  onRecordStart,
  onRecordStop,
}: MovieCardProps) => {
  const [recording, setRecording] = useState(false);
  const [recordPosition, setRecordPosition] = useState(0);

  const intervalHandle = useRef<NodeJS.Timeout>();
  const recorder = useRef(new AudioRecorderPlayer());
  const preventRecord = useRef(false);

  const { width } = Dimensions.get('window');

  const reviewPath = RNFS.DocumentDirectoryPath + `/${movie.id}.mp3`;

  const updateRecordingTime = () => {
    setRecordPosition(prev => prev + 1);
  };

  const handleRecordClick = async () => {
    if (recording) {
      await handleStopRecording();
    } else {
      await handleStartRecording();
    }
  };

  const handleStartRecording = async () => {
    if (preventRecord.current || !selected) {
      return;
    }

    if (Platform.OS === 'android') {
      const permission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);

      if (permission !== 'granted') {
        return;
      }
    } else if (Platform.OS === 'ios') {
      const permission = await check(PERMISSIONS.IOS.MICROPHONE);

      if (permission !== 'granted') {
        return;
      }
    }

    onRecordStart();

    preventRecord.current = true;

    setRecordPosition(0);

    await recorder.current.startRecorder(reviewPath);

    intervalHandle.current = setInterval(updateRecordingTime, 1000);

    setRecording(true);
  };

  const handleStopRecording = async () => {
    if (!recording || recordPosition === 0) {
      return;
    }

    try {
      await recorder.current.stopRecorder();
    } catch (error) {
      console.log(error);
    }

    preventRecord.current = false;

    clearInterval(intervalHandle.current);

    setRecording(false);

    onRecordStop();

    try {
      await addMovieReview(movie.id);
    } catch (error) {
      console.log(error);
    }
  };

  const overlayStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(recording ? width - 32 : 60, { duration: 400 }),
      height: withTiming(recording ? 240 : 60, { duration: 400 }),
      left: withTiming(recording ? -width / 2 + 30 + 16 : 0, {
        duration: 400,
      }),
      bottom: withTiming(recording ? -12 : 0, { duration: 400 }),
    };
  });

  return (
    <View style={{ width: '100%', minHeight: '100%', alignItems: 'center' }}>
      <Image
        style={{ width: '100%', borderRadius: 20, aspectRatio: 2 / 3 }}
        source={{ uri: movie.posterUrl }}
      />
      <Text
        numberOfLines={1}
        variant="titleLarge"
        style={{
          color: theme.colors.secondary,
          textAlign: 'center',
          marginTop: 42,
          paddingHorizontal: 4,
        }}>
        {movie.title}
      </Text>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <StarIcon width={16} height={16} />
        <Text
          variant="bodySmall"
          style={{
            color: theme.colors.info,
            textAlign: 'center',
            paddingHorizontal: 4,
          }}>
          {movie.rating}
        </Text>
      </View>
      <View
        style={{
          marginTop: 24,
          alignItems: 'center',
          overflow: 'visible',
        }}>
        <Animated.View
          style={[
            overlayStyle,
            {
              position: 'absolute',
              backgroundColor: theme.colors.secondary,
              opacity: 0.9,
              borderRadius: 30,
              overflow: 'hidden',
              alignItems: 'center',
            },
          ]}>
          <Text
            numberOfLines={1}
            variant="bodyMedium"
            style={{ color: 'white', marginTop: 32 }}>
            Press button to send
          </Text>
          <View
            style={{
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 100,
                backgroundColor: 'red',
              }}
            />
            <Text
              numberOfLines={1}
              variant="bodyLarge"
              style={{ color: 'white', marginLeft: 8 }}>
              {recorder.current?.mmss(recordPosition)}
            </Text>
          </View>
        </Animated.View>
        <IconButton
          mode="contained"
          icon={recording ? SendIcon : MicrophoneIcon}
          onPress={handleRecordClick}
          style={{
            margin: 0,
            width: 60,
            height: 60,
            backgroundColor: theme.colors.primary,
          }}
          size={30}
          rippleColor="#4444"
        />
      </View>
    </View>
  );
};
