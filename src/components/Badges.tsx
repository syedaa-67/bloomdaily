import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { categoryColors, palette, radius, spacing, typography } from '@/theme/theme';
import { Category, Priority } from '@/types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const color =
    priority === 'High' ? palette.priorityHigh : priority === 'Medium' ? palette.priorityMedium : palette.priorityLow;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}26` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{priority}</Text>
    </View>
  );
}

export function CategoryTag({ category }: { category: Category }) {
  const color = categoryColors[category] ?? categoryColors.Other;
  return (
    <View style={[styles.badge, { backgroundColor: `${color}26` }]}>
      <Text style={[styles.badgeText, { color }]}>{category}</Text>
    </View>
  );
}

export function StreakBadge({ count }: { count: number }) {
  const theme = useTheme();
  if (count <= 0) return null;
  return (
    <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
      <Text style={[styles.badgeText, { color: theme.primaryDark }]}>🔥 {count} day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  badgeText: {
    fontFamily: typography.fontFamily.bodyBold,
    fontSize: typography.size.xs,
  },
});
