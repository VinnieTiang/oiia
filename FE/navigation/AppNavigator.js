import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"

import WelcomeScreen from "../screens/WelcomeScreen"
import OnboardingScreen from "../screens/OnboardingScreen"
import HomeScreen from "../screens/HomeScreen"
import ChatScreen from "../screens/ChatScreen"
import InsightScreen from "../screens/InsightScreen"
import AdviceScreen from "../screens/AdviceScreen"
import ProfileScreen from "../screens/ProfileScreen"
import InventoryScreen from "../screens/InventoryScreen"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Chat") {
            iconName = focused ? "chatbubble" : "chatbubble-outline"
          } else if (route.name === "Insight") {
            iconName = focused ? "bar-chart" : "bar-chart-outline"
          } else if (route.name === "Advice") {
            iconName = focused ? "bulb" : "bulb-outline"
          } else if (route.name === "Inventory") {
            iconName = focused ? "cube" : "cube-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#2FAE60", // Grab-inspired green
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Insight" component={InsightScreen} />
      <Tab.Screen name="Advice" component={AdviceScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainApp" component={MainTabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}