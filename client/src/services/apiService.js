import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../config';

const BASE_URL = getApiUrl();

class ApiService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  async getToken() {
    return await AsyncStorage.getItem('token');
  }

  async makeRequest(endpoint, options = {}) {
    const token = await this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userName, email, password, college) {
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ userName, email, password, college }),
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  // Club endpoints
  async getAllClubs() {
    return this.makeRequest('/clubs/allClubs');
  }

  async createClub(clubData) {
    return this.makeRequest('/clubs/createClub', {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
  }

  async joinClub(clubId, requestMessage = '') {
    return this.makeRequest(`/clubs/join/${clubId}`, {
      method: 'POST',
      body: JSON.stringify({ requestMessage }),
    });
  }

  async getUserMembershipRequests() {
    return this.makeRequest('/clubs/my-requests');
  }

  async getPendingClubs() {
    return this.makeRequest('/clubs/pending');
  }

  async approveClub(clubId) {
    return this.makeRequest(`/clubs/approve/${clubId}`, {
      method: 'PUT',
    });
  }

  async rejectClub(clubId) {
    return this.makeRequest(`/clubs/reject/${clubId}`, {
      method: 'DELETE',
    });
  }

  async getPendingMembershipRequests() {
    return this.makeRequest('/clubs/membership-requests/pending');
  }

  async approveMembershipRequest(requestId) {
    return this.makeRequest(`/clubs/membership-requests/approve/${requestId}`, {
      method: 'PUT',
    });
  }

  async rejectMembershipRequest(requestId) {
    return this.makeRequest(`/clubs/membership-requests/reject/${requestId}`, {
      method: 'PUT',
    });
  }

  // Image upload (if needed)
  async uploadImage(imageUri) {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });

    const token = await this.getToken();
    
    try {
      const response = await fetch(`${this.baseURL}/upload/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new ApiService();