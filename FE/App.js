import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import AppNavigator from "./navigation/AppNavigator"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import * as Notifications from "expo-notifications"
import * as Linking from "expo-linking";
import { useEffect, useState, useCallback } from "react"
import { Provider as PaperProvider } from "react-native-paper"
import * as Font from 'expo-font'
import { Asset } from 'expo-asset'
import { View, Text, ActivityIndicator } from 'react-native'
import { fetchInsights, preloadMerchantData } from "./api"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fetchInventoryData } from "./api"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            retry: false,
        }
    }
})

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [appIsReady, setAppIsReady] = useState(false)
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    // Set up notification handler
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
    })

    return () => subscription.remove()
  }, [])

  useEffect(() => {
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Listen for notification responses (when user clicks the notification)
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen && navigationRef.isReady()) {
        navigationRef.navigate(screen); // Navigate to the specified screen
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const fetchAndCheckInventory = async () => {
      try {
        const data = await fetchInventoryData();
        setInventory(data);
  
        // Check for low stock items with daysLeft <= 3
        const lowStockItems = data.filter((item) => item.daysLeft <= 3);
        if (lowStockItems.length > 0) {
          // Create a single notification message for all low-stock items
          const notificationBody = lowStockItems
            .map((item) => `- ${item.name}: ${item.daysLeft} days left`)
            .join("\n");
  
          const message = `⚠️ Low Stock Alert ⚠️\n${notificationBody}\n📦 Click to restock!`;
  
          // Send a single notification
          await Notifications.scheduleNotificationAsync({
            content: {
              body: message,
              data: { screen: "Inventory" }, // Navigate to InventoryScreen
            },
            trigger: null, // Trigger immediately
          });
        }
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      }
    };
  
    // Fetch inventory data periodically (e.g., every 1 hour)
    const interval = setInterval(fetchAndCheckInventory, 3600000); // 1 hour
    fetchAndCheckInventory(); // Run immediately on mount
  
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          // Add any custom fonts here, for example:
          // 'OpenSans-Regular': require('./assets/fonts/OpenSans-Regular.ttf'),
        })

        // Pre-load images
        await Asset.loadAsync([
          require("./assets/adaptive-icon.png"),
          require("./assets/chart-preview.jpg"),
          require("./assets/chat-icon.png"),
          require("./assets/favicon.png"),
          require("./assets/icon.png"),
          require("./assets/logo-placeholder.png"),
          require("./assets/mascot-avatar.png"),
          require("./assets/mascot-avatar2.png"),
          require("./assets/mascot-avatar3.png"),
          require("./assets/profile-placeholder.png"),
          require("./assets/profile-placeholder1.png"),
          require("./assets/profile-placeholder2.png"),
          require("./assets/profile-placeholder3.png"),
          require("./assets/splash-icon.png")
        ])

        await preloadMerchantData()

        // Artificially delay for two seconds to simulate a long loading
        // Remove this in production
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (e) {
        console.warn(e)
      } finally {
        // Tell the application to render
        setAppIsReady(true)
      }
    }

    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2FAE60" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Grablet...</Text>
      </View>
    )
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <SafeAreaProvider>
            <PaperProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </PaperProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </NavigationContainer>
  );
}