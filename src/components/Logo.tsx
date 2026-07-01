import React from 'react';
import { Image, StyleSheet, ImageStyle, StyleProp } from 'react-native';

const ASPECT_RATIO = 484 / 200;

interface LogoProps {
  height?: number;
  style?: StyleProp<ImageStyle>;
}

export default function Logo({ height = 28, style }: LogoProps) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={[{ height, width: height * ASPECT_RATIO }, styles.image, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'flex-start',
  },
});
