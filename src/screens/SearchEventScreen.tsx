import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { searchTicketmasterEvents, TicketmasterEventResult } from '../utils/ticketmaster';
import { colors } from '../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SearchEvent'>;
type Step = 'select' | 'search';

export default function SearchEventScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('select');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TicketmasterEventResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step !== 'search') return;
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeout = setTimeout(async () => {
      try {
        const events = await searchTicketmasterEvents(query.trim());
        setResults(events);
      } catch (err: any) {
        setError(err.message || 'Failed to search events');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, step]);

  const handleSelect = (result: TicketmasterEventResult) => {
    navigation.navigate('AddEvent', { prefill: result.prefill });
  };

  const handleAddCustom = () => {
    navigation.navigate('AddEvent', {});
  };

  const renderResult = ({ item }: { item: TicketmasterEventResult }) => (
    <TouchableOpacity style={styles.resultCard} onPress={() => handleSelect(item)}>
      {item.prefill.imageUri ? (
        <Image source={{ uri: item.prefill.imageUri }} style={styles.resultImage} />
      ) : (
        <View style={[styles.resultImage, styles.resultImagePlaceholder]} />
      )}
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.prefill.title}</Text>
        <Text style={styles.resultVenue}>{item.prefill.venue}</Text>
        <Text style={styles.resultDate}>
          {new Date(item.prefill.date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (step === 'select') {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Event</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.selectContainer}>
          <Text style={styles.selectPrompt}>Is this event in the future or the past?</Text>

          <TouchableOpacity
            style={styles.typeCard}
            onPress={() => setStep('search')}
          >
            <Text style={styles.typeCardEmoji}>🎟️</Text>
            <View style={styles.typeCardText}>
              <Text style={styles.typeCardTitle}>Planning to go</Text>
              <Text style={styles.typeCardSubtitle}>Find your upcoming event on Ticketmaster</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.typeCard}
            onPress={handleAddCustom}
          >
            <Text style={styles.typeCardEmoji}>✅</Text>
            <View style={styles.typeCardText}>
              <Text style={styles.typeCardTitle}>Already attended</Text>
              <Text style={styles.typeCardSubtitle}>Add a past event manually</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => setStep('select')}>
          <Text style={styles.cancelText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Your Event</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search artist, venue, or event..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      {isLoading && (
        <ActivityIndicator style={styles.loading} size="small" color={colors.textPrimary} />
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !isLoading && query.trim() && !error ? (
            <Text style={styles.emptyText}>No events found on Ticketmaster</Text>
          ) : null
        }
      />

      <TouchableOpacity style={styles.customButton} onPress={handleAddCustom}>
        <Text style={styles.customButtonText}>Can't find it? Add custom event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 50,
  },
  selectContainer: {
    flex: 1,
    padding: 24,
  },
  selectPrompt: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeCardEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  typeCardText: {
    flex: 1,
  },
  typeCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  typeCardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
  },
  loading: {
    marginTop: 8,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 14,
    marginTop: 24,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultImage: {
    width: 80,
    height: 80,
  },
  resultImagePlaceholder: {
    backgroundColor: colors.surfaceAlt,
  },
  resultInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  resultVenue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  resultDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  customButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  customButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
});
