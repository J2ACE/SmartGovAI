import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Complaint, User, Notification } from '../types';

const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'auth_token',
  COMPLAINTS: 'complaints',
  OFFLINE_QUEUE: 'offline_queue',
  NOTIFICATIONS: 'notifications',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETE: 'onboarding_complete',
};

// Secure storage for sensitive data with graceful fallback
export const secureStorage = {
  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
    } catch (e) {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const res = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      if (res) return res;
    } catch (e) {}
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    } catch (e) {}
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
  },
};

// Regular storage for non-sensitive data
export const storage = {
  // Token Aliases
  async saveToken(token: string): Promise<void> {
    await secureStorage.setToken(token);
  },
  async getToken(): Promise<string | null> {
    return await secureStorage.getToken();
  },

  // User
  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  async saveUser(user: User): Promise<void> {
    await this.setUser(user);
  },

  async getUser(): Promise<User | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Complaints cache
  async setComplaints(complaints: Complaint[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  },

  async getComplaints(): Promise<Complaint[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    return data ? JSON.parse(data) : [];
  },

  async addComplaint(complaint: Complaint): Promise<void> {
    const complaints = await this.getComplaints();
    complaints.unshift(complaint);
    await this.setComplaints(complaints);
  },

  async clearAll(): Promise<void> {
    await secureStorage.removeToken();
    await this.removeUser();
    await AsyncStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
  },
};
