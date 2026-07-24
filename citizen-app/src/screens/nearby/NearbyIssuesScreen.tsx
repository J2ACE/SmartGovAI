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
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
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
const NEARBY_RADIUS = 5000; // 5km
const IS_WEB = Platform.OS === 'web';

export default function NearbyIssuesScreen() {
  const { t } = useTranslation();
  const { complaints } = useComplaints();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [nearbyComplaints, setNearbyComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const mapRef = React.useRef<MapView>(null);

  useFocusEffect(
    useCallback(() => {
      loadNearbyIssues();
    }, [])
  );

  const loadNearbyIssues = async () => {
    setLoading(true);
    try {
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          t('errors.locationPermission'),
          'Location permission is required to show nearby issues'
        );
        setLoading(false);
        return;
      }

      const location = await locationService.getCurrentLocation();
      setUserLocation(location);

      // Filter complaints within radius
      const nearby = complaints.filter((complaint: Complaint) => {
        if (!location) return false;
        const distance = locationService.calculateDistance(
          location.latitude,
          location.longitude,
          complaint.location.latitude,
          complaint.location.longitude
        );
        return distance <= NEARBY_RADIUS;
      });

      setNearbyComplaints(nearby);

      // Set map region
      if (location) {
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        });
      }
    } catch (error) {
      console.error('Error loading nearby issues:', error);
      Alert.alert('Error', 'Failed to load nearby issues');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    mapRef.current?.animateToRegion(
      {
        latitude: complaint.location.latitude,
        longitude: complaint.location.longitude,
        latitudeDelta: LATITUDE_DELTA / 2,
        longitudeDelta: LONGITUDE_DELTA / 2,
      },
      300
    );
  };

  const handleComplaintPress = (complaint: Complaint) => {
    // Navigate to complaint detail
    // router.push({ pathname: '/(tabs)/complaints/[id]', params: { id: complaint.id } });
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        },
        300
      );
    }
  };

  const getMarkerColor = (category: string) => {
    const categoryInfo = ISSUE_CATEGORIES.find((c: any) => c.value === category);
    return categoryInfo ? '#FF6B35' : '#1976D2';
  };

  const renderComplaintItem = ({ item }: { item: Complaint }) => {
    const distance = userLocation
      ? locationService.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.location.latitude,
          item.location.longitude
        )
      : 0;

    return (
      <View style={styles.complaintItem}>
        <ComplaintCard complaint={item} onPress={() => handleComplaintPress(item)} />
        <View style={styles.distanceContainer}>
          <Ionicons name="location" size={16} color={Colors.primary} />
          <Text style={styles.distanceText}>
            {distance < 1000
              ? `${Math.round(distance)}m ${t('nearby.away')}`
              : `${(distance / 1000).toFixed(1)}km ${t('nearby.away')}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewOnMapButton}
          onPress={() => handleMarkerPress(item)}
        >
          <Ionicons name="map" size={16} color={Colors.primary} />
          <Text style={styles.viewOnMapText}>{t('nearby.viewOnMap')}</Text>
        </TouchableOpacity>

        {/* Small Map Preview */}
        <View style={styles.smallMapContainer}>
          {IS_WEB ? (
            <View style={styles.webMapPlaceholder}>
              <Ionicons name="map-outline" size={32} color={Colors.textLight} />
              <Text style={styles.webMapSubtext}>Map preview on mobile</Text>
            </View>
          ) : (
            <MapView
              style={styles.smallMap}
              initialRegion={{
                latitude: item.location.latitude,
                longitude: item.location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              provider={PROVIDER_GOOGLE}
            >
              <Marker
                coordinate={{
                  latitude: item.location.latitude,
                  longitude: item.location.longitude,
                }}
                pinColor={getMarkerColor(item.category)}
              />
            </MapView>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('nearby.loadingMap')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        {IS_WEB ? (
          <View style={styles.webMapPlaceholder}>
            <Ionicons name="map" size={64} color={Colors.textLight} />
            <Text style={styles.webMapText}>
              Map view is available on mobile devices
            </Text>
            <Text style={styles.webMapSubtext}>
              {nearbyComplaints.length} nearby issues
            </Text>
          </View>
        ) : (
          region && (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={region}
              provider={PROVIDER_GOOGLE}
              showsUserLocation
              showsMyLocationButton={false}
            >
              {nearbyComplaints.map((complaint) => (
                <Marker
                  key={complaint.id}
                  coordinate={{
                    latitude: complaint.location.latitude,
                    longitude: complaint.location.longitude,
                  }}
                  pinColor={getMarkerColor(complaint.category)}
                  onPress={() => handleMarkerPress(complaint)}
                  title={ISSUE_CATEGORIES.find((c: any) => c.value === complaint.category)?.label}
                  description={complaint.description}
                />
              ))}
            </MapView>
          )
        )}

        {!IS_WEB && (
          <>
            {/* Center on User Button */}
            <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
              <Ionicons name="locate" size={24} color={Colors.primary} />
            </TouchableOpacity>

            {/* Issue Count Badge */}
            <View style={styles.countBadge}>
              <Ionicons name="location" size={20} color={Colors.textInverse} />
              <Text style={styles.countText}>{nearbyComplaints.length}</Text>
            </View>
          </>
        )}
      </View>

      {/* Issues List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{t('nearby.nearbyIssues')}</Text>
          <TouchableOpacity onPress={loadNearbyIssues}>
            <Ionicons name="refresh" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {nearbyComplaints.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>{t('nearby.noNearbyIssues')}</Text>
          </View>
        ) : (
          <FlatList
            data={nearbyComplaints}
            keyExtractor={(item) => item.id}
            renderItem={renderComplaintItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  mapContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
  },
  countBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
  },
  countText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textInverse,
    marginLeft: Spacing.xs,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  listContent: {
    padding: Spacing.md,
  },
  complaintItem: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    elevation: 2,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  distanceText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  viewOnMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  viewOnMapText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
  smallMapContainer: {
    height: 120,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  smallMap: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: Spacing.lg,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  webMapText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
