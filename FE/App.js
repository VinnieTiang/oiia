import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import AppNavigator from "./navigation/AppNavigator"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import * as Notifications from "expo-notifications"
import { useEffect } from "react"

export default function App() {
  useEffect(() => {
    // Set up notification handler
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
