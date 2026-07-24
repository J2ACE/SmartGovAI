import { IssueCategory } from '../types';

// Simple AI-based category detection using image analysis keywords
// In production, this would call a real ML model or API

const CATEGORY_KEYWORDS: Record<IssueCategory, string[]> = {
  pothole: ['hole', 'road', 'damage', 'asphalt', 'crack', 'pit', 'depression'],
  garbage: ['trash', 'waste', 'garbage', 'dump', 'litter', 'rubbish', 'debris'],
  street_light: ['light', 'lamp', 'pole', 'bulb', 'dark', 'broken light', 'street lamp'],
  water_leak: ['water', 'leak', 'pipe', 'wet', 'flood', 'burst', 'leaking'],
  sewage: ['sewage', 'drain', 'smell', 'overflow', 'manhole', 'sewer'],
  road_damage: ['road', 'crack', 'damage', 'surface', 'broken', 'uneven'],
  illegal_parking: ['parking', 'car', 'vehicle', 'illegal', 'block', 'obstruction'],
  noise_pollution: ['noise', 'loud', 'sound', 'music', 'construction'],
  air_pollution: ['smoke', 'pollution', 'dust', 'smog', 'burning'],
  encroachment: ['encroach', 'illegal', 'construction', 'occupy', 'block'],
  broken_footpath: ['footpath', 'sidewalk', 'pavement', 'tiles', 'broken', 'uneven'],
  traffic_signal: ['signal', 'traffic', 'light', 'broken', 'not working'],
  drainage: ['drain', 'water', 'blocked', 'clogged', 'overflow', 'flooding'],
  public_toilet: ['toilet', 'restroom', 'bathroom', 'dirty', 'broken', 'smell'],
  other: [],
};

export const aiService = {
  // Simulate AI category detection
  // In production, this would use TensorFlow.js or a cloud ML API
  async detectCategory(imageUri: string): Promise<{
    category: IssueCategory;
    confidence: number;
    suggestions: IssueCategory[];
  }> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, analyze the image using ML
    // For now, return a random common category
    const commonCategories: IssueCategory[] = [
      'pothole',
      'garbage',
      'street_light',
      'water_leak',
      'road_damage',
    ];

    const randomIndex = Math.floor(Math.random() * commonCategories.length);
    const detectedCategory = commonCategories[randomIndex];

    // Generate suggestions (top 3 likely categories)
    const suggestions = commonCategories
      .filter((c) => c !== detectedCategory)
      .slice(0, 3);

    return {
      category: detectedCategory,
      confidence: 0.7 + Math.random() * 0.25, // 70-95% confidence
      suggestions: [detectedCategory, ...suggestions] as IssueCategory[],
    };
  },

  // Analyze image for quality
  async analyzeImageQuality(imageUri: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In production, check for:
    // - Blur detection
    // - Low light
    // - Inappropriate content
    // - Image size/resolution

    return {
      isValid: true,
      issues: [],
    };
  },

  // Generate description suggestion based on category
  generateDescriptionSuggestion(category: IssueCategory): string {
    const suggestions: Record<IssueCategory, string> = {
      pothole: 'Pothole on the road causing inconvenience to commuters',
      garbage: 'Garbage accumulation requiring immediate cleanup',
      street_light: 'Street light not functioning, causing safety concerns',
      water_leak: 'Water leakage from pipe/connection',
      sewage: 'Sewage overflow/blockage issue',
      road_damage: 'Road surface damage requiring repair',
      illegal_parking: 'Vehicles parked illegally blocking the way',
      noise_pollution: 'Excessive noise causing disturbance',
      air_pollution: 'Air pollution from burning/smoke',
      encroachment: 'Illegal encroachment on public space',
      broken_footpath: 'Footpath damage causing walking difficulty',
      traffic_signal: 'Traffic signal malfunction',
      drainage: 'Drainage system blocked/overflowing',
      public_toilet: 'Public toilet maintenance issue',
      other: 'Issue requiring attention',
    };

    return suggestions[category] || suggestions.other;
  },

  // Estimate severity based on category and other factors
  estimateSeverity(
    category: IssueCategory,
    supporterCount: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const highPriorityCategories: IssueCategory[] = [
      'water_leak',
      'sewage',
      'road_damage',
      'pothole',
    ];

    const criticalThreshold = 10;
    const highThreshold = 5;

    if (supporterCount >= criticalThreshold) return 'critical';
    if (supporterCount >= highThreshold) return 'high';
    if (highPriorityCategories.includes(category)) return 'medium';
    return 'low';
  },
};
