import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useEventStore } from '../contexts/EventStoreContext';
import { useFriends } from '../contexts/FriendsContext';
import { colors } from '../theme';
import type { RootStackParamList } from '../types/navigation';

interface ProfileScreenProps {
  onSignIn: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen({ onSignIn }: ProfileScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const { user, isAuthenticated, logout } = useAuth();
  const eventStore = useEventStore();
  const { friends, incomingRequests } = useFriends();
  const [showEditName, setShowEditName] = useState(false);
  const [tempName, setTempName] = useState(user?.displayName || '');

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const renderStatCard = (title: string, value: string) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.displayName}>
          {user?.displayName || 'Concert Journal'}
        </Text>
        {isAuthenticated && (
          <Text style={styles.email}>{user?.email}</Text>
        )}
        <Text style={styles.subtitle}>Your Concert Journey</Text>
      </View>

      <View style={styles.statsGrid}>
        {renderStatCard('Total Events', `${eventStore.totalEvents}`)}
        {renderStatCard('Unique Artists', `${eventStore.uniqueArtists}`)}
        {renderStatCard('Unique Venues', `${eventStore.uniqueVenues}`)}
        {renderStatCard('Total Spent', formatCurrency(eventStore.totalMoneySpent))}
        {renderStatCard('Average Cost', formatCurrency(eventStore.averageCost))}
        {renderStatCard('Favorite Artist', eventStore.favoriteArtist || 'N/A')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Events</Text>
        {eventStore.mostRecentEvent && (
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.infoTitle}>Most Recent</Text>
              <Text style={styles.infoValue}>{eventStore.mostRecentEvent.title}</Text>
              <Text style={styles.infoDate}>
                {new Date(eventStore.mostRecentEvent.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
        {eventStore.oldestEvent && (
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.infoTitle}>First Event</Text>
              <Text style={styles.infoValue}>{eventStore.oldestEvent.title}</Text>
              <Text style={styles.infoDate}>
                {new Date(eventStore.oldestEvent.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </View>

      {isAuthenticated && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.friendsRow} onPress={() => navigation.navigate('Friends')}>
            <Text style={styles.friendsRowText}>Friends</Text>
            <Text style={styles.friendsRowValue}>
              {friends.length}{incomingRequests.length > 0 ? ` · ${incomingRequests.length} pending` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.authSection}>
        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginTitle}>Sign in to sync your data</Text>
            <Text style={styles.loginSubtitle}>
              Your events will be saved to the cloud and accessible across devices
            </Text>
            <TouchableOpacity style={styles.loginButton} onPress={onSignIn}>
              <Text style={styles.loginButtonText}>Sign In / Create Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={showEditName}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholderTextColor={colors.textTertiary}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelBtn]}
                onPress={() => setShowEditName(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveBtn]}
                onPress={() => setShowEditName(false)}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  section: {
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoTitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoDate: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  friendsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendsRowText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  friendsRowValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  authSection: {
    padding: 16,
  },
  logoutButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.destructive,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.destructive,
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelBtn: {
    backgroundColor: colors.surfaceAlt,
  },
  cancelBtnText: {
    color: colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: colors.accent,
  },
  saveBtnText: {
    color: colors.textPrimary,
  },
});

