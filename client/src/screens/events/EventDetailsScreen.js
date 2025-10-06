import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import Toast from 'react-native-toast-message';

import useEventStore from '../../stores/eventStore';
import useAuthStore from '../../stores/authStore';
import { colors, spacing, typography } from '../../utils/theme';

const EventDetailsScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [isJoined, setIsJoined] = useState(false);
  
  const { joinEvent, loading } = useEventStore();
  const { token, user } = useAuthStore();

  const getEventStatus = () => {
    const eventDate = new Date(event.date);
    if (isPast(eventDate)) return { status: 'past', color: colors.textSecondary, text: 'Event Ended' };
    if (isToday(eventDate)) return { status: 'today', color: colors.success, text: 'Today' };
    if (isTomorrow(eventDate)) return { status: 'tomorrow', color: colors.warning, text: 'Tomorrow' };
    return { status: 'upcoming', color: colors.primary, text: 'Upcoming' };
  };

  const eventStatus = getEventStatus();

  const handleJoinEvent = async () => {
    if (isJoined) return;

    Alert.alert(
      'Join Event',
      `Do you want to join "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: async () => {
            const result = await joinEvent(event._id, token);
            if (result.success) {
              setIsJoined(true);
              Toast.show({
                type: 'success',
                text1: 'Event Joined!',
                text2: 'You have successfully joined this event.',
              });
            } else {
              Toast.show({
                type: 'error',
                text1: 'Join Failed',
                text2: result.error || 'Failed to join event',
              });
            }
          },
        },
      ]
    );
  };

  const shareEvent = () => {
    Alert.alert(
      'Share Event',
      'Feature coming soon!',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <LinearGradient
            colors={colors.gradient.secondary}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.eventIconLarge}>
                <Ionicons name="calendar" size={32} color={colors.background} />
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: eventStatus.color + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: eventStatus.color }]} />
                <Text style={[styles.statusText, { color: eventStatus.color }]}>
                  {eventStatus.text}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* Event Info */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.metaText}>
                {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.metaText}>
                {format(new Date(event.date), 'h:mm a')}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={styles.metaText}>{event.location}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={styles.metaText}>
                {event.attendees?.length || 0} attending
                {event.capacity && ` • ${event.capacity} max`}
              </Text>
            </View>
          </View>
        </Animatable.View>

        {/* Action Buttons */}
        <Animatable.View animation="fadeIn" delay={500} style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryAction,
              isJoined && styles.joinedAction,
              eventStatus.status === 'past' && styles.disabledAction
            ]}
            onPress={handleJoinEvent}
            disabled={isJoined || eventStatus.status === 'past' || loading}
          >
            <LinearGradient
              colors={isJoined ? [colors.success, colors.success] : colors.gradient.primary}
              style={styles.actionGradient}
            >
              <Ionicons 
                name={isJoined ? "checkmark-circle" : "person-add"} 
                size={20} 
                color={colors.background} 
              />
              <Text style={styles.actionText}>
                {isJoined ? 'Joined' : eventStatus.status === 'past' ? 'Event Ended' : 'Join Event'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]} onPress={shareEvent}>
            <Ionicons name="share-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryActionText}>Share</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Description */}
        <Animatable.View animation="fadeIn" delay={700} style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>About This Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </Animatable.View>

        {/* Attendees Section */}
        <Animatable.View animation="fadeIn" delay={900} style={styles.attendeesContainer}>
          <View style={styles.attendeesHeader}>
            <Text style={styles.sectionTitle}>Attendees</Text>
            <Text style={styles.attendeeCount}>
              {event.attendees?.length || 0} going
            </Text>
          </View>
          
          {event.attendees?.length > 0 ? (
            <View style={styles.attendeesList}>
              {/* Mock attendee avatars */}
              <View style={styles.attendeeAvatars}>
                {[...Array(Math.min(event.attendees.length, 5))].map((_, index) => (
                  <View key={index} style={[styles.attendeeAvatar, { zIndex: 5 - index }]}>
                    <Ionicons name="person" size={16} color={colors.background} />
                  </View>
                ))}
                {event.attendees.length > 5 && (
                  <View style={[styles.attendeeAvatar, styles.moreAttendees]}>
                    <Text style={styles.moreAttendeesText}>+{event.attendees.length - 5}</Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.noAttendees}>
              <Ionicons name="people-outline" size={32} color={colors.textSecondary} />
              <Text style={styles.noAttendeesText}>No attendees yet</Text>
              <Text style={styles.noAttendeesSubtext}>Be the first to join!</Text>
            </View>
          )}
        </Animatable.View>

        {/* Event Guidelines */}
        <Animatable.View animation="fadeIn" delay={1100} style={styles.guidelinesContainer}>
          <Text style={styles.sectionTitle}>Event Guidelines</Text>
          <View style={styles.guideline}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.guidelineText}>Arrive on time</Text>
          </View>
          <View style={styles.guideline}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.guidelineText}>Bring a positive attitude</Text>
          </View>
          <View style={styles.guideline}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.guidelineText}>Respect other participants</Text>
          </View>
          <View style={styles.guideline}>
            <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
            <Text style={styles.guidelineText}>Follow club rules and policies</Text>
          </View>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  eventIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.body,
    fontWeight: '600',
  },
  eventInfo: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  eventTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  eventMeta: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metaText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryAction: {
    flex: 2,
  },
  joinedAction: {
    opacity: 0.8,
  },
  disabledAction: {
    opacity: 0.5,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  actionText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  secondaryActionText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  descriptionContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  attendeesContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  attendeesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  attendeeCount: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  attendeesList: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: spacing.md,
  },
  attendeeAvatars: {
    flexDirection: 'row',
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: colors.background,
  },
  moreAttendees: {
    backgroundColor: colors.textSecondary,
  },
  moreAttendeesText: {
    ...typography.small,
    color: colors.background,
    fontWeight: 'bold',
  },
  noAttendees: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  noAttendeesText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
  },
  noAttendeesSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  guidelinesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  guidelineText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
});

export default EventDetailsScreen;