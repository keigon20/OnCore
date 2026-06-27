import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { useFriends } from '../contexts/FriendsContext';
import { Friend, FriendRequest } from '../types';

export default function FriendsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    searchUserByEmail,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  } = useFriends();

  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) return;
    setIsSearching(true);
    try {
      const found = await searchUserByEmail(email.trim());
      if (!found) {
        Alert.alert('Not found', 'No user found with that email.');
        return;
      }
      const alreadyFriend = friends.some(f => f.id === found.id);
      const alreadyRequested = outgoingRequests.some(r => r.toUserId === found.id);
      if (alreadyFriend) {
        Alert.alert('Already friends', `You're already friends with ${found.displayName}.`);
        return;
      }
      if (alreadyRequested) {
        Alert.alert('Already sent', `You already sent a request to ${found.displayName}.`);
        return;
      }
      await sendFriendRequest(found);
      setEmail('');
      Alert.alert('Request sent', `Friend request sent to ${found.displayName}.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to search for that user.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemoveFriend = (friend: Friend) => {
    Alert.alert(
      'Remove Friend',
      `Remove ${friend.displayName} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFriend(friend.id) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            <View style={styles.searchSection}>
              <TextInput
                style={styles.input}
                placeholderTextColor={colors.textTertiary}
                placeholder="Friend's email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleSearch} disabled={isSearching}>
                <Text style={styles.addButtonText}>{isSearching ? 'Searching...' : 'Add Friend'}</Text>
              </TouchableOpacity>
            </View>

            {incomingRequests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Friend Requests</Text>
                {incomingRequests.map((request: FriendRequest) => (
                  <View key={request.id} style={styles.requestRow}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>{request.fromDisplayName}</Text>
                      <Text style={styles.requestEmail}>{request.fromEmail}</Text>
                    </View>
                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => acceptRequest(request)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => declineRequest(request)}
                      >
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {outgoingRequests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending</Text>
                {outgoingRequests.map((request: FriendRequest) => (
                  <View key={request.id} style={styles.requestRow}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>{request.toDisplayName}</Text>
                      <Text style={styles.requestEmail}>Request sent</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
            </View>
          </>
        }
        renderItem={({ item }: { item: Friend }) => (
          <TouchableOpacity style={styles.friendRow} onLongPress={() => handleRemoveFriend(item)}>
            <View>
              <Text style={styles.friendName}>{item.displayName}</Text>
              <Text style={styles.friendEmail}>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No friends yet. Search by email to add one.</Text>
        }
      />
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 50,
  },
  scrollContent: {
    padding: 16,
  },
  searchSection: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  requestEmail: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  acceptButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  declineButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  friendRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  friendEmail: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 14,
    marginTop: 16,
  },
});
