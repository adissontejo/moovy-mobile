import React from 'react';
import { Dimensions, Image, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import MicrophoneIcon from '~/assets/microphone.svg';
import SendIcon from '~/assets/send.svg';
import StarIcon from '~/assets/star.svg';

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
    currentTime,
    startRecording,
    stopRecording,
  } = useAppContext();

  const isRecording = currentMovie?.id === movie.id && recording;

  const { width } = Dimensions.get('window');

  const handleRecordClick = async () => {
    if (currentMovie?.id !== movie.id) {
      return;
    }

    if (recording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const overlayStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isRecording ? width - 32 : 60, { duration: 400 }),
      height: withTiming(isRecording ? 240 : 60, { duration: 400 }),
      left: withTiming(isRecording ? -width / 2 + 30 + 16 : 0, {
        duration: 400,
      }),
      bottom: withTiming(isRecording ? -12 : 0, { duration: 400 }),
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
              {currentTime}
            </Text>
          </View>
        </Animated.View>
        <IconButton
          mode="contained"
          icon={isRecording ? SendIcon : MicrophoneIcon}
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
