import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

import useClubStore from "../../stores/clubStore";
import useAuthStore from "../../stores/authStore";
import { colors, spacing, typography } from "../../utils/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageCarouselRef = useRef(null);
  const autoScrollInterval = useRef(null);

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

  // Auto-scroll images effect
  useEffect(() => {
    if (club?.clubPhotos && club.clubPhotos.length > 1) {
      autoScrollInterval.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % club.clubPhotos.length;
          imageCarouselRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 4000); // Auto-scroll every 4 seconds

      return () => {
        if (autoScrollInterval.current) {
          clearInterval(autoScrollInterval.current);
        }
      };
    }
  }, [club?.clubPhotos]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentImageIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

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

  const renderImageCarousel = () => {
    if (!club?.clubPhotos || club.clubPhotos.length === 0) {
      return (
        <View style={styles.placeholderImageContainer}>
          <LinearGradient
            colors={colors.gradient.primary}
            style={styles.placeholderGradient}
          >
            <Ionicons name="images-outline" size={64} color={colors.background} />
            <Text style={styles.placeholderText}>No Images</Text>
          </LinearGradient>
        </View>
      );
    }

    return (
      <View style={styles.carouselContainer}>
        <FlatList
          ref={imageCarouselRef}
          data={club.clubPhotos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(item, index) => `image-${index}`}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.carouselImage}
              resizeMode="cover"
            />
          )}
        />
        {club.clubPhotos.length > 1 && (
          <View style={styles.paginationContainer}>
            {club.clubPhotos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
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
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </View>
        </TouchableOpacity>

        {/* Image Carousel */}
        <Animatable.View animation="fadeIn" duration={600}>
          {renderImageCarousel()}
        </Animatable.View>

        {/* Club Info */}
        <Animatable.View
          animation="fadeInUp"
          delay={200}
          style={styles.contentContainer}
        >
          <View style={styles.header}>
            <Text style={styles.clubName}>{club.clubName}</Text>
            {club.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{club.category}</Text>
              </View>
            )}
          </View>

          {club.location && (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.textSecondary}
              />
              <Text style={styles.locationText}>{club.location}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{club.clubDescription}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{club.memberCount || 0}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="person-outline" size={24} color={colors.secondary} />
              <Text style={styles.statText}>{club.createdBy?.userName || "N/A"}</Text>
              <Text style={styles.statLabel}>Created By</Text>
            </View>
          </View>

          <View style={styles.footer}>
            {club.isUserMember ? (
              <Animatable.View
                animation="bounceIn"
                style={styles.memberBadge}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.success}
                />
                <Text style={styles.memberText}>You are a member</Text>
              </Animatable.View>
            ) : (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinRequest}
                disabled={storeLoading}
              >
                <LinearGradient
                  colors={colors.gradient.secondary}
                  style={styles.joinButtonGradient}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color={colors.background}
                  />
                  <Text style={styles.joinButtonText}>Request to Join</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animatable.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: colors.background,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: spacing.md,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  carouselContainer: {
    height: 300,
    position: "relative",
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  placeholderImageContainer: {
    height: 300,
  },
  placeholderGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    ...typography.h3,
    color: colors.background,
    marginTop: spacing.sm,
  },
  paginationContainer: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  paginationDotActive: {
    width: 24,
    opacity: 1,
  },
  contentContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  clubName: { 
    ...typography.h1, 
    color: colors.text,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary + "20",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  locationText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  detailsContainer: { 
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  joinButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  joinButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  joinButtonText: { 
    ...typography.h3, 
    color: colors.background,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    backgroundColor: colors.success + "20",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.success + "40",
  },
  memberText: {
    ...typography.h3,
    color: colors.success,
    marginLeft: spacing.sm,
  },
  errorText: { 
    ...typography.body, 
    color: colors.error 
  },
});

export default ClubDetailsScreen;
