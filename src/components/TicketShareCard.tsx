import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MusicEvent } from '../types';

// Fixed logical size, captured at pixelRatio 3 -> exactly 1080x1920 (Instagram Story format).
export const SHARE_CARD_WIDTH = 360;
export const SHARE_CARD_HEIGHT = 640;

const TICKET_COLOR = '#C5492F';
const TICKET_BORDER = '#2A1A12';
const CREAM = '#FBF1E4';

interface TicketShareCardProps {
  event: MusicEvent;
}

export default function TicketShareCard({ event }: TicketShareCardProps) {
  const dateLabel = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();

  return (
    <View style={styles.canvas}>
      <View style={styles.ticket}>
        {event.imageUri && (
          <Image source={{ uri: event.imageUri }} style={styles.image} resizeMode="cover" />
        )}

        <View style={styles.mainSection}>
          <Text style={styles.eyebrow}>ADMIT ONE</Text>
          <Text style={styles.title} numberOfLines={3}>{event.title}</Text>
          <Text style={styles.artists} numberOfLines={2}>{event.artists.join(', ')}</Text>
          <Text style={styles.venue} numberOfLines={2}>{event.venue}</Text>
        </View>

        <View style={styles.perforationRow}>
          <View style={styles.notch} />
          <View style={styles.dashedLine} />
          <View style={styles.notch} />
        </View>

        <View style={styles.stubSection}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
        </View>
      </View>

      <Text style={styles.footer}>Tracked with Setly</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
    backgroundColor: '#0B0B0C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticket: {
    width: SHARE_CARD_WIDTH - 64,
    backgroundColor: TICKET_COLOR,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: TICKET_BORDER,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  mainSection: {
    padding: 24,
    paddingBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: CREAM,
    opacity: 0.7,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: CREAM,
    marginBottom: 10,
  },
  artists: {
    fontSize: 16,
    fontWeight: '600',
    color: CREAM,
    opacity: 0.9,
    marginBottom: 6,
  },
  venue: {
    fontSize: 14,
    color: CREAM,
    opacity: 0.75,
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 0,
  },
  notch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0B0B0C',
    marginTop: -8,
  },
  dashedLine: {
    flex: 1,
    height: 2,
    borderTopWidth: 2,
    borderColor: CREAM,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  stubSection: {
    padding: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: CREAM,
  },
  footer: {
    marginTop: 24,
    fontSize: 13,
    color: '#6B6B70',
    fontWeight: '600',
  },
});
