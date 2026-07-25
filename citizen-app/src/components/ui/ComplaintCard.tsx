import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Complaint, STATUS_CONFIG, ISSUE_CATEGORIES } from '../../types';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '../../constants/theme';

interface ComplaintCardProps {
  complaint: Complaint;
  onPress: () => void;
  style?: ViewStyle;
  showDistance?: boolean;
  distance?: number;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  onPress,
  style,
  showDistance,
  distance,
}) => {
  const statusKey = (complaint?.status?.toLowerCase() || 'submitted') as keyof typeof STATUS_CONFIG;
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG['submitted'];
  const categoryInfo = ISSUE_CATEGORIES.find(c => c.value === complaint.category);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const locationText =
    complaint?.address ||
    complaint?.landmark ||
    (complaint as any)?.location?.area ||
    (complaint as any)?.location?.address ||
    'Municipal Ward Area';

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {complaint.imageUri ? (
          <Image source={{ uri: complaint.imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={32} color={Colors.textLight} />
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryIcon}>{categoryInfo?.icon || '📋'}</Text>
            <Text style={styles.category}>{categoryInfo?.label || complaint.category}</Text>
          </View>
          <Text style={styles.date}>{formatDate(complaint.createdAt)}</Text>
        </View>

        <Text style={styles.location} numberOfLines={1}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          {' '}{locationText}
        </Text>

        {complaint.description && (
          <Text style={styles.description} numberOfLines={2}>
            {complaint.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.statText}>{complaint.supporterCount || 1}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="arrow-up-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.statText}>{complaint.upvotes || 0}</Text>
            </View>
          </View>

          {showDistance && distance !== undefined && (
            <Text style={styles.distance}>{formatDistance(distance)}</Text>
          )}

          <Text style={styles.complaintId}>#{String(complaint.id || '').slice(-6)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: Colors.backgroundSecondary,
    justify: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  category: {
    fontSize: FontSizes.bodyBold,
    fontWeight: '600',
    color: Colors.text,
  },
  date: {
    fontSize: FontSizes.caption,
    color: Colors.textLight,
  },
  location: {
    fontSize: FontSizes.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSizes.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
  },
  distance: {
    fontSize: FontSizes.caption,
    color: Colors.primary,
    fontWeight: '500',
  },
  complaintId: {
    fontSize: FontSizes.caption,
    color: Colors.textLight,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
