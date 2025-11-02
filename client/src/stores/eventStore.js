import { create } from 'zustand';
import { getApiUrl } from '../../config';

const useEventStore = create((set, get) => ({
  events: [],
  loading: false,
  error: null,
  initialized: false,

  // Get all events for a club 
  getAllEvents: async (token) => {
    try {
      set({ loading: true, error: null });

      if(!token) {
        set({ loading: false, error: "No authentication token available" });
        return { success: false, error: "Authentication required" };
      }
      
      const response = await fetch(`${getApiUrl()}/events/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        set({ events: data.events, loading: false });
        return { success: true };
      } else {
        set({ loading: false, error: data.error || 'Failed to fetch events' });
        return { success: false, error: data.error || 'Failed to fetch events' };
      }
    } catch (error) {
      set({ loading: false, error: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  },

  // Create a new event
  createEvent: async (eventData, token) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch(`${getApiUrl()}/events/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });
      const data = await response.json();

      if(response.ok) {
        const { events } = get();
        set({ events: [...events, data.event], loading: false });
        return { success: true, event: data.event };
      }else{
        set({ loading: false, error: data.error || 'Failed to create event' });
        return { success: false, error: data.error || 'Failed to create event'}
      }
    } catch (error) {
      set({ loading: false, error: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  },

  // Initialize store
  initializeStore: async (token) => {
    if (!token || get().initialized) return;
    
    try {
      set({ loading: true });
      
      await Promise.all([
        get().getAllEvents(token)
      ]);
      
      set({ initialized: true });
    } catch (error) {
      console.error('Failed to initialize event store:', error);
    }
  },


  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    events: [],
    loading: false,
    error: null,
    initialized: false,
  }),
}));

export default useEventStore;