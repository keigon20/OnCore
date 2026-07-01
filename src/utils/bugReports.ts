import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from './firebase';
import { APP_VARIANT } from '../config/env';

export async function submitBugReport(userId: string, description: string): Promise<void> {
  await addDoc(collection(db, 'bugReports'), {
    userId,
    description,
    platform: Platform.OS,
    platformVersion: String(Platform.Version),
    appVariant: APP_VARIANT,
    status: 'open',
    createdAt: serverTimestamp(),
  });
}
