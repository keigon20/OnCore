import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { EventComment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useCommentThread } from '../hooks/useCommentThread';

interface CommentThreadProps {
  eventId: string;
  comment: EventComment;
  onDeleteComment: () => void;
}

export default function CommentThread({ eventId, comment, onDeleteComment }: CommentThreadProps) {
  const { user } = useAuth();
  const { likeCount, isLikedByMe, toggleLike, replies, addReply, deleteReply } = useCommentThread(eventId, comment.id);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    await addReply(replyText);
    setReplyText('');
    setShowReplyInput(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.commentRow}
        onLongPress={() => {
          if (comment.userId === user?.id) onDeleteComment();
        }}
      >
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
              onLongPress={() => {
                if (reply.userId === user?.id) deleteReply(reply.id);
              }}
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
