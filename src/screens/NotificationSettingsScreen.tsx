import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { useNotifications } from '../contexts/NotificationsContext';
import { NotificationPrefs } from '../types';
import { colors } from '../theme';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { prefs, updatePref } = useNotifications();

  const renderToggle = (
    label: string,
    prefKey: keyof NotificationPrefs,
    sublabel?: string,
    disabled?: boolean,
  ) => (
    <View style={[styles.row, disabled && styles.rowDisabled]} key={prefKey}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, disabled && styles.rowLabelDimmed]}>{label}</Text>
        {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
      </View>
      <Switch
        value={prefs[prefKey]}
        onValueChange={v => updatePref(prefKey, v)}
        disabled={disabled}
        trackColor={{ false: colors.surfaceAlt, true: colors.accent }}
        thumbColor={colors.textPrimary}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          {renderToggle('All Notifications', 'all')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types</Text>
          {renderToggle('Friend Requests', 'friendRequest', undefined, !prefs.all)}
          {renderToggle('Friend Posts', 'friendPost', undefined, !prefs.all)}
          {renderToggle('Likes', 'eventLike', undefined, !prefs.all)}
          {renderToggle('Comments', 'eventComment', undefined, !prefs.all)}
          {renderToggle('Replies', 'commentReply', undefined, !prefs.all)}
          {renderToggle('Event Reminders', 'eventReminder', 'Day after a scheduled event', !prefs.all)}
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 50,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowLabelDimmed: {
    color: colors.textSecondary,
  },
  rowSublabel: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
