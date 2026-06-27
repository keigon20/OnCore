import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { db } from '../utils/firebase';
import { colors } from '../theme';
import { useFriends } from '../contexts/FriendsContext';
import { FeedEvent } from '../types';
import FeedEventCard from '../components/FeedEventCard';
import type { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MAX_FRIENDS_PER_QUERY = 30; // Firestore 'in' query limit

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { friends } = useFriends();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (friends.length === 0) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    const friendIds = friends.slice(0, MAX_FRIENDS_PER_QUERY).map(f => f.id);
    const q = query(
      collection(db, 'events'),
      where('userId', 'in', friendIds),
      where('isHidden', '==', false),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const loaded: FeedEvent[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          userId: data.userId,
          userDisplayName: data.userDisplayName || 'Friend',
          title: data.title,
          artists: data.artists || [],
          venue: data.venue,
          date: data.date?.toDate() || new Date(),
          cost: data.cost || 0,
          notes: data.notes || '',
          imageUri: data.imageUri || undefined,
          overallRating: data.overallRating,
          soundRating: data.soundRating,
          crowdRating: data.crowdRating,
          setlistRating: data.setlistRating,
          isHidden: data.isHidden || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };
      });
      setEvents(loaded);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [friends]);

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date) >= now).sort((a, b) => a.date.getTime() - b.date.getTime());
  const recent = events.filter(e => new Date(e.date) < now);
  const feedItems = [...upcoming, ...recent];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={feedItems}
      keyExtractor={item => item.id}
      contentContainerStyle={[styles.list, { paddingTop: insets.top + 16 }]}
      ListHeaderComponent={<Text style={styles.heading}>Friends</Text>}
      renderItem={({ item }) => (
        <FeedEventCard
          event={item}
          onPressComments={() => navigation.navigate('Comments', { eventId: item.id, eventTitle: item.title })}
        />
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {friends.length === 0 ? 'No friends yet' : 'No events yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {friends.length === 0
              ? 'Add friends from your Profile to see their events here.'
              : "Your friends haven't logged any events yet."}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
