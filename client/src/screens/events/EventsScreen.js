import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

import useEventStore from '../../stores/eventStore';
import useAuthStore from '../../stores/authStore';
import { colors, spacing, typography } from '../../utils/theme';

const EventCard = ({ event, onPress }) => {
  const getDateInfo = (date) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return { text: 'Today', color: colors.success };
    if (isTomorrow(eventDate)) return { text: 'Tomorrow', color: colors.warning };
    if (isThisWeek(eventDate)) return { text: format(eventDate, 'EEEE'), color: colors.primary };
    return { text: format(eventDate, 'MMM dd'), color: colors.textSecondary };
  };

  const dateInfo = getDateInfo(event.date);

  return (
    <Animatable.View 
      animation="fadeInUp" 
      duration={600}
      style={styles.eventCard}
    >
      <TouchableOpacity onPress={() => onPress(event)} style={styles.cardContent}>
        <LinearGradient
          colors={[colors.accent + '15', colors.primary + '08']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <Text style={[styles.dateText, { color: dateInfo.color }]}>
                {dateInfo.text}
              </Text>
              <Text style={styles.timeText}>
                {format(new Date(event.date), 'h:mm a')}
              </Text>
            </View>
            <View style={styles.eventStatus}>
              <View style={[styles.statusDot, { backgroundColor: dateInfo.color }]} />
            </View>
          </View>
          
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.title}
          </Text>
          
          <Text style={styles.eventDescription} numberOfLines={2}>
            {event.description}
          </Text>
          
          <View style={styles.eventFooter}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
            <View style={styles.attendeeContainer}>
              <Ionicons name="business" size={16} color={colors.textSecondary} />
              <Text style={styles.attendeeText}>
                {event.clubName}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const EventsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, today, week, month
  
  const { events, getAllEvents, loading } = useEventStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchEvents();
    }
  }, [token]);

  const fetchEvents = async () => {
    await getAllEvents(token);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  const getFilteredEvents = () => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      switch (filterType) {
        case 'today':
          return isToday(eventDate);
        case 'week':
          return isThisWeek(eventDate);
        case 'month':
          return eventDate.getMonth() === now.getMonth() && 
                 eventDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const renderFilterButton = (type, label, icon) => (
    <TouchableOpacity
      style={[styles.filterButton, filterType === type && styles.activeFilterButton]}
      onPress={() => setFilterType(type)}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={filterType === type ? colors.background : colors.textSecondary} 
      />
      <Text style={[
        styles.filterText,
        filterType === type && styles.activeFilterText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={colors.gradient.primary}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>My Events</Text>
        <Text style={styles.headerSubtitle}>Stay updated with your activities</Text>
      </LinearGradient>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by</Text>
        <View style={styles.filters}>
          {renderFilterButton('all', 'All', 'calendar-outline')}
          {renderFilterButton('today', 'Today', 'today-outline')}
          {renderFilterButton('week', 'This Week', 'time-outline')}
          {renderFilterButton('month', 'This Month', 'calendar')}
        </View>
      </View>
    </View>
  );

  const renderEvent = ({ item }) => (
    <EventCard
      event={item}
      onPress={() => navigation.navigate('EventDetails', { event: item })}
    />
  );

  const renderEmpty = () => (
    <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Events Found</Text>
      <Text style={styles.emptyText}>
        {filterType === 'all' 
          ? 'Join some clubs to see events here!'
          : `No events ${filterType === 'today' ? 'today' : `this ${filterType}`}`
        }
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Clubs')}
      >
        <Text style={styles.emptyButtonText}>Explore Clubs</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  const filteredEvents = getFilteredEvents();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={[
          styles.listContainer,
          filteredEvents.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingBottom: spacing.lg,
  },
  emptyListContainer: {
    flexGrow: 1,
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
  headerTitle: {
    ...typography.h1,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.background,
    opacity: 0.9,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  filtersTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  activeFilterText: {
    color: colors.background,
    fontWeight: '600',
  },
  eventCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardContent: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  dateContainer: {
    alignItems: 'flex-start',
  },
  dateText: {
    ...typography.h3,
    fontWeight: 'bold',
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  eventStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eventTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  eventDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  attendeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 20,
  },
  emptyButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
});

export default EventsScreen;