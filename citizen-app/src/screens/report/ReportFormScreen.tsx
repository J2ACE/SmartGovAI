import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';
import { Button, CategorySelector } from '../../components/ui';
import { IssueCategory, SeverityLevel, SEVERITY_CONFIG, Location } from '../../types';
import { locationService } from '../../services/locationService';
import { aiService } from '../../services/aiService';
import { useComplaints } from '../../contexts/ComplaintContext';

export default function ReportFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const params = (route.params || {}) as { imageUri?: string };
  const { createComplaint } = useComplaints();

  const [imageUri, setImageUri] = useState<string>(params.imageUri || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600');
  const [location, setLocation] = useState<Location>({
    latitude: 19.0760,
    longitude: 72.8777,
    address: 'Captured Location',
    area: 'Municipal Ward Area',
    city: 'Mumbai',
  });
  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [suggestedCategories, setSuggestedCategories] = useState<IssueCategory[]>(['pothole']);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number>(0.92);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchLocation();
    if (params.imageUri) {
      setImageUri(params.imageUri);
      analyzeImage(params.imageUri);
    }
  }, [params.imageUri]);

  const fetchLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const loc = await locationService.getFullLocation();
      if (loc && loc.latitude && loc.longitude) {
        setLocation(loc);
      }
    } catch (err) {
      console.warn('Using default location fallback.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const result = await aiService.categorizeImage(uri);
      if (result.category) {
        setCategory(result.category);
        setAiConfidence(result.confidence || 0.92);
        setSuggestedCategories(result.suggestedCategories || [result.category]);
        if (result.suggestedSeverity) {
          setSeverity(result.suggestedSeverity);
        }
      }
    } catch (err) {
      console.warn('AI analysis skipped, defaulting category.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCategorySelect = (selectedCategory: IssueCategory) => {
    setCategory(selectedCategory);
    if (!description || description === aiService.generateDescriptionSuggestion(category)) {
      setDescription(aiService.generateDescriptionSuggestion(selectedCategory));
    }
  };

  const handleContinue = async () => {
    if (isSubmitting || isSubmitted) return;
    setIsSubmitting(true);

    try {
      const selectedCat = category || 'pothole';
      const finalDesc = description || `${selectedCat.toUpperCase()} issue reported by citizen`;
      const finalSev = severity || 'medium';

      const result = await createComplaint({
        category: selectedCat,
        description: finalDesc,
        severity: finalSev,
        location: location,
        imageUri: imageUri,
        beforeImages: [imageUri],
        afterImages: [],
      });

      if (result.success && result.complaint) {
        setIsSubmitted(true);
        Alert.alert(
          '🎉 Complaint Registered!',
          `Your civic complaint has been registered successfully in the system.\n\nComplaint ID: #${result.complaint.id.slice(0, 8).toUpperCase()}`,
          [
            {
              text: 'View Details',
              onPress: () => {
                navigation.replace('Success' as any, {
                  mode: 'new',
                  complaintId: result.complaint!.id,
                });
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Submission Result',
          result.message || 'Complaint submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('MainTabs' as any),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', error.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Issue</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Preview */}
        <View style={styles.imageSection}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="camera-outline" size={20} color={Colors.text} />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location" size={18} color={Colors.primary} /> Location
          </Text>
          {isLoadingLocation ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Fetching GPS location...</Text>
            </View>
          ) : (
            <View style={styles.locationCard}>
              <Text style={styles.locationAddress}>
                {location.address || 'Location captured'}
              </Text>
              <Text style={styles.locationArea}>
                {[location.area, location.city, location.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              <TouchableOpacity onPress={fetchLocation} style={styles.refreshLocation}>
                <Ionicons name="refresh" size={16} color={Colors.primary} />
                <Text style={styles.refreshText}>Refresh GPS</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          {isAnalyzing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>AI is analyzing the image...</Text>
            </View>
          ) : (
            <CategorySelector
              selectedCategory={category}
              onSelectCategory={handleCategorySelect}
              suggestedCategories={suggestedCategories}
              aiConfidence={aiConfidence}
            />
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="document-text" size={18} color={Colors.primary} /> Description
            <Text style={styles.optional}> (optional)</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={Colors.placeholder}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        {/* Severity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="alert-circle" size={18} color={Colors.primary} /> Severity
            <Text style={styles.optional}> (optional)</Text>
          </Text>
          <View style={styles.severityRow}>
            {(Object.keys(SEVERITY_CONFIG) as SeverityLevel[]).map((level) => {
              const config = SEVERITY_CONFIG[level];
              const isSelected = severity === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.severityButton,
                    isSelected && { backgroundColor: config.color },
                  ]}
                  onPress={() => setSeverity(level)}
                >
                  <Text
                    style={[
                      styles.severityText,
                      isSelected && { color: 'white' },
                    ]}
                  >
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Sticky Action Bar with safe area padding */}
      <View style={[styles.bottomAction, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[
            styles.primaryActionButton,
            isSubmitted && { backgroundColor: Colors.success },
            (isSubmitting || isSubmitted) && { opacity: 0.8 },
          ]}
          onPress={handleContinue}
          disabled={isSubmitting || isSubmitted}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : isSubmitted ? (
            <Text style={styles.primaryActionButtonText}>✓ Complaint Registered</Text>
          ) : (
            <Text style={styles.primaryActionButtonText}>Submit Report</Text>
          )}
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
  imageSection: {
    position: 'relative',
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
  retakeButton: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  retakeText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '500',
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
  optional: {
    fontWeight: 'normal',
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  locationCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  locationAddress: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  locationArea: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  refreshLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  refreshText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  severityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  severityButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  severityText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.text,
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
