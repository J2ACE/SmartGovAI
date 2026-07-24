import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../constants/theme';
import { ComplaintCard } from '../../components/ui';
import { useComplaints } from '../../contexts/ComplaintContext';
import { ComplaintStatus, STATUS_CONFIG } from '../../types';

type FilterType = 'all' | ComplaintStatus;

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'verified', label: 'Verified' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function ComplaintsListScreen() {
  const { complaints, isLoading, fetchMyComplaints } = useComplaints();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyComplaints();
    setRefreshing(false);
  };

  const filteredComplaints = complaints.filter((complaint) => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

  const handleComplaintPress = (complaintId: string) => {
    router.push({
      pathname: '/(tabs)/complaints/[id]' as any,
      params: { id: complaintId },
    });
  };

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTER_OPTIONS}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => {
          const isActive = filter === item.value;
          const statusConfig = item.value !== 'all' ? STATUS_CONFIG[item.value as ComplaintStatus] : null;
          
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                isActive && styles.filterChipActive,
                isActive && statusConfig && { backgroundColor: statusConfig.color },
              ]}
              onPress={() => setFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="document-text-outline" size={64} color={Colors.textLight} />
      </View>
      <Text style={styles.emptyTitle}>No Complaints Yet</Text>
      <Text style={styles.emptyText}>
        {filter === 'all'
          ? "You haven't reported any issues yet. Tap the button below to report your first issue."
          : `No complaints with status "${FILTER_OPTIONS.find((f) => f.value === filter)?.label}"`}
      </Text>
      {filter === 'all' && (
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => router.push('/(report)/camera' as any)}
        >
          <Ionicons name="camera" size={20} color="white" />
          <Text style={styles.reportButtonText}>Report Issue</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && complaints.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading complaints...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Complaints</Text>
        <Text style={styles.headerSubtitle}>{complaints.length} total</Text>
      </View>

      {renderHeader()}

      <FlatList
        data={filteredComplaints}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <ComplaintCard
            complaint={item}
            onPress={() => handleComplaintPress(item.id)}
            style={styles.complaintCard}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterContainer: {
    marginBottom: Spacing.sm,
  },
  filterList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.textInverse,
  },
  listContent: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  complaintCard: {
    marginBottom: Spacing.md,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  reportButtonText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textInverse,
  },
});
