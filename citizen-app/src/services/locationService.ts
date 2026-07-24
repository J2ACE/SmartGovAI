import * as Location from 'expo-location';
import { Location as LocationType } from '../types';

export const locationService = {
  // Request location permissions
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  // Get current location
  async getCurrentLocation(): Promise<LocationType | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  },

  // Reverse geocode to get address
  async reverseGeocode(latitude: number, longitude: number): Promise<Partial<LocationType>> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const result = results[0];
        const addressParts = [
          result.streetNumber,
          result.street,
          result.district,
          result.subregion,
        ].filter(Boolean);

        return {
          address: addressParts.join(', ') || result.name || 'Unknown address',
          area: result.district || result.subregion || '',
          city: result.city || result.region || '',
          state: result.region || '',
          pincode: result.postalCode || '',
        };
      }

      return {};
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return {};
    }
  },

  // Get full location with address
  async getFullLocation(): Promise<LocationType | null> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) return null;

      const addressInfo = await this.reverseGeocode(location.latitude, location.longitude);

      return {
        ...location,
        ...addressInfo,
      };
    } catch (error) {
      console.error('Error getting full location:', error);
      return null;
    }
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  },

  // Format distance for display
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
  },

  // Check if location is within radius
  isWithinRadius(
    centerLat: number,
    centerLon: number,
    pointLat: number,
    pointLon: number,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(centerLat, centerLon, pointLat, pointLon);
    return distance <= radiusMeters;
  },
};
