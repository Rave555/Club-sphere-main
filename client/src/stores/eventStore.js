import { create } from 'zustand';
import { getApiUrl } from '../../config';

const useEventStore = create((set, get) => ({
  events: [],
  myEvents: [],
  selectedEvent: null,
  loading: false,
  error: null,

  // Get all events for a club
  getClubEvents: async (clubId, token) => {
    try {
      set({ loading: true, error: null });
      
      // When events API is implemented, use:
      // const response = await fetch(`${getApiUrl()}/events/club/${clubId}`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      
      // For now, return mock data
      const mockEvents = [
        {
          _id: '1',
          title: 'Tech Talk: AI in Modern Development',
          description: 'Join us for an exciting discussion about AI technologies',
          date: new Date('2024-10-15'),
          location: 'Conference Room A',
          clubId: clubId,
          attendees: [],
        },
        {
          _id: '2',
          title: 'Coding Bootcamp',
          description: 'Intensive coding session for beginners',
          date: new Date('2024-10-20'),
          location: 'Lab 101',
          clubId: clubId,
          attendees: [],
        },
      ];
      
      set({ events: mockEvents, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false, error: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  },

  // Create a new event
  createEvent: async (eventData, token) => {
    try {
      set({ loading: true, error: null });
      
      // When events API is implemented, use:
      // const response = await fetch(`${getApiUrl()}/events`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(eventData)
      // });
      
      // Mock event creation for now
      const newEvent = {
        _id: Date.now().toString(),
        ...eventData,
        createdAt: new Date(),
        attendees: [],
      };
      
      const { events } = get();
      set({ 
        events: [...events, newEvent],
        loading: false 
      });
      
      return { success: true, event: newEvent };
    } catch (error) {
      set({ loading: false, error: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  },

  // Join an event
  joinEvent: async (eventId, token) => {
    try {
      set({ loading: true, error: null });
      
      // Mock join event
      const { events } = get();
      const updatedEvents = events.map(event => {
        if (event._id === eventId) {
          return {
            ...event,
            attendees: [...event.attendees, 'currentUserId'],
          };
        }
        return event;
      });
      
      set({ events: updatedEvents, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false, error: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  },

  // Get user's events
  getUserEvents: async (token) => {
    try {
      set({ loading: true, error: null });
      
      // Mock user events
      const mockUserEvents = [
        {
          _id: '1',
          title: 'Tech Talk: AI in Modern Development',
          description: 'Join us for an exciting discussion about AI technologies',
          date: new Date('2024-10-15'),
          location: 'Conference Room A',
          clubId: 'club1',
          attendees: ['currentUserId'],
        },
      ];
      
      set({ myEvents: mockUserEvents, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false, error: 'Network error' });
      return { success: false, error: 'Network error' };
    }
  },

  // Set selected event
  setSelectedEvent: (event) => set({ selectedEvent: event }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    events: [],
    myEvents: [],
    selectedEvent: null,
    loading: false,
    error: null,
  }),
}));

export default useEventStore;