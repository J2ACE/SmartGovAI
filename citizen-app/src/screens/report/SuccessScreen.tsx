import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../constants/theme';
import { Button } from '../../components/ui';
import * as Haptics from 'expo-haptics';

export default function SuccessScreen() {
  const params = useLocalSearchParams<{ mode: string; complaintId: string }>();
  const isSupport = params.mode === 'support';

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animate the success icon
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: isSupport
          ? `I just supported a civic complaint #${params.complaintId?.slice(-6)} on ReportApp. Join me in making our city better!`
          : `I just reported a civic issue #${params.complaintId?.slice(-6)} on ReportApp. Help make our city better by downloading the app!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewStatus = () => {
    router.replace({
      pathname: '/(tabs)/complaints/[id]' as any,
      params: { id: params.complaintId },
    });
  };

  const handleGoHome = () => {
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.successIcon,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.successIconInner}>
            <Ionicons name="checkmark" size={64} color="white" />
          </View>
        </Animated.View>

        {/* Message */}
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>
            {isSupport ? 'Thank You!' : 'Report Submitted!'}
          </Text>
          <Text style={styles.subtitle}>
            {isSupport
              ? 'You have been added as a supporter for this complaint. Your support helps prioritize this issue.'
              : 'Your complaint has been registered successfully. You will receive updates on its progress.'}
          </Text>
        </Animated.View>

        {/* Complaint ID Card */}
        <Animated.View
          style={[
            styles.idCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.idLabel}>
            {isSupport ? 'Complaint ID' : 'Your Complaint ID'}
          </Text>
          <Text style={styles.idValue}>#{params.complaintId?.slice(-6) || 'N/A'}</Text>
          <Text style={styles.idHint}>
            Save this ID for future reference
          </Text>
        </Animated.View>

        {/* Reward Points */}
        <Animated.View
          style={[
            styles.rewardCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Ionicons name="star" size={24} color={Colors.warning} />
          <View style={styles.rewardContent}>
            <Text style={styles.rewardTitle}>
              +{isSupport ? '5' : '10'} Reward Points
            </Text>
            <Text style={styles.rewardText}>
              Earned for {isSupport ? 'supporting' : 'reporting'} this issue
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Actions */}
      <Animated.View
        style={[
          styles.bottomActions,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Button
          title="Share"
          onPress={handleShare}
          variant="outline"
          icon={<Ionicons name="share-social-outline" size={18} color={Colors.primary} />}
          style={{ flex: 1 }}
        />
        <Button
          title="View Status"
          onPress={handleViewStatus}
          icon={<Ionicons name="eye-outline" size={18} color="white" />}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim }}>
        <Button
          title="Back to Home"
          onPress={handleGoHome}
          variant="ghost"
          fullWidth
          style={{ marginBottom: Spacing.md }}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginBottom: Spacing.xl,
  },
  successIconInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  idCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  idLabel: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  idValue: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 2,
  },
  idHint: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    width: '100%',
    gap: Spacing.md,
  },
  rewardContent: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  rewardText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
