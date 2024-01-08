import React from 'react';
import { Image, Platform, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import {
  request,
  PERMISSIONS,
  requestMultiple,
} from 'react-native-permissions';

import MicrophoneIcon from '~/assets/microphone.svg';
import StarIcon from '~/assets/star.svg';
import { theme } from '~/styles';
import { Movie } from '~/types/api';

export interface MovieCardProps {
  movie: Movie;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
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
          variant="bodyLarge"
          style={{
            color: theme.colors.info,
            textAlign: 'center',
            paddingHorizontal: 4,
          }}>
          {movie.rating}
        </Text>
      </View>
      <IconButton
        mode="contained"
        icon={MicrophoneIcon}
        onPress={() => {
          if (Platform.OS === 'android') {
            requestMultiple([
              PERMISSIONS.ANDROID.RECORD_AUDIO,
              PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
              PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
            ]);
          }
        }}
        style={{
          marginTop: 24,
          width: 60,
          height: 60,
          backgroundColor: theme.colors.primary,
        }}
        size={30}
        rippleColor="#4444"
      />
    </View>
  );
};
