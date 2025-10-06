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

const ClubCard = ({ club, onPress, onJoin, isJoined }) => (
  <Animatable.View animation="fadeInUp" duration={600} style={styles.clubCard}>
    <TouchableOpacity onPress={() => onPress(club)} style={styles.cardContent}>
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
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.clubStats}>
            <View style={styles.statItem}>
              <Ionicons
                name="people-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.statText}>
                {club.members?.length || 0} members
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.joinButton, isJoined && styles.joinedButton]}
            onPress={() => onJoin(club)}
            disabled={isJoined}
          >
            <Text
              style={[
                styles.joinButtonText,
                isJoined && styles.joinedButtonText,
              ]}
            >
              {isJoined ? "Joined" : "Join"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </Animatable.View>
);

const ClubsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { clubs, loading, getAllClubs, requestMembership, membershipRequests } =
    useClubStore();
  const { token, user } = useAuthStore();

  useEffect(() => {
    console.log("ClubsScreen - Token:", token ? "Token exists" : "No token");
    console.log("ClubsScreen - User:", user ? "User exists" : "No user");
    if (token) {
      fetchClubs();
    }
  }, [token]);

  const fetchClubs = async () => {
    console.log(
      "fetchClubs - Token length:",
      token ? token.length : "No token"
    );
    console.log(
      "fetchClubs - Token starts with:",
      token ? token.substring(0, 20) + "..." : "No token"
    );
    const result = await getAllClubs(token);
    if (!result.success) {
      console.log("fetchClubs - Error:", result.error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.error || "Failed to fetch clubs",
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClubs();
    setRefreshing(false);
  };

  const handleJoinClub = async (club) => {
    Alert.alert("Join Club", `Do you want to request to join ${club.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Request",
        onPress: async () => {
          const result = await requestMembership(club._id, token);
          if (result.success) {
            Toast.show({
              type: "success",
              text1: "Request Sent",
              text2: "Your membership request has been sent for approval.",
            });
          } else {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: result.error || "Failed to send request",
            });
          }
        },
      },
    ]);
  };

  const isUserJoined = (club) => {
    return user?.club?.includes(club._id) || false;
  };

  const renderClub = ({ item, index }) => (
    <ClubCard
      club={item}
      onPress={() => navigation.navigate("ClubDetails", { clubId: item._id })}
      onJoin={handleJoinClub}
      isJoined={isUserJoined(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={colors.gradient.primary}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Discover Clubs</Text>
        <Text style={styles.headerSubtitle}>Find your community</Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("CreateClub")}
        >
          <Ionicons name="add" size={24} color={colors.background} />
          <Text style={styles.createButtonText}>Create Club</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderEmpty = () => (
    <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Clubs Found</Text>
      <Text style={styles.emptyText}>Be the first to create a club!</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate("CreateClub")}
      >
        <Text style={styles.emptyButtonText}>Create Club</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={clubs}
        renderItem={renderClub}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={[
          styles.listContainer,
          clubs.length === 0 && styles.emptyListContainer,
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
    marginBottom: spacing.lg,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  createButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  clubCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardContent: {
    borderRadius: 16,
    overflow: "hidden",
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
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  clubIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "15",
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
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clubStats: {
    flexDirection: "row",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.md,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  joinedButton: {
    backgroundColor: colors.success,
  },
  joinButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: "600",
  },
  joinedButtonText: {
    color: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
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
    fontWeight: "600",
  },
});

export default ClubsScreen;
