import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IssueCategory, ISSUE_CATEGORIES } from '../../types';
import { Colors, BorderRadius, Spacing, FontSizes, Shadows } from '../../constants/theme';

interface CategorySelectorProps {
  selectedCategory: IssueCategory | null;
  onSelectCategory: (category: IssueCategory) => void;
  suggestedCategories?: IssueCategory[];
  aiConfidence?: number;
  style?: ViewStyle;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  suggestedCategories = [],
  aiConfidence = 0,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const topSuggestedCategoryKey = suggestedCategories[0] || selectedCategory || 'other';
  const topSuggestedInfo = ISSUE_CATEGORIES.find(c => c.value === topSuggestedCategoryKey) || ISSUE_CATEGORIES[0];
  const selectedInfo = ISSUE_CATEGORIES.find(c => c.value === selectedCategory) || topSuggestedInfo;

  const confidencePercent = aiConfidence > 0 ? Math.round(aiConfidence * 100) : 92;

  const handleSelect = (cat: IssueCategory) => {
    onSelectCategory(cat);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {/* AI Suggested Category Banner */}
      <View style={styles.aiSuggestionBox}>
        <Text style={styles.aiSuggestionLabel}>AI Suggested Category</Text>
        <View style={styles.aiSuggestionBadge}>
          <Text style={styles.aiDot}>🟢</Text>
          <Text style={styles.aiCategoryText}>
            {topSuggestedInfo.icon} {topSuggestedInfo.label} ({confidencePercent}%)
          </Text>
        </View>
      </View>

      {/* Manual Selection Label & Dropdown */}
      <Text style={styles.dropdownLabel}>Category</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.dropdownValueRow}>
          <Text style={styles.dropdownIcon}>{selectedInfo.icon}</Text>
          <Text style={styles.dropdownText}>{selectedInfo.label}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>

      {/* Category Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Issue Category</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={ISSUE_CATEGORIES}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 350 }}
              renderItem={({ item }) => {
                const isSelected = selectedCategory === item.value;
                const isSuggested = suggestedCategories[0] === item.value;

                return (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionSelected,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <View style={styles.modalOptionLeft}>
                      <Text style={styles.modalOptionIcon}>{item.icon}</Text>
                      <Text
                        style={[
                          styles.modalOptionText,
                          isSelected && styles.modalOptionTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {isSuggested && (
                      <View style={styles.aiBadge}>
                        <Text style={styles.aiBadgeText}>AI Suggested</Text>
                      </View>
                    )}
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  aiSuggestionBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  aiSuggestionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  aiSuggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  aiDot: {
    fontSize: 12,
  },
  aiCategoryText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#1B5E20',
  },
  dropdownLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  dropdownValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dropdownIcon: {
    fontSize: FontSizes.lg,
  },
  dropdownText: {
    fontSize: FontSizes.md,
    fontWeight: '500',
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modalOptionSelected: {
    backgroundColor: Colors.primaryLight + '15',
  },
  modalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalOptionIcon: {
    fontSize: FontSizes.lg,
  },
  modalOptionText: {
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  aiBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  aiBadgeText: {
    fontSize: FontSizes.xs,
    color: '#2E7D32',
    fontWeight: '600',
  },
});
