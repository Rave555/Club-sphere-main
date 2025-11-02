import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import useAuthStore from '../../stores/authStore';
import useClubStore from '../../stores/clubStore';
import useEventStore from '../../stores/eventStore';
import { colors, spacing, typography } from '../../utils/theme';

const StatCard = ({ title, value, icon, color, onPress }) => (
  <Animatable.View animation="fadeInUp" duration={600} style={styles.statCard}>
    <TouchableOpacity onPress={onPress} style={styles.statContent}>
      <LinearGradient
        colors={[color + '15', color + '08']}
        style={styles.statGradient}
      >
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  </Animatable.View>
);

const QuickActionCard = ({ title, subtitle, icon, color, onPress }) => (
  <Animatable.View animation="fadeInLeft" duration={600} style={styles.actionCard}>
    <TouchableOpacity onPress={onPress} style={styles.actionContent}>
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  </Animatable.View>
);

const RecentActivityItem = ({ activity }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: activity.color + '15' }]}>
      <Ionicons name={activity.icon} size={16} color={activity.color} />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{activity.title}</Text>
      <Text style={styles.activityTime}>{activity.time}</Text>
    </View>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user   , token } = useAuthStore();
  const { clubs, myClubs ,getAllClubs,initializeStore: initializeClubStore } = useClubStore();
    const { events , initializeStore: initializeEventStore } = useEventStore();
  useEffect(() => {
    if (token && !isInitialized) {
      fetchData();
      initializeData();
    }
  }, [token]);

  const initializeData = async () => {
    try {
      await Promise.all([
        initializeClubStore(token),
        initializeEventStore(token)
      ]);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  };
  
  const fetchData = async () => {
    await Promise.all([
      getAllClubs(token)
    ]);
  };

  const getStatValue = (value, loading) => {
    if (loading || !isInitialized) return '...';
    return value;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      title: 'You joined Coding Club',
      time: '2 hours ago',
      icon: 'people',
      color: colors.primary,
    },
    {
      id: 2,
      title: 'New event: Coding Workshop',
      time: '5 hours ago',
      icon: 'calendar',
      color: colors.secondary,
    },
    {
      id: 3,
      title: 'Welcome to ClubSphere!',
      time: '1 day ago',
      icon: 'checkmark-circle',
      color: colors.success,
    },
  ];

  const quickActions = [
    {
      title: 'Explore Clubs',
      subtitle: 'Find communities that match your interests',
      icon: 'search',
      color: colors.primary,
      onPress: () => navigation.navigate('Clubs'),
    },
    {
      title: 'Catchup Events',
      subtitle: 'View your upcoming events and activities',
      icon: 'calendar',
      color: colors.secondary,
      onPress: () => navigation.navigate('Events'),
    },
    {
      title: 'Create Club',
      subtitle: 'Start your own community',
      icon: 'add-circle',
      color: colors.accent,
      onPress: () => navigation.navigate('Clubs', { screen: 'CreateClub' }),
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.welcomeSection}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>{user?.userName || 'User'}!</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Ionicons name="person-circle" size={32} color={colors.background} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* Stats Cards */}
        <Animatable.View animation="fadeIn" delay={300} style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="My Clubs"
              value={getStatValue(myClubs.length, !isInitialized)}
              icon="people"
              color={colors.primary}
              onPress={() => navigation.navigate('MyClubs')}
            />
            <StatCard
              title="Events"
              value={getStatValue(events.length, !isInitialized)}
              icon="calendar"
              color={colors.secondary}
              onPress={() => navigation.navigate('Events')}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Clubs"
              value={getStatValue(clubs.length, !isInitialized)}
              icon="business"
              color={colors.accent}
              onPress={() => navigation.navigate('Clubs')}
            />
            <StatCard
              title="Active"
              value={user?.role === 'admin' ? 'Admin' : 'Member'}
              icon="checkmark-circle"
              color={colors.success}
            />
          </View>
          {
            user?.role === 'admin' && (
            <View style={styles.statsRow}>
              <StatCard
                title="for any club"
                value={"Create Event"}
                icon="add-circle"
                color={colors.accent}
                onPress={() => navigation.navigate('CreateEvent')}
              />
    
            </View>
            )
          }
        </Animatable.View>

        {/* Quick Actions */}
        <Animatable.View animation="fadeIn" delay={500} style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action, index) => (
            <Animatable.View key={index} animation="fadeInLeft" delay={600 + index * 100}>
              <QuickActionCard {...action} />
            </Animatable.View>
          ))}
        </Animatable.View>

        {/* Recent Activity */}
        <Animatable.View animation="fadeIn" delay={800} style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivities.map((activity) => (
              <RecentActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        </Animatable.View>

        {/* Get Started Section */}
        <Animatable.View animation="fadeIn" delay={1000} style={styles.getStartedContainer}>
          <LinearGradient
            colors={colors.gradient.secondary}
            style={styles.getStartedGradient}
          >
            <Ionicons name="rocket" size={32} color={colors.background} />
            <Text style={styles.getStartedTitle}>Ready to Get Started?</Text>
            <Text style={styles.getStartedText}>
              Join clubs, attend events, and build meaningful connections
            </Text>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => navigation.navigate('Clubs')}
            >
              <Text style={styles.getStartedButtonText}>Explore Clubs</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    paddingTop: spacing.xl,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    ...typography.body,
    color: colors.background,
    opacity: 0.9,
  },
  userName: {
    ...typography.h1,
    color: colors.background,
  },
  profileButton: {
    padding: spacing.xs,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  statContent: {
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
  statGradient: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  statTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionCard: {
    marginBottom: spacing.sm,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  recentActivityContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  activityList: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    color: colors.text,
  },
  activityTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  getStartedContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 20,
    overflow: 'hidden',
  },
  getStartedGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  getStartedTitle: {
    ...typography.h2,
    color: colors.background,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  getStartedText: {
    ...typography.body,
    color: colors.background,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  getStartedButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  getStartedButtonText: {
    ...typography.body,
    color: colors.secondary,
    fontWeight: '600',
  },
});

export default HomeScreen;