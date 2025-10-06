import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import useClubStore from "../../stores/clubStore";
import useAuthStore from "../../stores/authStore";
import { colors, spacing, typography } from "../../utils/theme";

const ClubDetailsScreen = ({ route, navigation }) => {
  const { clubId } = route.params;
  const { token } = useAuthStore();

  // Get clubs from the store
  const {
    clubs,
    myClubs,
    getClubById,
    requestMembership,
    loading: storeLoading,
  } = useClubStore();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const findClub = useCallback(() => {
    // Prioritize finding the club in the main `clubs` list, then `myClubs`
    let foundClub = clubs.find((c) => c._id === clubId);
    if (!foundClub) {
      foundClub = myClubs.find((c) => c._id === clubId);
    }
    return foundClub;
  }, [clubs, myClubs, clubId]);

  const fetchClubDetails = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getClubById(clubId, token);
      if (result.success) {
        setClub(result.club);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Could not fetch club details.",
        });
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred.",
      });
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [clubId, token, getClubById, navigation]);

  useEffect(() => {
    const foundClub = findClub();
    if (foundClub) {
      setClub(foundClub);
      setLoading(false);
    } else {
      // If not found in store, fetch from API
      fetchClubDetails();
    }
  }, [clubId, findClub, fetchClubDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClubDetails();
  };

  const handleJoinRequest = async () => {
    Alert.alert(
      "Confirm Membership Request",
      `Do you want to request to join ${club.clubName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: async () => {
            const result = await requestMembership(club._id, token);
            if (result.success) {
              Toast.show({
                type: "success",
                text1: "Request Sent!",
                text2: `Your request to join ${club.clubName} is pending approval.`,
              });
              // Optionally refresh data
              fetchClubDetails();
            } else {
              Toast.show({
                type: "error",
                text1: "Request Failed",
                text2: result.error || "Could not send membership request.",
              });
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!club) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Club not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.clubName}>{club.clubName}</Text>
        <Text style={styles.createdBy}>
          Created by: {club.createdBy?.userName || "N/A"}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.description}>{club.clubDescription}</Text>
        <View style={styles.infoBox}>
          <Ionicons name="people" size={24} color={colors.primary} />
          <Text style={styles.infoText}>{club.memberCount || 0} Members</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {club.isUserMember ? (
          <View style={styles.memberBadge}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.success}
            />
            <Text style={styles.memberText}>You are a member</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinRequest}
            disabled={storeLoading}
          >
            <Text style={styles.joinButtonText}>Request to Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: spacing.lg, backgroundColor: colors.surface },
  clubName: { ...typography.h1, color: colors.text },
  createdBy: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  detailsContainer: { padding: spacing.lg },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
  },
  infoText: { ...typography.h3, color: colors.text, marginLeft: spacing.md },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  joinButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: { ...typography.button, color: "#fff" },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.success + "20",
    borderRadius: 8,
  },
  memberText: {
    ...typography.h3,
    color: colors.success,
    marginLeft: spacing.sm,
  },
  errorText: { ...typography.body, color: colors.error },
});

export default ClubDetailsScreen;
