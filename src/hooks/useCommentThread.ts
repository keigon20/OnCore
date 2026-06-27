import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  deleteDoc,
  setDoc,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { EventComment, EventLike } from '../types';

export function useCommentThread(eventId: string, commentId: string) {
  const { user } = useAuth();
  const [likes, setLikes] = useState<EventLike[]>([]);
  const [replies, setReplies] = useState<EventComment[]>([]);

  const commentPath = ['events', eventId, 'comments', commentId] as const;

  useEffect(() => {
    const likesUnsub = onSnapshot(
      collection(db, ...commentPath, 'likes'),
      snapshot => setLikes(snapshot.docs.map(d => ({
        userId: d.data().userId,
        displayName: d.data().displayName || 'Someone',
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })))
    );

    const repliesQuery = query(
      collection(db, ...commentPath, 'replies'),
      orderBy('createdAt', 'asc')
    );
    const repliesUnsub = onSnapshot(repliesQuery, snapshot => {
      setReplies(snapshot.docs.map(d => ({
        id: d.id,
        userId: d.data().userId,
        displayName: d.data().displayName,
        text: d.data().text,
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })));
    });

    return () => {
      likesUnsub();
      repliesUnsub();
    };
  }, [eventId, commentId]);

  const isLikedByMe = !!user && likes.some(l => l.userId === user.id);

  const toggleLike = async () => {
    if (!user) return;
    const likeRef = doc(db, ...commentPath, 'likes', user.id);
    if (isLikedByMe) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, { userId: user.id, displayName: user.displayName, createdAt: serverTimestamp() });
    }
  };

  const addReply = async (text: string) => {
    if (!user || !text.trim()) return;
    await addDoc(collection(db, ...commentPath, 'replies'), {
      userId: user.id,
      displayName: user.displayName,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
  };

  const deleteReply = async (replyId: string) => {
    await deleteDoc(doc(db, ...commentPath, 'replies', replyId));
  };

  return {
    likeCount: likes.length,
    isLikedByMe,
    toggleLike,
    replies,
    addReply,
    deleteReply,
  };
}
