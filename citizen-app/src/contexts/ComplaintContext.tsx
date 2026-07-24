import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Complaint, NearbyComplaint, IssueCategory, Location } from '../types';
import { api } from '../services/api';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';

interface ComplaintContextType {
  complaints: Complaint[];
  isLoading: boolean;
  error: string | null;
  currentComplaint: Complaint | null;
  nearbyComplaints: NearbyComplaint[];
  
  // Actions
  fetchMyComplaints: () => Promise<void>;
  fetchComplaintById: (id: string) => Promise<Complaint | null>;
  createComplaint: (data: CreateComplaintData) => Promise<{ success: boolean; complaint?: Complaint; error?: string }>;
  checkNearbyComplaints: (location: Location, category?: IssueCategory) => Promise<NearbyComplaint[]>;
  supportExistingComplaint: (complaintId: string) => Promise<boolean>;
  upvoteComplaint: (complaintId: string) => Promise<boolean>;
  submitFeedback: (complaintId: string, satisfied: boolean, comment?: string, rating?: number) => Promise<boolean>;
  setCurrentComplaint: (complaint: Complaint | null) => void;
  clearNearbyComplaints: () => void;
  syncOffline: () => Promise<void>;
}

interface CreateComplaintData {
  category: IssueCategory;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  location: Location;
  imageUri: string;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(null);
  const [nearbyComplaints, setNearbyComplaints] = useState<NearbyComplaint[]>([]);

  // Fetch user's complaints on mount
  useEffect(() => {
    if (user) {
      fetchMyComplaints();
    }
  }, [user]);

  const fetchMyComplaints = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getMyComplaints(user.id);
      if (response.success && response.data) {
        setComplaints(response.data);
        await storage.setComplaints(response.data);
      } else {
        // Try to load from local storage
        const localComplaints = await storage.getComplaints();
        setComplaints(localComplaints);
      }
    } catch (err) {
      // Load from local storage on error
      const localComplaints = await storage.getComplaints();
      setComplaints(localComplaints);
      setError('Failed to fetch complaints. Showing cached data.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchComplaintById = useCallback(async (id: string): Promise<Complaint | null> => {
    try {
      const response = await api.getComplaintById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      // Try local storage
      const localComplaints = await storage.getComplaints();
      return localComplaints.find(c => c.id === id) || null;
    }
  }, []);

  const createComplaint = useCallback(async (data: CreateComplaintData) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.createComplaint({
        ...data,
        citizenId: user.id,
        beforeImages: [data.imageUri],
        afterImages: [],
      });

      if (response.success && response.data) {
        setComplaints(prev => [response.data!, ...prev]);
        return { success: true, complaint: response.data };
      }
      
      return { success: false, error: response.error || 'Failed to create complaint' };
    } catch (err) {
      // Save to offline queue
      await storage.addToOfflineQueue({
        ...data,
        citizenId: user.id,
        beforeImages: [data.imageUri],
        afterImages: [],
      });
      
      return { 
        success: true, 
        error: 'Saved offline. Will sync when connected.',
      };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const checkNearbyComplaints = useCallback(async (
    location: Location,
    category?: IssueCategory
  ): Promise<NearbyComplaint[]> => {
    try {
      const response = await api.getNearbyComplaints(
        location.latitude,
        location.longitude,
        100, // 100 meters radius
        category
      );

      if (response.success && response.data) {
        setNearbyComplaints(response.data);
        return response.data;
      }
      return [];
    } catch (err) {
      console.error('Error checking nearby complaints:', err);
      return [];
    }
  }, []);

  const supportExistingComplaint = useCallback(async (complaintId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await api.supportComplaint(complaintId, user.id);
      if (response.success) {
        // Update local state
        setComplaints(prev => 
          prev.map(c => c.id === complaintId ? response.data! : c)
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error supporting complaint:', err);
      return false;
    }
  }, [user]);

  const upvoteComplaint = useCallback(async (complaintId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await api.upvoteComplaint(complaintId, user.id);
      if (response.success) {
        setComplaints(prev =>
          prev.map(c => c.id === complaintId ? response.data! : c)
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error upvoting complaint:', err);
      return false;
    }
  }, [user]);

  const submitFeedback = useCallback(async (
    complaintId: string,
    satisfied: boolean,
    comment?: string,
    rating?: number
  ): Promise<boolean> => {
    try {
      const response = await api.submitFeedback(complaintId, satisfied, comment, rating);
      if (response.success) {
        setComplaints(prev =>
          prev.map(c => c.id === complaintId ? response.data! : c)
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error submitting feedback:', err);
      return false;
    }
  }, []);

  const clearNearbyComplaints = useCallback(() => {
    setNearbyComplaints([]);
  }, []);

  const syncOffline = useCallback(async () => {
    try {
      const result = await api.syncOfflineComplaints();
      if (result.success) {
        await fetchMyComplaints();
      }
    } catch (err) {
      console.error('Error syncing offline complaints:', err);
    }
  }, [fetchMyComplaints]);

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        isLoading,
        error,
        currentComplaint,
        nearbyComplaints,
        fetchMyComplaints,
        fetchComplaintById,
        createComplaint,
        checkNearbyComplaints,
        supportExistingComplaint,
        upvoteComplaint,
        submitFeedback,
        setCurrentComplaint,
        clearNearbyComplaints,
        syncOffline,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
