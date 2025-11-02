import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';

import useAuthStore from '../../stores/authStore';
import useClubStore from '../../stores/clubStore';
import { colors, spacing, typography } from '../../utils/theme';

const ProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  
  const { user, logout, updateUser } = useAuthStore();
  const { myClubs, reset: resetClubStore } = useClubStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            resetClubStore();
            Toast.show({
              type: 'success',
              text1: 'Logged Out',
              text2: 'You have been successfully logged out.',
            });
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    if (editedName.trim() && editedName.trim() !== user.userName) {
      updateUser({ userName: editedName.trim() });
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully.',
      });
    }
    setIsEditing(false);
  };

  const handleEditProfile = () => {
    setEditedName(user.userName);
    setIsEditing(true);
  };

  const profileOptions = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      color: colors.primary,
      onPress: handleEditProfile,
    },
    {
      icon: 'people-outline',
      title: 'My Clubs',
      subtitle: `Member of ${myClubs.length || 0} clubs`,
      color: colors.secondary,
      onPress: () => navigation.navigate('MyClubs'),
    },
    {
      icon: 'calendar-outline',
      title: 'Catchup Events',
      subtitle: 'View your upcoming events',
      color: colors.accent,
      onPress: () => navigation.navigate('Events'),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences and privacy',
      color: colors.textSecondary,
      onPress: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Settings feature will be available soon!',
        });
      },
    },
    {
      icon: 'people',
      title: 'Know the Developers',
      subtitle: 'Meet the team behind ClubSphere',
      color: colors.warning,
      onPress: () => {
        navigation.navigate("About");
      },
    },
  ];

  const getUserRole = () => {
    switch (user?.role) {
      case 'admin':
        return { text: 'Administrator', color: colors.error, icon: 'shield-checkmark' };
      case 'clubadmin':
        return { text: 'Club Admin', color: colors.warning, icon: 'person-add' };
      default:
        return { text: 'Member', color: colors.success, icon: 'person' };
    }
  };

  const roleInfo = getUserRole();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={48} color={colors.background} />
                </View>
                <View style={[styles.roleBadge, { backgroundColor: roleInfo.color }]}>
                  <Ionicons name={roleInfo.icon} size={12} color={colors.background} />
                </View>
              </View>
              
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Enter your name"
                    placeholderTextColor={colors.background + '80'}
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => setIsEditing(false)}
                    >
                      <Ionicons name="close" size={20} color={colors.background} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleSaveProfile}
                    >
                      <Ionicons name="checkmark" size={20} color={colors.background} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user?.userName || 'User'}</Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                  <View style={styles.roleContainer}>
                    <View style={[styles.roleTag, { backgroundColor: roleInfo.color + '20' }]}>
                      <Ionicons name={roleInfo.icon} size={14} color={roleInfo.color} />
                      <Text style={[styles.roleText, { color: roleInfo.color }]}>
                        {roleInfo.text}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animatable.View>

        {/* Stats Section */}
        <Animatable.View animation="fadeIn" delay={300} style={styles.statsSection}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{myClubs.length || 0}</Text>
              <Text style={styles.statLabel}>Clubs Joined</Text>
            </View>
            <View style={styles.statDivider} />
            {/* <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Events Attended</Text>
            </View>
            <View style={styles.statDivider} /> */}
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
          </View>
        </Animatable.View>

        {/* Profile Options */}
        <Animatable.View animation="fadeIn" delay={500} style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Profile Options</Text>
          {profileOptions.map((option, index) => (
            <Animatable.View 
              key={index} 
              animation="fadeInLeft" 
              delay={600 + index * 100}
              style={styles.optionCard}
            >
              <TouchableOpacity onPress={option.onPress} style={styles.optionContent}>
                <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
                  <Ionicons name={option.icon} size={20} color={option.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </Animatable.View>

        {/* Admin Panel (if admin) */}
        {user?.role === 'admin' && (
          <Animatable.View animation="fadeIn" delay={800} style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Admin Panel</Text>
            <View style={styles.adminCard}>
              <LinearGradient
                colors={[colors.error + '15', colors.error + '08']}
                style={styles.adminGradient}
              >
                <Ionicons name="shield-checkmark" size={32} color={colors.error} />
                <Text style={styles.adminTitle}>Administrator Access</Text>
                <Text style={styles.adminText}>
                  You have admin privileges to manage clubs and users
                </Text>
                <TouchableOpacity
                  style={styles.adminButton}
                  onPress={() => navigation.navigate("Admin")}
                >
                  <Text style={styles.adminButtonText}>Open Admin Panel</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Animatable.View>
        )}

        {/* Logout Section */}
        <Animatable.View animation="fadeIn" delay={1000} style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>ClubSphere v1.0.0</Text>
        </View>
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
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  userInfo: {
    alignItems: 'center',
  },
  editContainer: {
    alignItems: 'center',
    width: '100%',
  },
  editInput: {
    ...typography.h2,
    color: colors.background,
    backgroundColor: colors.background + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: spacing.sm,
    minWidth: 200,
  },
  editButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    backgroundColor: colors.background + '20',
    padding: spacing.sm,
    borderRadius: 20,
  },
  userName: {
    ...typography.h1,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.background,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  roleContainer: {
    alignItems: 'center',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  roleText: {
    ...typography.caption,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.outline,
    marginHorizontal: spacing.sm,
  },
  optionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  optionCard: {
    marginBottom: spacing.sm,
  },
  optionContent: {
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
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  optionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  adminSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  adminCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  adminGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  adminTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  adminText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  adminButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  adminButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  logoutSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '15',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error + '30',
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  versionInfo: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  versionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default ProfileScreen;