import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { StatusEvent, STATUS_CONFIG } from '../../types';
import { Colors, BorderRadius, Spacing, FontSizes } from '../../constants/theme';

interface StatusTimelineProps {
  statusHistory: StatusEvent[];
  style?: ViewStyle;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  statusHistory,
  style,
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <View style={[styles.container, style]}>
      {statusHistory.map((event, index) => {
        const statusConfig = STATUS_CONFIG[event.status];
        const { date, time } = formatDateTime(event.timestamp);
        const isLast = index === statusHistory.length - 1;
        const isFirst = index === 0;

        return (
          <View key={`${event.status}-${event.timestamp}`} style={styles.timelineItem}>
            {/* Timeline connector */}
            <View style={styles.timelineConnector}>
              {/* Top line */}
              {!isFirst && <View style={styles.lineTop} />}
              
              {/* Dot */}
              <View
                style={[
                  styles.dot,
                  { backgroundColor: statusConfig.color },
                  isLast && styles.dotActive,
                ]}
              >
                {isLast && <View style={[styles.dotInner, { backgroundColor: statusConfig.color }]} />}
              </View>
              
              {/* Bottom line */}
              {!isLast && <View style={styles.lineBottom} />}
            </View>

            {/* Content */}
            <View style={[styles.content, isLast && styles.contentActive]}>
              <View style={styles.header}>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                  <Text style={[styles.statusText, { color: statusConfig.color }]}>
                    {statusConfig.label}
                  </Text>
                </View>
                <Text style={styles.time}>{time}</Text>
              </View>
              
              <Text style={styles.date}>{date}</Text>
              
              {event.note && (
                <Text style={styles.note}>{event.note}</Text>
              )}
              
              {event.updatedBy && (
                <Text style={styles.updatedBy}>by {event.updatedBy}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: Spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineConnector: {
    width: 24,
    alignItems: 'center',
  },
  lineTop: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginBottom: -4,
  },
  lineBottom: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: -4,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    flex: 1,
    paddingLeft: Spacing.md,
    paddingBottom: Spacing.md,
  },
  contentActive: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginLeft: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  time: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  date: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  note: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  updatedBy: {
    fontSize: FontSizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
});
