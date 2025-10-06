import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import Toast from "react-native-toast-message";

import useClubStore from "../../stores/clubStore";
import useAuthStore from "../../stores/authStore";
import { colors, spacing, typography } from "../../utils/theme";
import MembershipRequestsScreen from "./MembershipRequestsScreen"; // Import the new screen

const PendingClubCard = ({ club, onApprove, onReject }) => (
  <Animatable.View animation="fadeInUp" duration={600} style={styles.clubCard}>
    <LinearGradient
      colors={[colors.primary + "15", colors.secondary + "10"]}
      style={styles.cardGradient}
    >
      <View style={styles.cardHeader}>
        <View style={styles.clubIcon}>
          <Ionicons name="people" size={24} color={colors.primary} />
        </View>
        <View style={styles.clubInfo}>
          <Text style={styles.clubName} numberOfLines={1}>
            {club.clubName || "Club Name"}
          </Text>
          <Text style={styles.clubDescription} numberOfLines={2}>
            {club.clubDescription || "No description available"}
          </Text>
          <Text style={styles.createdBy}>
            Created by: {club.createdBy?.userName || "Unknown"}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => onReject(club)}
        >
          <Ionicons name="close" size={20} color={colors.error} />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => onApprove(club)}
        >
          <Ionicons name="checkmark" size={20} color={colors.success} />
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </Animatable.View>
);

const AdminScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("clubs");

  const { pendingClubs, loading, getPendingClubs, approveClub, rejectClub } =
    useClubStore();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token && user?.role === "admin") {
      loadData();
    }
  }, [token, user]);

  const loadData = async () => {
    await getPendingClubs(token);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApproveClub = async (club) => {
    Alert.alert(
      "Approve Club",
      `Are you sure you want to approve "${club.clubName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            const result = await approveClub(club._id, token);
            if (result.success) {
              Toast.show({
                type: "success",
                text1: "Club Approved!",
                text2: `${club.clubName} has been approved successfully.`,
              });
              loadData();
            } else {
              Toast.show({
                type: "error",
                text1: "Approval Failed",
                text2: result.error || "Failed to approve club",
              });
            }
          },
        },
      ]
    );
  };

  const handleRejectClub = async (club) => {
    Alert.alert(
      "Reject Club",
      `Are you sure you want to reject "${club.clubName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            const result = await rejectClub(club._id, token);
            if (result.success) {
              Toast.show({
                type: "success",
                text1: "Club Rejected",
                text2: `${club.clubName} has been rejected.`,
              });
              loadData();
            } else {
              Toast.show({
                type: "error",
                text1: "Rejection Failed",
                text2: result.error || "Failed to reject club",
              });
            }
          },
        },
      ]
    );
  };

  const renderTabButton = (tabName, label, icon, count) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tabName && styles.activeTabButton,
      ]}
      onPress={() => setActiveTab(tabName)}
    >
      <View style={styles.tabContent}>
        <Ionicons
          name={icon}
          size={20}
          color={activeTab === tabName ? colors.primary : colors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === tabName && styles.activeTabText,
          ]}
        >
          {label}
        </Text>
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={activeTab === "clubs" ? "people-outline" : "mail-outline"}
        size={64}
        color={colors.textSecondary}
      />
      <Text style={styles.emptyTitle}>
        {activeTab === "clubs" ? "No Pending Clubs" : "No Pending Requests"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === "clubs"
          ? "All clubs have been reviewed"
          : "All membership requests have been processed"}
      </Text>
    </View>
  );

  if (user?.role !== "admin") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color={colors.textSecondary} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You need admin privileges to access this screen.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <LinearGradient
          colors={colors.gradient.primary}
          style={styles.headerGradient}
        >
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>
            Manage clubs and membership requests
          </Text>
        </LinearGradient>
      </Animatable.View>

      {/* Tabs */}
      <Animatable.View
        animation="fadeIn"
        delay={300}
        style={styles.tabsContainer}
      >
        <View style={styles.tabs}>
          {renderTabButton(
            "clubs",
            "Pending Clubs",
            "people-outline",
            (pendingClubs || []).length
          )}
          {renderTabButton(
            "requests",
            "Membership Requests",
            "mail-outline",
            0 // Let the child screen manage its own count
          )}
        </View>
      </Animatable.View>

      {/* Content */}
      <Animatable.View animation="fadeInUp" delay={500} style={styles.content}>
        {activeTab === "clubs" ? (
          <FlatList
            data={pendingClubs}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <PendingClubCard
                club={item}
                onApprove={handleApproveClub}
                onReject={handleRejectClub}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <MembershipRequestsScreen />
        )}
      </Animatable.View>
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
  title: {
    ...typography.h1,
    color: colors.background,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.background + "CC",
    textAlign: "center",
  },
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xs,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTabButton: {
    backgroundColor: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.xs,
  },
  badgeText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  clubCard: {
    marginBottom: spacing.md,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardGradient: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  clubIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  clubDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  createdBy: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.error + "20",
    borderWidth: 1,
    borderColor: colors.error + "40",
  },
  rejectButtonText: {
    ...typography.button,
    color: colors.error,
    marginLeft: spacing.xs,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.success + "20",
    borderWidth: 1,
    borderColor: colors.success + "40",
  },
  approveButtonText: {
    ...typography.button,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  accessDeniedTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  accessDeniedText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  comingSoon: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});

export default AdminScreen;
