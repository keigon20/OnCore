import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import { storage } from './firebase';

export function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('ph://');
}

export async function uploadEventImage(localUri: string, userId: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const filename = `${Date.now()}.jpg`;
  const storageRef = ref(storage, `events/${userId}/${filename}`);

  await uploadBytes(storageRef, byteArray, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
}
