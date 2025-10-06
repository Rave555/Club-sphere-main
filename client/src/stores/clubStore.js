import { create } from "zustand";
import { getApiUrl } from "../../config";

const useClubStore = create((set, get) => ({
  clubs: [],
  myClubs: [],
  pendingClubs: [],
  membershipRequests: [],
  selectedClub: null,
  loading: false,
  loadingMyClubs: false,
  error: null,

  // Fetch user's joined clubs
  fetchMyClubs: async (token) => {
    try {
      set({ loadingMyClubs: true, error: null });

      if (!token) {
        set({
          loadingMyClubs: false,
          error: "No authentication token available",
        });
        return { success: false, error: "Authentication required" };
      }

      const response = await fetch(`${getApiUrl()}/clubs/my-clubs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        set({ myClubs: data.clubs || [], loadingMyClubs: false });
        return { success: true };
      } else {
        set({
          loadingMyClubs: false,
          error: data.message || "Failed to fetch user clubs",
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loadingMyClubs: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Get all approved clubs
  getAllClubs: async (token) => {
    try {
      set({ loading: true, error: null });

      if (!token) {
        set({ loading: false, error: "No authentication token available" });
        return { success: false, error: "Authentication required" };
      }

      const response = await fetch(`${getApiUrl()}/clubs/allClubs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        set({ clubs: data.clubs || [], loading: false });
        return { success: true };
      } else {
        set({ loading: false, error: data.message || "Failed to fetch clubs" });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Create a new club
  createClub: async (clubData, token) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`${getApiUrl()}/clubs/createClub`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clubData),
      });

      const data = await response.json();

      if (response.ok) {
        set({ loading: false });
        return { success: true, club: data.club };
      } else {
        set({ loading: false, error: data.message || "Failed to create club" });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Request to join a club
  requestMembership: async (clubId, token, requestMessage = "") => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`${getApiUrl()}/clubs/join/${clubId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        set({ loading: false });
        return { success: true };
      } else {
        set({
          loading: false,
          error: data.message || "Failed to request membership",
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Get user's membership requests
  getUserMembershipRequests: async (token) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`${getApiUrl()}/clubs/my-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        set({ membershipRequests: data.requests || [], loading: false });
        return { success: true };
      } else {
        set({
          loading: false,
          error: data.message || "Failed to fetch requests",
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Get pending clubs (admin only)
  getPendingClubs: async (token) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`${getApiUrl()}/clubs/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        set({ pendingClubs: data.clubs || [], loading: false });
        return { success: true };
      } else {
        set({
          loading: false,
          error: data.message || "Failed to fetch pending clubs",
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Approve club (admin only)
  approveClub: async (clubId, token) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`${getApiUrl()}/clubs/approve/${clubId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Update pending clubs
        const { pendingClubs } = get();
        set({
          pendingClubs: pendingClubs.filter((club) => club._id !== clubId),
          loading: false,
        });
        return { success: true };
      } else {
        set({
          loading: false,
          error: data.message || "Failed to approve club",
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Reject club (admin only)
  rejectClub: async (clubId, token) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`${getApiUrl()}/clubs/reject/${clubId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Remove from pending clubs
        const currentPending = get().pendingClubs;
        const updatedPending = currentPending.filter(
          (club) => club._id !== clubId
        );
        set({ pendingClubs: updatedPending, loading: false });
        return { success: true };
      } else {
        set({ loading: false, error: data.message || "Failed to reject club" });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Get pending membership requests (admin only)
  getPendingMembershipRequests: async (token) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(
        `${getApiUrl()}/clubs/membership-requests/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        set({ membershipRequests: data.requests || [], loading: false });
        return { success: true };
      } else {
        set({
          loading: false,
          error: data.message || "Failed to fetch membership requests",
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Approve membership request (admin only)
  approveMembershipRequest: async (requestId, token) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(
        `${getApiUrl()}/clubs/membership-requests/approve/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Remove from pending requests
        const currentRequests = get().membershipRequests;
        const updatedRequests = currentRequests.filter(
          (req) => req._id !== requestId
        );
        set({ membershipRequests: updatedRequests, loading: false });
        return { success: true };
      } else {
        set({
          loading: false,
          error: data.message || "Failed to approve membership request",
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Reject membership request (admin only)
  rejectMembershipRequest: async (requestId, token, rejectionReason = "") => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(
        `${getApiUrl()}/clubs/membership-requests/reject/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejectionReason }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Remove from pending requests
        const currentRequests = get().membershipRequests;
        const updatedRequests = currentRequests.filter(
          (req) => req._id !== requestId
        );
        set({ membershipRequests: updatedRequests, loading: false });
        return { success: true };
      } else {
        set({
          loading: false,
          error: data.message || "Failed to reject membership request",
        });
        return { success: false, error: data.message };
      }
    } catch (error) {
      set({ loading: false, error: "Network error" });
      return { success: false, error: "Network error" };
    }
  },

  // Set selected club
  setSelectedClub: (club) => set({ selectedClub: club }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      clubs: [],
      myClubs: [],
      pendingClubs: [],
      membershipRequests: [],
      selectedClub: null,
      loading: false,
      error: null,
    }),
}));

export default useClubStore;
