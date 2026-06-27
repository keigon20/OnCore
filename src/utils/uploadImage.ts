import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://');
}

export async function uploadEventImage(localUri: string, userId: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const filename = `${Date.now()}.jpg`;
  const storageRef = ref(storage, `events/${userId}/${filename}`);

  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
