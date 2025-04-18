import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import AppNavigator from "./navigation/AppNavigator"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import * as Notifications from "expo-notifications"
import { useEffect, useState, useCallback } from "react"
import { Provider as PaperProvider } from "react-native-paper"
import * as Font from 'expo-font'
import { Asset } from 'expo-asset'
import { View, Text, ActivityIndicator } from 'react-native'
import { preloadMerchantData } from "./api"
import { QueryClient, QueryClientProvider} from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            retry: false,
        }
    }
})

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    // Set up notification handler
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification)
    })

    return () => subscription.remove()
  }, [])

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
    <QueryClientProvider client={queryClient}>
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer>
            <AppNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
    </QueryClientProvider>
  )
}