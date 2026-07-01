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
import { writeNotification } from '../utils/notifications';

export function useEventSocial(eventId: string, eventOwnerId?: string, eventTitle?: string) {
  const { user } = useAuth();
  const [likes, setLikes] = useState<EventLike[]>([]);
  const [comments, setComments] = useState<EventComment[]>([]);

  useEffect(() => {
    const likesUnsub = onSnapshot(
      collection(db, 'events', eventId, 'likes'),
      snapshot => setLikes(snapshot.docs.map(d => ({
        userId: d.data().userId,
        displayName: d.data().displayName || 'Someone',
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })))
    );

    const commentsQuery = query(
      collection(db, 'events', eventId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const commentsUnsub = onSnapshot(commentsQuery, snapshot => {
      setComments(snapshot.docs.map(d => ({
        id: d.id,
        userId: d.data().userId,
        displayName: d.data().displayName,
        text: d.data().text,
        createdAt: d.data().createdAt?.toDate() || new Date(),
      })));
    });

    return () => {
      likesUnsub();
      commentsUnsub();
    };
  }, [eventId]);

  const isLikedByMe = !!user && likes.some(l => l.userId === user.id);

  const toggleLike = async () => {
    if (!user) return;
    const likeRef = doc(db, 'events', eventId, 'likes', user.id);
    if (isLikedByMe) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, { userId: user.id, displayName: user.displayName, createdAt: serverTimestamp() });
      if (eventOwnerId && eventOwnerId !== user.id) {
        writeNotification(eventOwnerId, {
          type: 'event_like',
          fromUserId: user.id,
          fromDisplayName: user.displayName,
          eventId,
          eventTitle,
          eventOwnerId,
        }).catch(console.error);
      }
    }
  };

  const addComment = async (text: string) => {
    if (!user || !text.trim()) return;
    await addDoc(collection(db, 'events', eventId, 'comments'), {
      userId: user.id,
      displayName: user.displayName,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
    if (eventOwnerId && eventOwnerId !== user.id) {
      writeNotification(eventOwnerId, {
        type: 'event_comment',
        fromUserId: user.id,
        fromDisplayName: user.displayName,
        eventId,
        eventTitle,
        eventOwnerId,
      }).catch(console.error);
    }
  };

  const deleteComment = async (commentId: string) => {
    await deleteDoc(doc(db, 'events', eventId, 'comments', commentId));
  };

  return {
    likes,
    likeCount: likes.length,
    isLikedByMe,
    toggleLike,
    comments,
    commentCount: comments.length,
    addComment,
    deleteComment,
  };
}
