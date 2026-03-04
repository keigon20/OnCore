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
import { useAuth } from '../contexts/AuthContext';
import { useEventStore } from '../contexts/EventStoreContext';

interface ProfileScreenProps {
  onSignIn: () => void;
}

export default function ProfileScreen({ onSignIn }: ProfileScreenProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const eventStore = useEventStore();
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

  const renderStatCard = (icon: string, title: string, value: string, color: string = '#007AFF') => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
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
        {renderStatCard('🎵', 'Total Events', `${eventStore.totalEvents}`, '#007AFF')}
        {renderStatCard('🎸', 'Unique Artists', `${eventStore.uniqueArtists}`, '#FF9500')}
        {renderStatCard('🏟️', 'Unique Venues', `${eventStore.uniqueVenues}`, '#AF52DE')}
        {renderStatCard('💰', 'Total Spent', formatCurrency(eventStore.totalMoneySpent), '#34C759')}
        {renderStatCard('📊', 'Average Cost', formatCurrency(eventStore.averageCost), '#007AFF')}
        {renderStatCard('⭐', 'Favorite Artist', eventStore.favoriteArtist || 'N/A', '#FFCC00')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Events</Text>
        {eventStore.mostRecentEvent && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
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
            <Text style={styles.infoIcon}>🎫</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoDate: {
    fontSize: 12,
    color: '#999',
  },
  authSection: {
    padding: 16,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
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
    backgroundColor: '#f5f5f5',
  },
  cancelBtnText: {
    color: '#666',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
  },
  saveBtnText: {
    color: '#fff',
  },
});

