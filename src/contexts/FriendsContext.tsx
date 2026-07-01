import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  doc,
  deleteDoc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from './AuthContext';
import { BlockedUser, Friend, FriendRequest } from '../types';
import { writeNotification } from '../utils/notifications';

interface FoundUser {
  id: string;
  email: string;
  displayName: string;
}

interface FriendsContextType {
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  blockedUsers: BlockedUser[];
  searchUserByEmail: (email: string) => Promise<FoundUser | null>;
  sendFriendRequest: (toUser: FoundUser) => Promise<void>;
  acceptRequest: (request: FriendRequest) => Promise<void>;
  declineRequest: (request: FriendRequest) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  blockUser: (userId: string, displayName: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  isBlocked: (userId: string) => boolean;
  backfillDisplayName: (displayName: string) => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export function useFriends() {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
}

interface FriendsProviderProps {
  children: ReactNode;
}

export function FriendsProvider({ children }: FriendsProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setFriends([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setBlockedUsers([]);
      return;
    }

    const friendsUnsub = onSnapshot(
      collection(db, 'users', user.id, 'friends'),
      snapshot => {
        setFriends(snapshot.docs.map(d => ({
          id: d.id,
          displayName: d.data().displayName,
          email: d.data().email,
          addedAt: d.data().addedAt?.toDate() || new Date(),
        })));
      }
    );

    const incomingQuery = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', user.id),
      where('status', '==', 'pending')
    );
    const incomingUnsub = onSnapshot(incomingQuery, snapshot => {
      setIncomingRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest)));
    });

    const outgoingQuery = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', user.id),
      where('status', '==', 'pending')
    );
    const outgoingUnsub = onSnapshot(outgoingQuery, snapshot => {
      setOutgoingRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FriendRequest)));
    });

    const blockedUnsub = onSnapshot(
      collection(db, 'users', user.id, 'blockedUsers'),
      snapshot => {
        setBlockedUsers(snapshot.docs.map(d => ({
          id: d.id,
          displayName: d.data().displayName,
          blockedAt: d.data().blockedAt?.toDate() || new Date(),
        })));
      }
    );

    return () => {
      friendsUnsub();
      incomingUnsub();
      outgoingUnsub();
      blockedUnsub();
    };
  }, [isAuthenticated, user]);

  const searchUserByEmail = async (email: string): Promise<FoundUser | null> => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || normalized === user?.email?.toLowerCase()) return null;

    const q = query(collection(db, 'users'), where('email', '==', normalized));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const found = snapshot.docs[0];
    if (blockedUsers.some(b => b.id === found.id)) return null;
    return { id: found.id, email: found.data().email, displayName: found.data().displayName };
  };

  const sendFriendRequest = async (toUser: FoundUser) => {
    if (!user) return;
    const requestId = `${user.id}_${toUser.id}`;
    await setDoc(doc(db, 'friendRequests', requestId), {
      fromUserId: user.id,
      fromDisplayName: user.displayName,
      fromEmail: user.email,
      toUserId: toUser.id,
      toDisplayName: toUser.displayName,
      toEmail: toUser.email,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    writeNotification(toUser.id, {
      type: 'friend_request',
      fromUserId: user.id,
      fromDisplayName: user.displayName,
    }).catch(console.error);
  };

  const acceptRequest = async (request: FriendRequest) => {
    if (!user) return;
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', user.id, 'friends', request.fromUserId), {
      displayName: request.fromDisplayName,
      email: request.fromEmail,
      addedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'users', request.fromUserId, 'friends', user.id), {
      displayName: user.displayName,
      email: user.email,
      addedAt: serverTimestamp(),
    });
    batch.delete(doc(db, 'friendRequests', request.id));
    await batch.commit();
  };

  const declineRequest = async (request: FriendRequest) => {
    await deleteDoc(doc(db, 'friendRequests', request.id));
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', user.id, 'friends', friendId));
    batch.delete(doc(db, 'users', friendId, 'friends', user.id));
    await batch.commit();
  };

  const blockUser = async (userId: string, displayName: string) => {
    if (!user) return;
    const batch = writeBatch(db);
    batch.set(doc(db, 'users', user.id, 'blockedUsers', userId), {
      displayName,
      blockedAt: serverTimestamp(),
    });
    // Tear down any existing friendship both ways - you shouldn't stay friends
    // with someone you've just blocked, and this also removes their read
    // access to your events via the isFriendOf() rule check.
    batch.delete(doc(db, 'users', user.id, 'friends', userId));
    batch.delete(doc(db, 'users', userId, 'friends', user.id));
    // Friend request doc IDs are deterministic - clear out a pending request
    // in either direction, if one exists. Deleting a doc that doesn't exist
    // is a harmless no-op.
    batch.delete(doc(db, 'friendRequests', `${user.id}_${userId}`));
    batch.delete(doc(db, 'friendRequests', `${userId}_${user.id}`));
    await batch.commit();
  };

  const unblockUser = async (userId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.id, 'blockedUsers', userId));
  };

  const isBlocked = (userId: string) => blockedUsers.some(b => b.id === userId);

  const backfillDisplayName = async (displayName: string) => {
    if (!user || friends.length === 0) return;

    const BATCH_LIMIT = 500; // Firestore max operations per batch
    const friendIds = friends.map(f => f.id);

    for (let i = 0; i < friendIds.length; i += BATCH_LIMIT) {
      const chunk = friendIds.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);
      chunk.forEach(friendId => {
        batch.update(doc(db, 'users', friendId, 'friends', user.id), { displayName });
      });
      await batch.commit();
    }
  };

  const value: FriendsContextType = {
    friends,
    incomingRequests,
    outgoingRequests,
    blockedUsers,
    searchUserByEmail,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
    blockUser,
    unblockUser,
    isBlocked,
    backfillDisplayName,
  };

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  );
}
