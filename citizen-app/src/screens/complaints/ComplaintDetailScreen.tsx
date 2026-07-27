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
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';
import { Button, StatusTimeline } from '../../components/ui';
import { Complaint, STATUS_CONFIG, ISSUE_CATEGORIES, SEVERITY_CONFIG } from '../../types';
import { useComplaints } from '../../contexts/ComplaintContext';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ComplaintDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const params = (route.params || {}) as { id?: string };
  const id = params.id;
  const { user } = useAuth();
  const { fetchComplaintById, upvoteComplaint, submitFeedback, deleteComplaint } = useComplaints();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentUserId = user?.id || 'current-citizen';
  const hasUpvoted = Boolean(complaint?.upvotedBy?.includes(currentUserId));

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

  const handleDelete = () => {
    if (!complaint) return;

    Alert.alert(
      'Delete Complaint',
      'Are you sure you want to delete this complaint? It will be removed from your account and database.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const success = await deleteComplaint(complaint.id);
            setIsDeleting(false);
            if (success) {
              Alert.alert('Deleted', 'Complaint deleted successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } else {
              Alert.alert('Error', 'Failed to delete complaint. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUpvote = async () => {
    if (!complaint) return;
    
    if (hasUpvoted) {
      Alert.alert('Already Upvoted', 'You have already upvoted this complaint.');
      return;
    }

    setIsUpvoting(true);
    const success = await upvoteComplaint(complaint.id);
    setIsUpvoting(false);

    if (success) {
      const updatedUpvotes = (complaint.upvotes || 0) + 1;
      const updatedUpvotedBy = [...(complaint.upvotedBy || []), currentUserId];
      setComplaint({ 
        ...complaint, 
        upvotes: updatedUpvotes,
        upvotedBy: updatedUpvotedBy,
        supporterCount: updatedUpvotes,
      });

      Alert.alert(
        '👍 Upvoted Successfully!',
        `Your vote for complaint #${complaint.id.slice(0, 8).toUpperCase()} has been registered. Total votes: ${updatedUpvotes}`
      );
    } else {
      Alert.alert('Error', 'Failed to upvote complaint. Please try again.');
    }
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
    const success = await submitFeedback(
      complaint.id,
      satisfied,
      satisfied ? 'Satisfied with resolution' : 'Needs attention',
      satisfied ? 5 : 1
    );
    if (success) {
      setComplaint({
        ...complaint,
        feedback: { satisfied, comment: satisfied ? 'Satisfied with resolution' : 'Needs attention' },
        status: 'closed',
      });
      Alert.alert('Thank you!', 'Your feedback has been submitted.');
    }
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
          <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" />
        </View>
      </SafeAreaView>
    );
  }

  const statusKey = (complaint.status?.toLowerCase() || 'submitted') as keyof typeof STATUS_CONFIG;
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG['submitted'];
  const categoryInfo = ISSUE_CATEGORIES.find((c) => c.value === complaint.category);
  const severityKey = complaint.severity?.toLowerCase() as SeverityLevel;
  const severityConfig = severityKey && SEVERITY_CONFIG[severityKey] ? SEVERITY_CONFIG[severityKey] : null;
  const isResolved = complaint.status === 'resolved';
  const isClosed = complaint.status === 'closed';

  const afterImages = complaint.afterImages || [];
  const galleryImages = [complaint.imageUri, ...afterImages].filter(Boolean);
  const locationAddress = complaint.location?.address || complaint.location?.area || (complaint as any)?.address || (complaint as any)?.landmark || 'Municipal Ward Area';
  const locationCity = complaint.location?.city || '';
  const locationSubtext = [complaint.location?.area, locationCity, complaint.location?.pincode].filter(Boolean).join(', ');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Details</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <Ionicons name="trash-outline" size={22} color={Colors.error} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageGallery}
        >
          {galleryImages.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              {index === 0 && afterImages.length > 0 && (
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
            <Text style={styles.complaintId}>#{complaint.id ? complaint.id.slice(-6) : '000000'}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          {/* Category & Severity */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryIcon}>{categoryInfo?.icon || '📋'}</Text>
              <Text style={styles.categoryText}>{categoryInfo?.label || 'Civic Issue'}</Text>
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
              <Text style={styles.locationText}>{locationAddress}</Text>
            </View>
            {locationSubtext ? (
              <Text style={styles.locationSubtext}>{locationSubtext}</Text>
            ) : null}
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
              <Text style={styles.statValue}>{complaint.upvotes || 0}</Text>
              <Text style={styles.statLabel}>
                {complaint.upvotedBy?.includes(user?.id || '') ? t('complaints.upvoted') : t('complaints.upvote')}
              </Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color={Colors.secondary} />
              <Text style={styles.statValue}>{complaint.supporterCount || 1}</Text>
              <Text style={styles.statLabel}>Supporters</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color={Colors.warning} />
              <Text style={styles.statValue}>
                {Math.ceil(
                  (Date.now() - new Date(complaint.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
                ) || 1}
              </Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Timeline</Text>
          <StatusTimeline statusHistory={complaint.statusHistory || []} />
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
        <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[
              styles.primaryActionButton,
              hasUpvoted && { backgroundColor: Colors.success },
              (isUpvoting || hasUpvoted) && { opacity: 0.9 },
            ]}
            onPress={handleUpvote}
            disabled={isUpvoting || hasUpvoted}
            activeOpacity={0.8}
          >
            {isUpvoting ? (
              <ActivityIndicator size="small" color="white" />
            ) : hasUpvoted ? (
              <View style={styles.buttonRow}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.primaryActionButtonText}>
                  ✓ Upvoted ({complaint?.upvotes || 1})
                </Text>
              </View>
            ) : (
              <View style={styles.buttonRow}>
                <Ionicons name="arrow-up" size={20} color="white" />
                <Text style={styles.primaryActionButtonText}>
                  Upvote This Issue ({complaint?.upvotes || 0})
                </Text>
              </View>
            )}
          </TouchableOpacity>
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
  primaryActionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  primaryActionButtonText: {
    color: 'white',
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    zIndex: 9999,
    elevation: 10,
    ...Shadows.medium,
  },
});
