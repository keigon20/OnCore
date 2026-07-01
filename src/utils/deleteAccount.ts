import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

async function deleteAllDocs(snapshotDocs: { ref: any }[]): Promise<void> {
  await Promise.all(snapshotDocs.map(d => deleteDoc(d.ref)));
}

async function deleteSubcollection(first: string, ...rest: string[]): Promise<void> {
  const snap = await getDocs(collection(db, first, ...rest));
  await deleteAllDocs(snap.docs);
}

// Deletes everything a user owns, ahead of removing their auth account: their
// own events (and those events' comments/replies/likes subcollections), then
// their social graph, then their profile doc.
//
// Known limitation: comments/replies/likes this user left on OTHER people's
// events are not cleaned up here. Firestore can't safely evaluate a
// collectionGroup query's security rule when it depends on a get() lookup
// keyed off a per-document path variable (eventId varies across every match),
// so that scan gets denied outright regardless of which documents would
// actually satisfy the rule. Doing this properly would need either a
// denormalized "my content" index under users/{userId}, or moving deletion
// server-side via a Cloud Function with the Admin SDK.
export async function deleteAllUserData(userId: string): Promise<void> {
  console.log('[deleteAllUserData] step: query own events');
  const ownEvents = await getDocs(query(collection(db, 'events'), where('userId', '==', userId)));
  console.log('[deleteAllUserData] step: own events count', ownEvents.docs.length);
  for (const eventDoc of ownEvents.docs) {
    const eventId = eventDoc.id;
    console.log('[deleteAllUserData] step: query comments for event', eventId);
    const commentsSnap = await getDocs(collection(db, 'events', eventId, 'comments'));
    for (const commentDoc of commentsSnap.docs) {
      console.log('[deleteAllUserData] step: delete replies for comment', eventId, commentDoc.id);
      await deleteSubcollection('events', eventId, 'comments', commentDoc.id, 'replies');
      console.log('[deleteAllUserData] step: delete likes for comment', eventId, commentDoc.id);
      await deleteSubcollection('events', eventId, 'comments', commentDoc.id, 'likes');
      console.log('[deleteAllUserData] step: delete comment doc', eventId, commentDoc.id);
      await deleteDoc(commentDoc.ref);
    }
    console.log('[deleteAllUserData] step: delete event likes', eventId);
    await deleteSubcollection('events', eventId, 'likes');
    console.log('[deleteAllUserData] step: delete event doc', eventId);
    await deleteDoc(eventDoc.ref);
  }

  console.log('[deleteAllUserData] step: query own friends');
  const ownFriends = await getDocs(collection(db, 'users', userId, 'friends'));
  for (const friendDoc of ownFriends.docs) {
    console.log('[deleteAllUserData] step: remove reciprocal friend doc', friendDoc.id);
    await deleteDoc(doc(db, 'users', friendDoc.id, 'friends', userId)).catch(err => {
      console.log('[deleteAllUserData] reciprocal friend delete failed (continuing):', friendDoc.id, err?.code);
    });
    console.log('[deleteAllUserData] step: remove own friend doc', friendDoc.id);
    await deleteDoc(friendDoc.ref);
  }

  console.log('[deleteAllUserData] step: query friend requests');
  const outgoingRequests = await getDocs(query(collection(db, 'friendRequests'), where('fromUserId', '==', userId)));
  const incomingRequests = await getDocs(query(collection(db, 'friendRequests'), where('toUserId', '==', userId)));
  console.log('[deleteAllUserData] step: delete friend requests', outgoingRequests.docs.length, incomingRequests.docs.length);
  await deleteAllDocs([...outgoingRequests.docs, ...incomingRequests.docs]);

  console.log('[deleteAllUserData] step: delete blockedUsers');
  await deleteSubcollection('users', userId, 'blockedUsers');

  console.log('[deleteAllUserData] step: delete user profile doc');
  await deleteDoc(doc(db, 'users', userId));

  console.log('[deleteAllUserData] done');
}
