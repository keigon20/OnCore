import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { ReportReason } from '../types';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => Promise<void>;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or abuse' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

export default function ReportModal({ visible, onClose, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setReason(null);
    setDetails('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason) return;
    setIsSubmitting(true);
    await onSubmit(reason, details);
    setIsSubmitting(false);
    setReason(null);
    setDetails('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Report</Text>

          {REASONS.map(r => (
            <TouchableOpacity
              key={r.value}
              style={[styles.reasonRow, reason === r.value && styles.reasonRowSelected]}
              onPress={() => setReason(r.value)}
            >
              <Text style={[styles.reasonText, reason === r.value && styles.reasonTextSelected]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={styles.detailsInput}
            placeholder="Additional details (optional)"
            placeholderTextColor={colors.textTertiary}
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose} disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, !reason && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!reason || isSubmitting}
            >
              <Text style={styles.submitButtonText}>{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  reasonRow: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonRowSelected: {
    borderColor: colors.accent,
  },
  reasonText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  reasonTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  detailsInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 16,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: colors.surfaceAlt,
  },
  cancelButtonText: {
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.destructive,
  },
  submitButtonDisabled: {
    backgroundColor: colors.surfaceAlt,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
