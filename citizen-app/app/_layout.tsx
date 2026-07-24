import { useEffect, useState } from "react";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { ComplaintProvider } from "../src/contexts/ComplaintContext";
import { Colors } from "../src/constants/theme";
import "../src/i18n"; // Initialize i18n

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === "(auth)" || (segments[0] as string) === "login";
    const inTabsGroup = (segments[0] as string) === "(tabs)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace("/login" as any);
    } else if (isAuthenticated && (inAuthGroup || (segments.length as number) === 0)) {
      // Redirect to home if authenticated and on auth screens
      router.replace("/(tabs)" as any);
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="(report)/camera" 
        options={{ 
          headerShown: false,
          presentation: "fullScreenModal",
        }} 
      />
      <Stack.Screen 
        name="(report)/form" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="(report)/duplicates" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="(report)/confirm" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="(report)/success" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ComplaintProvider>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </ComplaintProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
