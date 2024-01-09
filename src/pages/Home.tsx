import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import Carousel from 'react-native-reanimated-carousel';

import { MovieCard } from '~/components';
import { getSavedMovies } from '~/services/movies';
import { theme } from '~/styles';
import { Movie } from '~/types/api';

export const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [recording, setRecording] = useState(false);

  const { width } = Dimensions.get('window');

  useEffect(() => {
    const load = async () => {
      const response = await getSavedMovies();

      setMovies(response.data);
      setSelected(response.data[0].id);
    };

    load();
  }, []);

  console.log(selected, recording);

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
            <MovieCard
              movie={item}
              selected={selected === item.id}
              onRecordStart={() => setRecording(true)}
              onRecordStop={() => setRecording(false)}
            />
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
        onSnapToItem={index => setSelected(movies[index].id)}
        enabled={!recording}
      />
    </ScrollView>
  );
};
