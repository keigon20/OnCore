import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { ReportInput } from '../types';

export async function submitReport(reporterId: string, report: ReportInput): Promise<void> {
  await addDoc(collection(db, 'reports'), {
    reporterId,
    reportedUserId: report.reportedUserId,
    contentType: report.contentType,
    eventId: report.eventId,
    commentId: report.commentId,
    replyId: report.replyId,
    reason: report.reason,
    details: report.details || '',
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}
