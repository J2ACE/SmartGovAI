import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';
import { ComplaintCard, Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useComplaints } from '../../contexts/ComplaintContext';
import { STATUS_CONFIG, ComplaintStatus } from '../../types';

export default function HomeScreen() {
  const { user } = useAuth();
  const { complaints, fetchMyComplaints, isLoading } = useComplaints();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyComplaints();
    setRefreshing(false);
  };

  // Get stats
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const activeComplaints = complaints.filter(c => !['resolved', 'closed', 'rejected'].includes(c.status)).length;
  const recentComplaints = complaints.slice(0, 3);

  // Get status distribution
  const statusDistribution: Record<ComplaintStatus, number> = {
    submitted: 0,
    verified: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
    closed: 0,
  };
  complaints.forEach(c => {
    statusDistribution[c.status]++;
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Citizen'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(tabs)/notifications' as any)}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Report Button */}
        <TouchableOpacity
          style={styles.reportCard}
          onPress={() => router.push('/(report)/camera' as any)}
          activeOpacity={0.9}
        >
          <View style={styles.reportCardContent}>
            <View style={styles.reportCardIcon}>
              <Ionicons name="camera" size={32} color="white" />
            </View>
            <View style={styles.reportCardText}>
              <Text style={styles.reportCardTitle}>Report an Issue</Text>
              <Text style={styles.reportCardSubtitle}>
                Capture and report civic problems instantly
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={32} color="white" />
        </TouchableOpacity>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: Colors.primaryLight + '20' }]}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{totalComplaints}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.successLight + '20' }]}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{resolvedComplaints}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.warningLight + '20' }]}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>{activeComplaints}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* Reward Points */}
        <View style={styles.rewardCard}>
          <View style={styles.rewardIcon}>
            <Ionicons name="star" size={24} color={Colors.warning} />
          </View>
          <View style={styles.rewardContent}>
            <Text style={styles.rewardPoints}>{user?.rewardPoints || 0} Points</Text>
            <Text style={styles.rewardText}>Keep reporting to earn more!</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.rewardLink}>Redeem</Text>
          </TouchableOpacity>
        </View>

        {/* Status Overview */}
        {totalComplaints > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Overview</Text>
            <View style={styles.statusOverview}>
              {Object.entries(statusDistribution)
                .filter(([_, count]) => count > 0)
                .map(([status, count]) => {
                  const config = STATUS_CONFIG[status as ComplaintStatus];
                  return (
                    <View key={status} style={styles.statusItem}>
                      <View style={[styles.statusDot, { backgroundColor: config.color }]} />
                      <Text style={styles.statusName}>{config.label}</Text>
                      <Text style={styles.statusCount}>{count}</Text>
                    </View>
                  );
                })}
            </View>
          </View>
        )}

        {/* Recent Complaints */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            {recentComplaints.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/complaints' as any)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentComplaints.length > 0 ? (
            recentComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/complaints/[id]' as any,
                    params: { id: complaint.id },
                  })
                }
                style={styles.complaintCard}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>No reports yet</Text>
              <Text style={styles.emptySubtext}>
                Report your first issue to see it here
              </Text>
            </View>
          )}
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipText}>
            • Take clear photos of the issue{'\n'}
            • Ensure good lighting for better visibility{'\n'}
            • Be specific in your description{'\n'}
            • Check for similar reports nearby
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {},
  greeting: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Shadows.small,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  reportCard: {
    backgroundColor: Colors.primary,
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.large,
  },
  reportCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  reportCardText: {
    flex: 1,
  },
  reportCardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  reportCardSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  rewardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.warningLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rewardContent: {
    flex: 1,
  },
  rewardPoints: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  rewardText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  rewardLink: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  statusOverview: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  statusName: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  statusCount: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  complaintCard: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  tipsCard: {
    backgroundColor: Colors.infoLight + '20',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  tipsTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
