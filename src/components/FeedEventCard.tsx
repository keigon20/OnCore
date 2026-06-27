import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { FeedEvent } from '../types';
import { useEventSocial } from '../hooks/useEventSocial';

interface FeedEventCardProps {
  event: FeedEvent;
  onPressComments: () => void;
}

export default function FeedEventCard({ event, onPressComments }: FeedEventCardProps) {
  const { likeCount, isLikedByMe, toggleLike, commentCount } = useEventSocial(event.id);
  const isUpcoming = new Date(event.date) >= new Date();

  return (
    <View style={styles.card}>
      <Text style={styles.owner}>{event.userDisplayName}</Text>

      {event.imageUri && (
        <Image source={{ uri: event.imageUri }} style={styles.image} />
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.artists}>{event.artists.join(', ')}</Text>
        <Text style={styles.venue}>{event.venue}</Text>
        <Text style={styles.date}>
          {isUpcoming ? 'Upcoming · ' : ''}{new Date(event.date).toLocaleDateString()}
        </Text>

        {event.overallRating !== undefined && (
          <Text style={styles.rating}>Rated {event.overallRating.toFixed(1)}/10</Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
            <Text style={[styles.actionText, isLikedByMe && styles.actionTextActive]}>
              {isLikedByMe ? 'Liked' : 'Like'}{likeCount > 0 ? ` (${likeCount})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onPressComments}>
            <Text style={styles.actionText}>
              Comment{commentCount > 0 ? ` (${commentCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  owner: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  image: {
    width: '100%',
    height: 180,
    marginTop: 8,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  artists: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  venue: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  rating: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionTextActive: {
    color: colors.accent,
  },
});
