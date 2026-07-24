import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ViewStyle } from 'react-native';
import { IssueCategory, ISSUE_CATEGORIES } from '../../types';
import { Colors, BorderRadius, Spacing, FontSizes } from '../../constants/theme';

interface CategorySelectorProps {
  selectedCategory: IssueCategory | null;
  onSelectCategory: (category: IssueCategory) => void;
  suggestedCategories?: IssueCategory[];
  style?: ViewStyle;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  suggestedCategories = [],
  style,
}) => {
  // Sort categories to show suggested ones first
  const sortedCategories = [...ISSUE_CATEGORIES].sort((a, b) => {
    const aIndex = suggestedCategories.indexOf(a.value);
    const bIndex = suggestedCategories.indexOf(b.value);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  return (
    <View style={[styles.container, style]}>
      {suggestedCategories.length > 0 && (
        <Text style={styles.suggestionText}>
          🤖 AI Suggested categories (tap to select)
        </Text>
      )}
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sortedCategories.map((category, index) => {
          const isSelected = selectedCategory === category.value;
          const isSuggested = suggestedCategories.includes(category.value);
          const isTopSuggestion = suggestedCategories[0] === category.value;

          return (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.categoryItem,
                isSelected && styles.categoryItemSelected,
                isSuggested && styles.categoryItemSuggested,
                isTopSuggestion && styles.categoryItemTopSuggestion,
              ]}
              onPress={() => onSelectCategory(category.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelSelected,
                ]}
                numberOfLines={1}
              >
                {category.label}
              </Text>
              {isTopSuggestion && (
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Grid view for all categories */}
      <View style={styles.grid}>
        {ISSUE_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.value;

          return (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.gridItem,
                isSelected && styles.gridItemSelected,
              ]}
              onPress={() => onSelectCategory(category.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.gridIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.gridLabel,
                  isSelected && styles.gridLabelSelected,
                ]}
                numberOfLines={2}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  suggestionText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  categoryItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryItemSuggested: {
    borderColor: Colors.primaryLight,
    borderWidth: 2,
  },
  categoryItemTopSuggestion: {
    backgroundColor: Colors.primaryLight + '20',
  },
  categoryIcon: {
    fontSize: FontSizes.lg,
    marginRight: Spacing.xs,
  },
  categoryLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: Colors.textInverse,
  },
  aiBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.xs,
  },
  aiBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: Colors.textInverse,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  gridItem: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gridItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  gridIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  gridLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  gridLabelSelected: {
    color: Colors.textInverse,
  },
});
