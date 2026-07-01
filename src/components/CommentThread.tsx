import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../theme';
import { EventComment, ReportReason } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCommentThread } from '../hooks/useCommentThread';
import { submitReport } from '../utils/reports';
import ReportModal from './ReportModal';

interface CommentThreadProps {
  eventId: string;
  comment: EventComment;
  onDeleteComment: () => void;
  isPostOwner?: boolean;
  eventOwnerId?: string;
  eventTitle?: string;
}

type ReportTarget = { type: 'comment' | 'reply'; id: string; userId: string };

export default function CommentThread({ eventId, comment, onDeleteComment, isPostOwner = false, eventOwnerId, eventTitle }: CommentThreadProps) {
  const { user } = useAuth();
  const { likeCount, isLikedByMe, toggleLike, replies, addReply, deleteReply } = useCommentThread(eventId, comment.id, comment.userId, eventOwnerId, eventTitle);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    await addReply(replyText);
    setReplyText('');
    setShowReplyInput(false);
  };

  const handleCommentLongPress = () => {
    const isOwnComment = comment.userId === user?.id;
    if (isOwnComment) {
      Alert.alert('Comment', undefined, [
        { text: 'Delete', style: 'destructive', onPress: onDeleteComment },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else if (isPostOwner) {
      Alert.alert('Comment', undefined, [
        { text: 'Delete', style: 'destructive', onPress: onDeleteComment },
        { text: 'Report', onPress: () => setReportTarget({ type: 'comment', id: comment.id, userId: comment.userId }) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      Alert.alert('Comment', undefined, [
        { text: 'Report', onPress: () => setReportTarget({ type: 'comment', id: comment.id, userId: comment.userId }) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleReplyLongPress = (reply: EventComment) => {
    const isOwnReply = reply.userId === user?.id;
    if (isOwnReply) {
      Alert.alert('Reply', undefined, [
        { text: 'Delete', style: 'destructive', onPress: () => deleteReply(reply.id) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else if (isPostOwner) {
      Alert.alert('Reply', undefined, [
        { text: 'Delete', style: 'destructive', onPress: () => deleteReply(reply.id) },
        { text: 'Report', onPress: () => setReportTarget({ type: 'reply', id: reply.id, userId: reply.userId }) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      Alert.alert('Reply', undefined, [
        { text: 'Report', onPress: () => setReportTarget({ type: 'reply', id: reply.id, userId: reply.userId }) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleSubmitReport = async (reason: ReportReason, details: string) => {
    if (!user || !reportTarget) return;
    await submitReport(user.id, {
      reportedUserId: reportTarget.userId,
      contentType: reportTarget.type,
      eventId,
      commentId: reportTarget.type === 'comment' ? reportTarget.id : comment.id,
      replyId: reportTarget.type === 'reply' ? reportTarget.id : undefined,
      reason,
      details,
    });
    setReportTarget(null);
    Alert.alert('Report submitted', 'Thank you for letting us know.');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.commentRow} onLongPress={handleCommentLongPress}>
        <Text style={styles.author}>{comment.displayName}</Text>
        <Text style={styles.text}>{comment.text}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={toggleLike}>
            <Text style={[styles.actionText, isLikedByMe && styles.actionTextActive]}>
              {isLikedByMe ? 'Liked' : 'Like'}{likeCount > 0 ? ` (${likeCount})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowReplyInput(v => !v)}>
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {replies.map(reply => (
            <TouchableOpacity
              key={reply.id}
              style={styles.replyRow}
              onLongPress={() => handleReplyLongPress(reply)}
            >
              <Text style={styles.author}>{reply.displayName}</Text>
              <Text style={styles.text}>{reply.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showReplyInput && (
        <View style={styles.replyInputRow}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor={colors.textTertiary}
            value={replyText}
            onChangeText={setReplyText}
            onSubmitEditing={handleSendReply}
            autoFocus
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendReply}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      <ReportModal
        visible={!!reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={handleSubmitReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  commentRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionTextActive: {
    color: colors.accent,
  },
  repliesContainer: {
    marginLeft: 20,
    marginTop: 6,
    gap: 6,
  },
  replyRow: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 10,
  },
  replyInputRow: {
    flexDirection: 'row',
    marginLeft: 20,
    marginTop: 6,
  },
  replyInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: colors.textPrimary,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});
