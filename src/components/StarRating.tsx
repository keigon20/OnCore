import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface StarRatingProps {
  value: number; // 0-5
  onChange?: (value: number) => void;
  size?: number;
}

export default function StarRating({ value, onChange, size = 24 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row}>
      {stars.map(star => (
        <TouchableOpacity
          key={star}
          disabled={!onChange}
          onPress={() => onChange?.(star)}
          style={styles.star}
        >
          <Text style={{ fontSize: size, color: star <= value ? colors.textPrimary : colors.border }}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 4,
  },
});
