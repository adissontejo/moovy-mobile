import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import MicrophoneIcon from '~/assets/microphone.svg';
import SendIcon from '~/assets/send.svg';
import StarIcon from '~/assets/star.svg';
import TrashIcon from '~/assets/trash.svg';
import PlayIcon from '~/assets/play.svg';
import StopIcon from '~/assets/stop.svg';

import { theme } from '~/styles';
import { Movie } from '~/types/api';
import { useAppContext } from '~/contexts';

export interface MovieCardProps {
  movie: Movie;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const {
    currentMovie,
    recording,
    playing,
    pendingSync,
    currentTime,
    startRecording,
    stopRecording,
    startPlaying,
    stopPlaying,
    deleteCurrentReview,
  } = useAppContext();

  const [syncStatus, setSyncStatus] = useState<
    'synced' | 'pending sync' | null
  >(null);

  const preventRecordClick = useRef(false);
  const preventSendClick = useRef(false);
  const preventPlayClick = useRef(false);
  const preventEraseClick = useRef(false);
  const firstRender = useRef(true);

  const isRecording = currentMovie?.id === movie.id && recording;

  const { width } = Dimensions.get('window');

  const handleRecordClick = async () => {
    if (currentMovie?.id !== movie.id) {
      return;
    }

    if (recording) {
      if (preventSendClick.current) {
        return;
      }

      preventSendClick.current = true;

      await stopRecording();
    } else {
      if (preventRecordClick.current) {
        return;
      }

      preventRecordClick.current = true;

      await startRecording();
    }
  };

  const handleEraseClick = async () => {
    if (currentMovie?.id !== movie.id) {
      return;
    }

    if (preventEraseClick.current) {
      return;
    }

    preventEraseClick.current = true;

    await deleteCurrentReview();
  };

  const handlePlayClick = () => {
    if (currentMovie?.id !== movie.id) {
      return;
    }

    if (preventPlayClick.current) {
      return;
    }

    preventPlayClick.current = true;

    if (playing) {
      stopPlaying();
    } else {
      startPlaying();
    }
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;

      return;
    }

    if (pendingSync[movie.id]) {
      setSyncStatus('pending sync');
    } else {
      setSyncStatus('synced');

      const timeout = setTimeout(() => {
        setSyncStatus(null);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [pendingSync[movie.id]]);

  useEffect(() => {
    if (recording) {
      preventRecordClick.current = false;
    }
  }, [recording]);

  useEffect(() => {
    if (movie.reviewUrl) {
      preventSendClick.current = false;
    } else {
      preventEraseClick.current = false;
    }
  }, [movie.reviewUrl]);

  useEffect(() => {
    preventPlayClick.current = false;
  }, [playing]);

  const syncInfoStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(syncStatus ? 0 : 36, { duration: 400 }),
        },
      ],
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isRecording ? width - 32 : 0, { duration: 400 }),
      height: withTiming(isRecording ? 240 : 0, { duration: 400 }),
      left: withTiming(isRecording ? -44 : -44 + (width - 32) / 2, {
        duration: 400,
      }),
      bottom: withTiming(isRecording ? -12 : 0, { duration: 400 }),
    };
  });

  return (
    <View
      style={{
        width: '100%',
        minHeight: '100%',
        alignItems: 'center',
      }}>
      <View style={{ width: '100%', borderRadius: 20, overflow: 'hidden' }}>
        <Image
          style={{ width: '100%', aspectRatio: 2 / 3 }}
          source={{ uri: movie.posterUrl }}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#E5E5E5',
            },
            syncInfoStyle,
          ]}>
          <Text variant="bodySmall">{syncStatus || 'synced'}</Text>
        </Animated.View>
      </View>
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
          width: '100%',
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
              {currentTime}
            </Text>
          </View>
        </Animated.View>
        {movie.reviewUrl ? (
          <View
            style={{
              width: '100%',
              alignItems: 'center',
            }}>
            <IconButton
              mode="contained"
              containerColor={theme.colors.danger}
              style={{
                position: 'absolute',
                top: 28,
                left: 8,
                margin: 0,
                width: 36,
                height: 36,
              }}
              onPress={handleEraseClick}
              rippleColor="#4444"
              icon={TrashIcon}
            />
            <Text variant="bodySmall" style={{ fontSize: 14 }}>
              {currentTime}
            </Text>
            <IconButton
              mode="contained"
              containerColor={theme.colors.grey}
              style={{
                margin: 0,
                marginTop: 2,
                width: 48,
                height: 48,
                borderRadius: 100,
              }}
              onPress={handlePlayClick}
              rippleColor="#4444"
              icon={playing ? StopIcon : PlayIcon}
            />
          </View>
        ) : (
          <IconButton
            mode="contained"
            containerColor={theme.colors.primary}
            icon={isRecording ? SendIcon : MicrophoneIcon}
            onPress={handleRecordClick}
            style={{
              margin: 0,
              width: 60,
              height: 60,
            }}
            rippleColor="#4444"
          />
        )}
      </View>
    </View>
  );
};
