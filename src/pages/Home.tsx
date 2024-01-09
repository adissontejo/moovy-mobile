import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import Carousel from 'react-native-reanimated-carousel';

import { MovieCard } from '~/components';
import { useAppContext } from '~/contexts';
import { theme } from '~/styles';

export const Home = () => {
  const { movies, recording, setCurrentMovie } = useAppContext();

  const { width } = Dimensions.get('window');

  return (
    <ScrollView
      style={{ width: '100%', height: '100%' }}
      contentContainerStyle={{ width: '100%', minHeight: '100%' }}>
      <Text
        variant="headlineLarge"
        style={{
          margin: 25,
          marginBottom: 42,
          color: theme.colors.secondary,
        }}>
        My Library
      </Text>
      <Carousel
        data={movies}
        renderItem={({ item }) => (
          <View
            style={{
              width: width - 120,
              minHeight: '100%',
              marginHorizontal: 12,
            }}>
            <MovieCard movie={item} />
          </View>
        )}
        width={width - 96}
        style={{
          width,
          minHeight: '100%',
          justifyContent: 'center',
        }}
        loop={movies.length > 1}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        onSnapToItem={index => setCurrentMovie(movies[index])}
        enabled={!recording}
      />
    </ScrollView>
  );
};
