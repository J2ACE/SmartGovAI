import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle } from 'react-native';
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
  const statusConfig = STATUS_CONFIG[complaint.status];
  const categoryInfo = ISSUE_CATEGORIES.find(c => c.value === complaint.category);

  const formatDate = (dateString: string) => {
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
          {' '}{complaint.location.area || complaint.location.address || 'Unknown location'}
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
              <Text style={styles.statText}>{complaint.supporterCount}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="arrow-up-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.statText}>{complaint.upvotes}</Text>
            </View>
          </View>

          {showDistance && distance !== undefined && (
            <Text style={styles.distance}>{formatDistance(distance)}</Text>
          )}

          <Text style={styles.complaintId}>#{complaint.id.slice(-6)}</Text>
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
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.background,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: FontSizes.lg,
    marginRight: Spacing.xs,
  },
  category: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  date: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  location: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  distance: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: '500',
  },
  complaintId: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
  },
});
