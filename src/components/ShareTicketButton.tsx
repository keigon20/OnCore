import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { colors } from '../theme';
import { MusicEvent } from '../types';
import TicketShareCard, { SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT } from './TicketShareCard';

interface ShareTicketButtonProps {
  event: MusicEvent;
}

export default function ShareTicketButton({ event }: ShareTicketButtonProps) {
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (event.imageUri) {
        // The ticket card includes the event photo - make sure it's actually
        // loaded before capturing, or the snapshot can come out with a blank gap.
        try {
          await Image.prefetch(event.imageUri);
        } catch (prefetchErr) {
          console.error('[ShareTicketButton] Image prefetch failed, sharing without it loaded:', prefetchErr);
        }
      }

      const uri = await captureRef(cardRef, {
        format: 'png',
        width: SHARE_CARD_WIDTH * 3,
        height: SHARE_CARD_HEIGHT * 3,
        result: 'tmpfile',
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
        return;
      }

      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch (err) {
      console.error('[ShareTicketButton] Failed to share ticket:', err);
      Alert.alert('Error', 'Failed to create the shareable ticket image.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.shareButton} onPress={handleShare} disabled={isSharing}>
        <Text style={styles.shareButtonText}>{isSharing ? 'Preparing...' : 'Share Ticket'}</Text>
      </TouchableOpacity>

      {/* Rendered off-screen purely so captureRef has a real laid-out view to capture. */}
      <View style={styles.hiddenCapture} collapsable={false} ref={cardRef}>
        <TicketShareCard event={event} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  hiddenCapture: {
    position: 'absolute',
    top: -9999,
    left: 0,
  },
});
