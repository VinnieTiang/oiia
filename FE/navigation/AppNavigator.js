import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Ionicons } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native"

import WelcomeScreen from "../screens/WelcomeScreen"
import OnboardingScreen from "../screens/OnboardingScreen"
import MainChatScreen from "../screens/MainChatScreen"
import InsightScreen from "../screens/InsightScreen"
import AdviceScreen from "../screens/AdviceScreen"
import ProfileScreen from "../screens/ProfileScreen"
import InventoryScreen from "../screens/InventoryScreen"

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainChat" component={MainChatScreen} options={{ headerShown: false }} />

      <Stack.Screen
        name="Insight"
        component={InsightScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Business Insights",
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="Advice"
        component={AdviceScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Business Advice",
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="Inventory"
        component={InventoryScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Inventory Management",
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Profile",
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8 }}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  )
}
