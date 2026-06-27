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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from './AuthContext';
import { Friend, FriendRequest } from '../types';

interface FoundUser {
  id: string;
  email: string;
  displayName: string;
}

interface FriendsContextType {
  friends: Friend[];
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  searchUserByEmail: (email: string) => Promise<FoundUser | null>;
  sendFriendRequest: (toUser: FoundUser) => Promise<void>;
  acceptRequest: (request: FriendRequest) => Promise<void>;
  declineRequest: (request: FriendRequest) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
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

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setFriends([]);
      setIncomingRequests([]);
      setOutgoingRequests([]);
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

    return () => {
      friendsUnsub();
      incomingUnsub();
      outgoingUnsub();
    };
  }, [isAuthenticated, user]);

  const searchUserByEmail = async (email: string): Promise<FoundUser | null> => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || normalized === user?.email?.toLowerCase()) return null;

    const q = query(collection(db, 'users'), where('email', '==', normalized));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const found = snapshot.docs[0];
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
  };

  const acceptRequest = async (request: FriendRequest) => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.id, 'friends', request.fromUserId), {
      displayName: request.fromDisplayName,
      email: request.fromEmail,
      addedAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'users', request.fromUserId, 'friends', user.id), {
      displayName: user.displayName,
      email: user.email,
      addedAt: serverTimestamp(),
    });
    await deleteDoc(doc(db, 'friendRequests', request.id));
  };

  const declineRequest = async (request: FriendRequest) => {
    await deleteDoc(doc(db, 'friendRequests', request.id));
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.id, 'friends', friendId));
    await deleteDoc(doc(db, 'users', friendId, 'friends', user.id));
  };

  const value: FriendsContextType = {
    friends,
    incomingRequests,
    outgoingRequests,
    searchUserByEmail,
    sendFriendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  };

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  );
}
