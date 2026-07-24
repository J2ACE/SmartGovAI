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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';
import { Button, CategorySelector } from '../../components/ui';
import { IssueCategory, ISSUE_CATEGORIES, SeverityLevel, SEVERITY_CONFIG, Location } from '../../types';
import { locationService } from '../../services/locationService';
import { aiService } from '../../services/aiService';
import { useComplaints } from '../../contexts/ComplaintContext';

export default function ReportFormScreen() {
  const params = useLocalSearchParams<{ imageUri: string }>();
  const { checkNearbyComplaints, nearbyComplaints } = useComplaints();

  const [imageUri, setImageUri] = useState<string>(params.imageUri || '');
  const [location, setLocation] = useState<Location | null>(null);
  const [category, setCategory] = useState<IssueCategory | null>(null);
  const [suggestedCategories, setSuggestedCategories] = useState<IssueCategory[]>([]);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel | null>(null);
  
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number>(0);

  useEffect(() => {
    if (params.imageUri) {
      setImageUri(params.imageUri);
      fetchLocation();
      analyzeImage(params.imageUri);
    }
  }, [params.imageUri]);

  const fetchLocation = async () => {
    setIsLoadingLocation(true);
    const loc = await locationService.getFullLocation();
    if (loc) {
      setLocation(loc);
    } else {
      Alert.alert(
        'Location Error',
        'Could not fetch your location. Please ensure location services are enabled.',
        [{ text: 'OK' }]
      );
    }
    setIsLoadingLocation(false);
  };

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const result = await aiService.detectCategory(uri);
      setSuggestedCategories(result.suggestions);
      setCategory(result.category);
      setAiConfidence(result.confidence);
      setDescription(aiService.generateDescriptionSuggestion(result.category));
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCategorySelect = (selectedCategory: IssueCategory) => {
    setCategory(selectedCategory);
    if (!description || description === aiService.generateDescriptionSuggestion(category!)) {
      setDescription(aiService.generateDescriptionSuggestion(selectedCategory));
    }
  };

  const handleContinue = async () => {
    if (!category) {
      Alert.alert('Error', 'Please select an issue category');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is required to submit a report');
      return;
    }

    // Check for nearby similar complaints
    const nearby = await checkNearbyComplaints(location, category);

    if (nearby.length > 0) {
      // Navigate to duplicate check screen
      router.push({
        pathname: '/(report)/duplicates' as any,
        params: {
          imageUri,
          category,
          description,
          severity: severity || 'medium',
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          address: location.address || '',
          area: location.area || '',
          city: location.city || '',
        },
      });
    } else {
      // No duplicates, go directly to confirmation
      router.push({
        pathname: '/(report)/confirm' as any,
        params: {
          imageUri,
          category,
          description,
          severity: severity || 'medium',
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          address: location.address || '',
          area: location.area || '',
          city: location.city || '',
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
            onPress={() => router.back()}
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
              <Text style={styles.loadingText}>Fetching location...</Text>
            </View>
          ) : location ? (
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
                <Text style={styles.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.errorCard} onPress={fetchLocation}>
              <Ionicons name="warning" size={20} color={Colors.error} />
              <Text style={styles.errorText}>Tap to retry location</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="list" size={18} color={Colors.primary} /> Issue Category
          </Text>
          {isAnalyzing ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>AI is analyzing the image...</Text>
            </View>
          ) : (
            <>
              {aiConfidence > 0 && (
                <View style={styles.aiConfidence}>
                  <Ionicons name="sparkles" size={14} color={Colors.secondary} />
                  <Text style={styles.aiConfidenceText}>
                    AI Confidence: {Math.round(aiConfidence * 100)}%
                  </Text>
                </View>
              )}
              <CategorySelector
                selectedCategory={category}
                onSelectCategory={handleCategorySelect}
                suggestedCategories={suggestedCategories}
              />
            </>
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

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Button
          title="Continue"
          onPress={handleContinue}
          fullWidth
          size="large"
          disabled={!category || !location}
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
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.errorLight + '20',
    borderRadius: BorderRadius.lg,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
  },
  aiConfidence: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  aiConfidenceText: {
    fontSize: FontSizes.sm,
    color: Colors.secondary,
    fontWeight: '500',
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
