import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, Region, UrlTile } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useComplaints } from '../../contexts/ComplaintContext';
import { locationService } from '../../services/locationService';
import { ComplaintCard } from '../../components/ui';
import { Colors, FontSizes, Spacing, BorderRadius } from '../../constants/theme';
import { Complaint, Location, ISSUE_CATEGORIES } from '../../types';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const NEARBY_RADIUS = 5000;
const IS_WEB = Platform.OS === 'web';

const DEFAULT_LOCATION: Location = {
  latitude: 28.6139,
  longitude: 77.2090,
  address: 'Connaught Place, New Delhi',
};

export default function NearbyIssuesScreen() {
  const { t } = useTranslation();
  const { complaints } = useComplaints();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location | null>(DEFAULT_LOCATION);
  const [nearbyComplaints, setNearbyComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const mapRef = React.useRef<MapView>(null);

  useFocusEffect(
    useCallback(() => {
      loadNearbyIssues();
    }, [])
  );

  const loadNearbyIssues = async () => {
    setLoading(true);
    try {
      const loc = await locationService.getCurrentLocation();
      const currentLoc = loc || DEFAULT_LOCATION;
      setUserLocation(currentLoc);

      const newRegion = {
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      setRegion(newRegion);

      // Filter complaints within 5km radius
      const nearby = complaints.filter((c) => {
        if (!c.latitude || !c.longitude) return false;
        const dist = locationService.calculateDistance(
          currentLoc.latitude,
          currentLoc.longitude,
          c.latitude,
          c.longitude
        );
        return dist <= NEARBY_RADIUS;
      });

      setNearbyComplaints(nearby.length > 0 ? nearby : complaints);
    } catch (err) {
      console.warn('Error loading nearby issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const found = ISSUE_CATEGORIES.find((cat) => cat.value === category);
    return found?.icon || '📋';
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Civic Issues</Text>
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons name="map" size={16} color={viewMode === 'map' ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={16} color={viewMode === 'list' ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching 5km nearby issue markers...</Text>
        </View>
      ) : viewMode === 'map' && !IS_WEB ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
          >
            <UrlTile
              urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
            />
            {nearbyComplaints.map((item) => (
              <Marker
                key={item.id}
                coordinate={{
                  latitude: item.latitude || region.latitude,
                  longitude: item.longitude || region.longitude,
                }}
                title={item.title}
                description={item.address}
                onPress={() => setSelectedComplaint(item)}
              >
                <View style={styles.markerContainer}>
                  <Text style={styles.markerIcon}>{getCategoryIcon(item.category)}</Text>
                </View>
              </Marker>
            ))}
          </MapView>

          {selectedComplaint && (
            <View style={styles.selectedCardOverlay}>
              <ComplaintCard
                complaint={selectedComplaint}
                onPress={() => setSelectedComplaint(null)}
              />
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={nearbyComplaints}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <ComplaintCard
              complaint={item}
              style={{ marginBottom: Spacing.md }}
              onPress={() => setSelectedComplaint(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: FontSizes.subtitle,
    fontWeight: '700',
    color: Colors.text,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: Colors.surface,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    elevation: 4,
  },
  markerIcon: {
    fontSize: 16,
  },
  selectedCardOverlay: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
  },
  listContainer: {
    padding: Spacing.md,
  },
});
