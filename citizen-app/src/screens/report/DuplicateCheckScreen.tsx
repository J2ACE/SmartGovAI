import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';
import { Button, ComplaintCard } from '../../components/ui';
import { IssueCategory, NearbyComplaint, STATUS_CONFIG, ISSUE_CATEGORIES } from '../../types';
import { useComplaints } from '../../contexts/ComplaintContext';
import { locationService } from '../../services/locationService';

interface ReportParams {
  imageUri: string;
  category: IssueCategory;
  description: string;
  severity: string;
  latitude: string;
  longitude: string;
  address: string;
  area: string;
  city: string;
}

export default function DuplicateCheckScreen() {
  const params = useLocalSearchParams() as any;
  const { nearbyComplaints, supportExistingComplaint } = useComplaints();
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectComplaint = (complaintId: string) => {
    setSelectedComplaint(complaintId === selectedComplaint ? null : complaintId);
  };

  const handleSupportExisting = async () => {
    if (!selectedComplaint) {
      Alert.alert('Error', 'Please select a complaint to support');
      return;
    }

    setIsSubmitting(true);

    const success = await supportExistingComplaint(selectedComplaint);

    if (success) {
      router.push({
        pathname: '/(report)/success' as any,
        params: {
          mode: 'support',
          complaintId: selectedComplaint,
        },
      });
    } else {
      Alert.alert('Error', 'Failed to support the complaint. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleReportNew = () => {
    router.push({
      pathname: '/(report)/confirm' as any,
      params: {
        imageUri: params.imageUri,
        category: params.category,
        description: params.description,
        severity: params.severity,
        latitude: params.latitude,
        longitude: params.longitude,
        address: params.address,
        area: params.area,
        city: params.city,
      },
    });
  };

  const categoryInfo = ISSUE_CATEGORIES.find(c => c.value === params.category);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Similar Issues Found</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Alert Banner */}
        <View style={styles.alertBanner}>
          <Ionicons name="information-circle" size={24} color={Colors.info} />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>We found similar issues nearby</Text>
            <Text style={styles.alertText}>
              If this is the same issue, you can support an existing complaint instead of creating a new one.
            </Text>
          </View>
        </View>

        {/* Your Report Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Report</Text>
          <View style={styles.yourReport}>
            <Image source={{ uri: params.imageUri }} style={styles.yourImage} />
            <View style={styles.yourReportDetails}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryIcon}>{categoryInfo?.icon}</Text>
                <Text style={styles.categoryText}>{categoryInfo?.label}</Text>
              </View>
              <Text style={styles.locationText} numberOfLines={2}>
                {params.address || params.area || 'Location captured'}
              </Text>
            </View>
          </View>
        </View>

        {/* Nearby Complaints */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Similar Complaints ({nearbyComplaints.length})
          </Text>
          
          {nearbyComplaints.map(({ complaint, distance }) => (
            <TouchableOpacity
              key={complaint.id}
              style={[
                styles.complaintItem,
                selectedComplaint === complaint.id && styles.complaintItemSelected,
              ]}
              onPress={() => handleSelectComplaint(complaint.id)}
              activeOpacity={0.7}
            >
              <View style={styles.complaintHeader}>
                <View style={styles.selectionIndicator}>
                  <Ionicons
                    name={selectedComplaint === complaint.id ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={selectedComplaint === complaint.id ? Colors.primary : Colors.textSecondary}
                  />
                </View>
                <Image source={{ uri: complaint.imageUri }} style={styles.complaintImage} />
                <View style={styles.complaintDetails}>
                  <Text style={styles.complaintCategory}>
                    {ISSUE_CATEGORIES.find(c => c.value === complaint.category)?.label}
                  </Text>
                  <Text style={styles.complaintDistance}>
                    {locationService.formatDistance(distance)}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[complaint.status].bgColor }]}>
                    <Text style={[styles.statusText, { color: STATUS_CONFIG[complaint.status].color }]}>
                      {STATUS_CONFIG[complaint.status].label}
                    </Text>
                  </View>
                </View>
              </View>
              
              {complaint.description && (
                <Text style={styles.complaintDescription} numberOfLines={2}>
                  {complaint.description}
                </Text>
              )}

              <View style={styles.complaintStats}>
                <View style={styles.stat}>
                  <Ionicons name="people" size={14} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{complaint.supporterCount} supporters</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="arrow-up" size={14} color={Colors.textSecondary} />
                  <Text style={styles.statText}>{complaint.upvotes} upvotes</Text>
                </View>
              </View>

              {selectedComplaint === complaint.id && (
                <View style={styles.selectedInfo}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.selectedText}>
                    You'll be added as a supporter for this complaint
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.buttonRow}>
          <Button
            title="Support Selected"
            onPress={handleSupportExisting}
            disabled={!selectedComplaint}
            loading={isSubmitting}
            style={{ flex: 1 }}
            icon={<Ionicons name="hand-left" size={18} color="white" />}
          />
        </View>
        <TouchableOpacity style={styles.newReportButton} onPress={handleReportNew}>
          <Text style={styles.newReportText}>This is a different issue - Create New Report</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight + '20',
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  alertContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  alertTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  alertText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  yourReport: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  yourImage: {
    width: 100,
    height: 100,
  },
  yourReportDetails: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
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
  locationText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  complaintItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.small,
  },
  complaintItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '10',
  },
  complaintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionIndicator: {
    marginRight: Spacing.sm,
  },
  complaintImage: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  complaintDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  complaintCategory: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  complaintDistance: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  complaintDescription: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  complaintStats: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight + '20',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  selectedText: {
    fontSize: FontSizes.xs,
    color: Colors.success,
    flex: 1,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.large,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  newReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  newReportText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
});
