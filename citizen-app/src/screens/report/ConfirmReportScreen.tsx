import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';
import { Button } from '../../components/ui';
import { IssueCategory, ISSUE_CATEGORIES, SeverityLevel, SEVERITY_CONFIG, Location } from '../../types';
import { useComplaints } from '../../contexts/ComplaintContext';

interface ReportParams {
  imageUri: string;
  category: IssueCategory;
  description: string;
  severity: SeverityLevel;
  latitude: string;
  longitude: string;
  address: string;
  area: string;
  city: string;
}

export default function ConfirmReportScreen() {
  const params = useLocalSearchParams() as any;
  const { createComplaint } = useComplaints();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryInfo = ISSUE_CATEGORIES.find(c => c.value === params.category);
  const severityConfig = SEVERITY_CONFIG[params.severity as SeverityLevel];

  const location: Location = {
    latitude: parseFloat(params.latitude),
    longitude: parseFloat(params.longitude),
    address: params.address,
    area: params.area,
    city: params.city,
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const result = await createComplaint({
      category: params.category as IssueCategory,
      description: params.description,
      severity: params.severity as SeverityLevel,
      location,
      imageUri: params.imageUri,
    });

    if (result.success) {
      router.replace({
        pathname: '/(report)/success' as any,
        params: {
          mode: 'new',
          complaintId: result.complaint?.id || '',
        },
      });
    } else {
      Alert.alert(
        'Submission Error',
        result.error || 'Failed to submit complaint. Please try again.',
        [{ text: 'OK' }]
      );
    }

    setIsSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Confirm Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Image source={{ uri: params.imageUri }} style={styles.image} />
          
          <View style={styles.details}>
            {/* Category */}
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Text style={styles.categoryIcon}>{categoryInfo?.icon}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.label}>Category</Text>
                <Text style={styles.value}>{categoryInfo?.label}</Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={20} color={Colors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value} numberOfLines={2}>
                  {params.address || params.area || 'Location captured'}
                </Text>
                {params.city && (
                  <Text style={styles.subValue}>{params.city}</Text>
                )}
              </View>
            </View>

            {/* Severity */}
            {severityConfig && (
              <View style={styles.row}>
                <View style={styles.iconContainer}>
                  <Ionicons name="alert-circle" size={20} color={severityConfig.color} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.label}>Severity</Text>
                  <Text style={[styles.value, { color: severityConfig.color }]}>
                    {severityConfig.label}
                  </Text>
                </View>
              </View>
            )}

            {/* Description */}
            {params.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.description}>{params.description}</Text>
              </View>
            )}
          </View>
        </View>

        {/* What happens next */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verification</Text>
              <Text style={styles.stepText}>
                Your complaint will be verified by our team
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Assignment</Text>
              <Text style={styles.stepText}>
                It will be assigned to the relevant department
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Resolution</Text>
              <Text style={styles.stepText}>
                You'll receive updates as work progresses
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title="Edit Report"
          onPress={() => router.back()}
          variant="outline"
          style={{ flex: 1 }}
        />
        <Button
          title="Submit Report"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={{ flex: 1 }}
          icon={<Ionicons name="send" size={18} color="white" />}
        />
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
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background,
  },
  details: {
    padding: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  categoryIcon: {
    fontSize: FontSizes.xl,
  },
  rowContent: {
    flex: 1,
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  subValue: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  descriptionSection: {
    paddingTop: Spacing.md,
  },
  description: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
  infoSection: {
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.small,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  step: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepNumberText: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: Colors.textInverse,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  stepText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.large,
  },
});
