import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import useClubStore from "../stores/clubStore";
import useAuthStore from "../stores/authStore";
import { colors, spacing, typography } from "../utils/theme";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";

const ClubItem = ({ club, onPress }) => (
  <TouchableOpacity style={styles.clubCard} onPress={onPress}>
    <View style={styles.cardContent}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="people-circle-outline"
          size={32}
          color={colors.primary}
        />
      </View>
      <View style={styles.clubInfo}>
        <Text style={styles.clubName}>{club.clubName}</Text>
        <Text style={styles.memberCount}>{club.memberCount} members</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </View>
  </TouchableOpacity>
);

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="sad-outline" size={64} color={colors.textSecondary} />
    <Text style={styles.emptyTitle}>No Clubs Joined</Text>
    <Text style={styles.emptySubtitle}>
      Explore clubs and send a request to join!
    </Text>
  </View>
);

const MyClubsScreen = () => {
  const navigation = useNavigation();
  // We will create fetchMyClubs and myClubs in the store
  const { myClubs, fetchMyClubs, loadingMyClubs } = useClubStore();
  const { token } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token) {
      fetchMyClubs(token);
    }
  }, [token]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (token) {
      await fetchMyClubs(token);
    }
    setRefreshing(false);
  }, [token, fetchMyClubs]);

  const handleClubPress = (club) => {
    // Navigate to the ClubDetailsScreen when a club is pressed
    navigation.navigate("ClubDetails", { clubId: club._id });
  };

  if (loadingMyClubs && !refreshing) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.header}>
              <LinearGradient
                colors={colors.gradient.primary}
                style={styles.headerGradient}
              >
                <Text style={styles.title}>My Clubs</Text>
                <Text style={styles.subtitle}>
                  Explore your joined clubs and stay connected!
                </Text>
              </LinearGradient>
            </Animatable.View>
      <FlatList
        data={myClubs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          // Add a check to prevent rendering if the item is null or undefined
          if (!item) return null;

          return <ClubItem club={item} onPress={() => handleClubPress(item)} />;
        }}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
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
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  clubCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    ...typography.h3,
    color: colors.text,
  },
  memberCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: { ...typography.h2, color: colors.text, marginTop: spacing.md },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyClubsScreen;
