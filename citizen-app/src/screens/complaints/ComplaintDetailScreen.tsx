import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';
import { Button, StatusTimeline } from '../../components/ui';
import { Complaint, STATUS_CONFIG, ISSUE_CATEGORIES, SEVERITY_CONFIG } from '../../types';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ComplaintDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { fetchComplaintById, upvoteComplaint, submitFeedback } = useComplaints();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const loadComplaint = async () => {
    if (!id) return;
    setIsLoading(true);
    const data = await fetchComplaintById(id);
    setComplaint(data);
    setIsLoading(false);
  };

  const handleUpvote = async () => {
    if (!complaint || !user) return;
    
    // Check if user has already upvoted
    if (complaint.upvotedBy?.includes(user.id)) {
      Alert.alert(t('complaints.upvoted'), 'You have already upvoted this complaint');
      return;
    }

    setIsUpvoting(true);
    const success = await upvoteComplaint(complaint.id);
    if (success) {
      setComplaint({ 
        ...complaint, 
        upvotes: complaint.upvotes + 1,
        upvotedBy: [...(complaint.upvotedBy || []), user.id]
      });
    }
    setIsUpvoting(false);
  };

  const handleShare = async () => {
    if (!complaint) return;
    
    const categoryLabel = ISSUE_CATEGORIES.find(c => c.value === complaint.category)?.label;
    const statusLabel = STATUS_CONFIG[complaint.status].label;
    
    try {
      await Share.share({
        message: `${t('complaints.complaintDetail')}\n\n` +
          `${t('complaints.category')}: ${categoryLabel}\n` +
          `${t('complaints.status')}: ${statusLabel}\n` +
          `${t('complaints.location')}: ${complaint.location.address}\n` +
          `${t('complaints.description')}: ${complaint.description}\n\n` +
          `Track this issue: reportapp://complaints/${complaint.id}`,
        title: `${categoryLabel} - ${t('complaints.complaintDetail')}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFeedback = async (satisfied: boolean) => {
    if (!complaint) return;
    
    Alert.prompt(
      satisfied ? 'Great!' : 'Sorry to hear that',
      satisfied
        ? 'Would you like to leave any additional comments?'
        : 'Please tell us what went wrong',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async (comment?: string) => {
            const success = await submitFeedback(
              complaint.id,
              satisfied,
              comment || undefined,
              satisfied ? 5 : 1
            );
            if (success) {
              setComplaint({
                ...complaint,
                feedback: { satisfied, comment },
                status: 'closed',
              });
              Alert.alert('Thank you!', 'Your feedback has been submitted.');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading complaint...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!complaint) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorText}>Complaint not found</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[complaint.status];
  const categoryInfo = ISSUE_CATEGORIES.find((c) => c.value === complaint.category);
  const severityConfig = complaint.severity ? SEVERITY_CONFIG[complaint.severity] : null;
  const isResolved = complaint.status === 'resolved';
  const isClosed = complaint.status === 'closed';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageGallery}
        >
          {[complaint.imageUri, ...complaint.afterImages].map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              {index === 0 && complaint.afterImages.length > 0 && (
                <View style={styles.imageBadge}>
                  <Text style={styles.imageBadgeText}>Before</Text>
                </View>
              )}
              {index > 0 && (
                <View style={[styles.imageBadge, { backgroundColor: Colors.success }]}>
                  <Text style={styles.imageBadgeText}>After</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.bgColor }]}>
          <View style={styles.statusContent}>
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
            <Text style={styles.complaintId}>#{complaint.id.slice(-6)}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          {/* Category & Severity */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryIcon}>{categoryInfo?.icon}</Text>
              <Text style={styles.categoryText}>{categoryInfo?.label}</Text>
            </View>
            {severityConfig && (
              <View style={[styles.severityBadge, { backgroundColor: severityConfig.color + '20' }]}>
                <Text style={[styles.severityText, { color: severityConfig.color }]}>
                  {severityConfig.label} Severity
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {complaint.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{complaint.description}</Text>
            </View>
          )}

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color={Colors.primary} />
              <Text style={styles.locationText}>
                {complaint.location.address || complaint.location.area || 'Location captured'}
              </Text>
            </View>
            {complaint.location.city && (
              <Text style={styles.locationSubtext}>
                {[complaint.location.area, complaint.location.city, complaint.location.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={handleUpvote}
              disabled={isUpvoting}
            >
              <Ionicons 
                name={complaint.upvotedBy?.includes(user?.id || '') ? "arrow-up-circle" : "arrow-up-circle-outline"} 
                size={24} 
                color={complaint.upvotedBy?.includes(user?.id || '') ? Colors.success : Colors.primary} 
              />
              <Text style={styles.statValue}>{complaint.upvotes}</Text>
              <Text style={styles.statLabel}>
                {complaint.upvotedBy?.includes(user?.id || '') ? t('complaints.upvoted') : t('complaints.upvote')}
              </Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color={Colors.secondary} />
              <Text style={styles.statValue}>{complaint.supporterCount}</Text>
              <Text style={styles.statLabel}>Supporters</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color={Colors.warning} />
              <Text style={styles.statValue}>
                {Math.ceil(
                  (Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                )}
              </Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Timeline</Text>
          <StatusTimeline statusHistory={complaint.statusHistory} />
        </View>

        {/* Worker Notes */}
        {complaint.workerNotes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Worker Notes</Text>
            <Text style={styles.workerNotes}>{complaint.workerNotes}</Text>
          </View>
        )}

        {/* Feedback Section */}
        {isResolved && !complaint.feedback && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>Was this issue resolved satisfactorily?</Text>
            <Text style={styles.feedbackText}>
              Your feedback helps us improve our services
            </Text>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity
                style={[styles.feedbackButton, styles.feedbackPositive]}
                onPress={() => handleFeedback(true)}
              >
                <Ionicons name="thumbs-up" size={24} color={Colors.success} />
                <Text style={styles.feedbackButtonText}>Satisfied</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.feedbackButton, styles.feedbackNegative]}
                onPress={() => handleFeedback(false)}
              >
                <Ionicons name="thumbs-down" size={24} color={Colors.error} />
                <Text style={styles.feedbackButtonText}>Not Satisfied</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Existing Feedback */}
        {complaint.feedback && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Feedback</Text>
            <View style={styles.feedbackResult}>
              <Ionicons
                name={complaint.feedback.satisfied ? 'checkmark-circle' : 'close-circle'}
                size={32}
                color={complaint.feedback.satisfied ? Colors.success : Colors.error}
              />
              <Text style={styles.feedbackResultText}>
                {complaint.feedback.satisfied ? 'Satisfied with resolution' : 'Not satisfied'}
              </Text>
            </View>
            {complaint.feedback.comment && (
              <Text style={styles.feedbackComment}>{complaint.feedback.comment}</Text>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      {!isClosed && (
        <View style={styles.bottomAction}>
          <Button
            title="Upvote This Issue"
            onPress={handleUpvote}
            loading={isUpvoting}
            fullWidth
            icon={<Ionicons name="arrow-up" size={18} color="white" />}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  imageGallery: {
    height: 250,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.background,
  },
  imageBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.text,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  imageBadgeText: {
    color: 'white',
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  statusBanner: {
    padding: Spacing.md,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  complaintId: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    marginBottom: 0,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.small,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryIcon: {
    fontSize: FontSizes.lg,
    marginRight: Spacing.xs,
  },
  categoryText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.text,
  },
  severityBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  severityText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    flex: 1,
  },
  locationSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginLeft: Spacing.lg + Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  workerNotes: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 22,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  feedbackCard: {
    backgroundColor: Colors.primaryLight + '20',
    margin: Spacing.md,
    marginBottom: 0,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  feedbackText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  feedbackPositive: {
    backgroundColor: Colors.successLight + '30',
  },
  feedbackNegative: {
    backgroundColor: Colors.errorLight + '30',
  },
  feedbackButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.text,
  },
  feedbackResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  feedbackResultText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  feedbackComment: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.medium,
  },
});
