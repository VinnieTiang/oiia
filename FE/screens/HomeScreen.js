import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import FloatingChatButton from "../components/FloatingChatButton"

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <FloatingChatButton />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Merchant!</Text>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>RM1,250</Text>
              <Text style={styles.summaryLabel}>Today's Sales</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>42</Text>
              <Text style={styles.summaryLabel}>Orders</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>4.8</Text>
              <Text style={styles.summaryLabel}>Rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.tipCard}>
        <TouchableOpacity  onPress={() => navigation.navigate("Advice")}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={24} color="#FFD700" />
            <Text style={styles.tipTitle}>Tip of the Day</Text>
          </View>
          <Text style={styles.tipText}>
            Consider offering a 10% discount during 2-4PM to boost your off-peak sales.
          </Text>
          </TouchableOpacity>
        </View>
        

        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Chat")}>
            <View style={[styles.menuIcon, { backgroundColor: "#E8F5FF" }]}>
              <Ionicons name="chatbubble" size={24} color="#2D9CDB" />
            </View>
            <Text style={styles.menuText}>Chat with AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Insight")}>
            <View style={[styles.menuIcon, { backgroundColor: "#F0FFF4" }]}>
              <Ionicons name="bar-chart" size={24} color="#2FAE60" />
            </View>
            <Text style={styles.menuText}>View Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Advice")}>
            <View style={[styles.menuIcon, { backgroundColor: "#FFF8E8" }]}>
              <Ionicons name="bulb" size={24} color="#F2994A" />
            </View>
            <Text style={styles.menuText}>Get Advice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Inventory")}>
            <View style={[styles.menuIcon, { backgroundColor: "#F3F0FF" }]}>
              <Ionicons name="cube" size={24} color="#9B51E0" />
            </View>
            <Text style={styles.menuText}>Inventory</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="cart" size={20} color="#2FAE60" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Completed 42 orders</Text>
              <Text style={styles.activityTime}>Today, 5:30 PM</Text>
            </View>
            <Text style={styles.activityValue}>RM1,250</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="trending-up" size={20} color="#2D9CDB" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Sales milestone</Text>
              <Text style={styles.activityTime}>Today</Text>
            </View>
            <Text style={styles.activityValue}>+15%</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="star" size={20} color="#F2994A" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New customer review</Text>
              <Text style={styles.activityTime}>1 hour ago</Text>
            </View>
            <Text style={styles.activityValue}>5★</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  notificationIcon: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2FAE60",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  divider: {
    width: 1,
    backgroundColor: "#eee",
  },
  tipCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#FFD700",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  menuItem: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  activitySection: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  activityTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2FAE60",
  },
})
