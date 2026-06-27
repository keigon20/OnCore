import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface OverallRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
}

export default function OverallRatingInput({ value, onChange, step = 0.5 }: OverallRatingInputProps) {
  const [text, setText] = useState(value.toFixed(1));
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current) {
      setText(value.toFixed(1));
    }
  }, [value]);

  const clamp = (n: number) => Math.min(10, Math.max(0, Math.round(n * 10) / 10));

  const commit = () => {
    isFocused.current = false;
    const parsed = parseFloat(text);
    const next = isNaN(parsed) ? value : clamp(parsed);
    onChange(next);
    setText(next.toFixed(1));
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.button} onPress={() => onChange(clamp(value - step))}>
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.value}
        value={text}
        onChangeText={setText}
        onFocus={() => { isFocused.current = true; }}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType="decimal-pad"
        selectTextOnFocus
        maxLength={4}
      />
      <TouchableOpacity style={styles.button} onPress={() => onChange(clamp(value + step))}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginHorizontal: 20,
    minWidth: 50,
    textAlign: 'center',
    padding: 0,
  },
});
