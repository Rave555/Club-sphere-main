import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import useClubStore from "../../stores/clubStore";
import useAuthStore from "../../stores/authStore";
import Toast from "react-native-toast-message";
import { colors } from "../../utils/theme";

const MembershipRequestsScreen = () => {
  const {
    membershipRequests,
    getPendingMembershipRequests,
    approveMembershipRequest,
    rejectMembershipRequest,
  } = useClubStore();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      await getPendingMembershipRequests(token);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch pending requests.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleApprove = async (requestId) => {
    Alert.alert(
      "Approve Request",
      "Are you sure you want to approve this membership request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            await approveMembershipRequest(requestId, token);
            Toast.show({ type: "success", text1: "Request Approved" });
            fetchRequests(); // Refresh the list
          },
        },
      ]
    );
  };

  const handleReject = async (requestId) => {
    Alert.alert(
      "Reject Request",
      "Are you sure you want to reject this membership request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            await rejectMembershipRequest(requestId, token);
            Toast.show({ type: "info", text1: "Request Rejected" });
            fetchRequests(); // Refresh the list
          },
        },
      ]
    );
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <Text style={styles.userName}>
        {item.user?.userName || "Deleted User"}
      </Text>
      <Text style={styles.clubName}>
        Wants to join: {item.club?.clubName || "Deleted Club"}
      </Text>
      {item.requestMessage && (
        <Text style={styles.message}>"{item.requestMessage}"</Text>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.approveButton]}
          onPress={() => handleApprove(item._id)}
        >
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleReject(item._id)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      {!membershipRequests || membershipRequests.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No pending membership requests.</Text>
        </View>
      ) : (
        <FlatList
          data={membershipRequests || []}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backround },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  emptyText: { fontSize: 16, color: colors.textSecondary },
  requestCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userName: { fontSize: 18, fontWeight: "bold" },
  clubName: { fontSize: 16, color: "#444", marginTop: 4 },
  message: {
    fontStyle: "italic",
    color: "#666",
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    marginLeft: 10,
  },
  approveButton: { backgroundColor: "#28a745" },
  rejectButton: { backgroundColor: "#dc3545" },
  buttonText: { color: "white", fontWeight: "bold" },
});

export default MembershipRequestsScreen;
