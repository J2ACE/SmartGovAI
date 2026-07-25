import { useEffect } from "react";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { ComplaintProvider } from "../src/contexts/ComplaintContext";
import { Colors } from "../src/constants/theme";
import "../src/i18n";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === "(auth)" || (segments[0] as string) === "login";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login" as any);
    } else if (isAuthenticated && (inAuthGroup || (segments.length as number) === 0)) {
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
      <Stack.Screen name="(report)" options={{ headerShown: false }} />
      <Stack.Screen name="complaints/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ComplaintProvider>
          <StatusBar style="auto" />
          <RootLayoutNav />
        </ComplaintProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
