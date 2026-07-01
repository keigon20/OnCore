import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeMediaView,
  NativeAsset,
  NativeAssetType,
} from 'react-native-google-mobile-ads';
import { colors } from '../theme';
import { NATIVE_AD_UNIT_ID } from '../config/ads';

export default function FeedAdCard() {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    let isMounted = true;
    let loadedAd: NativeAd | null = null;

    NativeAd.createForAdRequest(NATIVE_AD_UNIT_ID)
      .then(ad => {
        if (!isMounted) {
          ad.destroy();
          return;
        }
        loadedAd = ad;
        setNativeAd(ad);
      })
      .catch(err => {
        // Ads can fail to fill (e.g. no inventory) - just skip rendering
        // this card rather than breaking the feed.
        console.error('[FeedAdCard] Failed to load native ad:', err);
      });

    return () => {
      isMounted = false;
      loadedAd?.destroy();
    };
  }, []);

  if (!nativeAd) return null;

  return (
    <View style={styles.card}>
      <NativeAdView style={styles.adView} nativeAd={nativeAd}>
        <View style={styles.headerRow}>
          {nativeAd.icon && (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
            </NativeAsset>
          )}
          <View style={styles.headerText}>
            {nativeAd.advertiser && (
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <Text style={styles.advertiser}>{nativeAd.advertiser}</Text>
              </NativeAsset>
            )}
          </View>
          <View style={styles.adBadge}>
            <Text style={styles.adBadgeText}>Ad</Text>
          </View>
        </View>

        <NativeMediaView style={styles.media} resizeMode="cover" />

        <View style={styles.content}>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={styles.headline}>{nativeAd.headline}</Text>
          </NativeAsset>
          {nativeAd.body && (
            <NativeAsset assetType={NativeAssetType.BODY}>
              <Text style={styles.body} numberOfLines={2}>{nativeAd.body}</Text>
            </NativeAsset>
          )}

          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaText}>{nativeAd.callToAction}</Text>
            </TouchableOpacity>
          </NativeAsset>
        </View>
      </NativeAdView>
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
  adView: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  advertiser: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  adBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  media: {
    width: '100%',
    height: 180,
    marginTop: 8,
  },
  content: {
    padding: 16,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
