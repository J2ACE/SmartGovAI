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

// Secure storage for sensitive data
export const secureStorage = {
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
  },
};

// Regular storage for non-sensitive data
export const storage = {
  // User
  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
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

  async updateComplaint(updatedComplaint: Complaint): Promise<void> {
    const complaints = await this.getComplaints();
    const index = complaints.findIndex((c) => c.id === updatedComplaint.id);
    if (index !== -1) {
      complaints[index] = updatedComplaint;
      await this.setComplaints(complaints);
    }
  },

  // Offline queue for syncing later
  async addToOfflineQueue(complaint: Partial<Complaint>): Promise<void> {
    const queue = await this.getOfflineQueue();
    queue.push({ ...complaint });
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  },

  async getOfflineQueue(): Promise<Partial<Complaint>[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return data ? JSON.parse(data) : [];
  },

  async clearOfflineQueue(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  },

  async removeFromOfflineQueue(offlineId: string): Promise<void> {
    const queue = await this.getOfflineQueue();
    const filtered = queue.filter((item: any) => item.offlineId !== offlineId);
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(filtered));
  },

  // Notifications
  async setNotifications(notifications: Notification[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  async getNotifications(): Promise<Notification[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  },

  async addNotification(notification: Notification): Promise<void> {
    const notifications = await this.getNotifications();
    notifications.unshift(notification);
    await this.setNotifications(notifications);
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    const notifications = await this.getNotifications();
    const notification = notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.setNotifications(notifications);
    }
  },

  // Language preference
  async setLanguage(language: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  async getLanguage(): Promise<string> {
    const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return language || 'en';
  },

  // Onboarding
  async setOnboardingComplete(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
  },

  async isOnboardingComplete(): Promise<boolean> {
    const complete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return complete === 'true';
  },

  // Clear all data (for logout)
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER,
      STORAGE_KEYS.COMPLAINTS,
      STORAGE_KEYS.NOTIFICATIONS,
    ]);
    await secureStorage.removeToken();
  },
};
