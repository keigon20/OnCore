import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  getCountFromServer,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../contexts/AuthContext';
import { writeNotification } from '../utils/notifications';

// Lightweight, one-time fetch for feed cards - no live listeners, so just scrolling
// past a card doesn't open a subscription. Use useEventSocial instead once the user
// actually opens the comment thread and live updates are worth the listener cost.
export function useStaticEventSocial(eventId: string, eventOwnerId?: string, eventTitle?: string) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLikedByMe, setIsLikedByMe] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [likesSnap, commentsSnap, myLikeDoc] = await Promise.all([
        getCountFromServer(collection(db, 'events', eventId, 'likes')),
        getCountFromServer(collection(db, 'events', eventId, 'comments')),
        user ? getDoc(doc(db, 'events', eventId, 'likes', user.id)) : Promise.resolve(null),
      ]);

      if (cancelled) return;
      setLikeCount(likesSnap.data().count);
      setCommentCount(commentsSnap.data().count);
      setIsLikedByMe(!!myLikeDoc?.exists());
    };

    load().catch(err => console.error('[useStaticEventSocial] Failed to load counts:', err));

    return () => { cancelled = true; };
  }, [eventId, user]);

  const toggleLike = async () => {
    if (!user) return;
    const wasLiked = isLikedByMe;
    const likeRef = doc(db, 'events', eventId, 'likes', user.id);

    setIsLikedByMe(!wasLiked);
    setLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      if (wasLiked) {
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
    } catch (err) {
      console.error('[useStaticEventSocial] Failed to toggle like:', err);
      setIsLikedByMe(wasLiked);
      setLikeCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  return { likeCount, commentCount, isLikedByMe, toggleLike };
}
