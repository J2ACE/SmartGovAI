import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/home/HomeScreen';
import CameraScreen from '../screens/report/CameraScreen';
import ComplaintsListScreen from '../screens/complaints/ComplaintsListScreen';
import NearbyIssuesScreen from '../screens/nearby/NearbyIssuesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Colors } from '../constants/theme';

export type MainTabParamList = {
  HomeTab: undefined;
  ReportTab: undefined;
  ComplaintsTab: undefined;
  NearbyTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      id="mainTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'ellipse-outline';

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'ReportTab') {
            iconName = 'camera';
          } else if (route.name === 'ComplaintsTab') {
            iconName = 'document-text';
          } else if (route.name === 'NearbyTab') {
            iconName = 'map';
          } else if (route.name === 'ProfileTab') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="ReportTab" component={CameraScreen} options={{ tabBarLabel: 'Report' }} />
      <Tab.Screen name="ComplaintsTab" component={ComplaintsListScreen} options={{ tabBarLabel: 'My Complaints' }} />
      <Tab.Screen name="NearbyTab" component={NearbyIssuesScreen} options={{ tabBarLabel: 'Nearby' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
