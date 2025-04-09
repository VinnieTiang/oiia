import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart } from "react-native-chart-kit"

const { width } = Dimensions.get("window")

export default function InsightScreen() {
  // Sample data for charts
  const weeklySales = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [850, 1200, 950, 1100, 1400, 1800, 1500],
        color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  const popularItems = {
    labels: ["Nasi L.", "Ayam G.", "Mee G.", "Roti C.", "Teh T."],
    datasets: [
      {
        data: [85, 75, 65, 55, 45],
      },
    ],
  }

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Insights</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Weekly Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>RM8,800</Text>
              <Text style={styles.summaryLabel}>Total Sales</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>342</Text>
              <Text style={styles.summaryLabel}>Total Orders</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>4.8</Text>
              <Text style={styles.summaryLabel}>Rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Sales</Text>
          <LineChart
            data={weeklySales}
            width={width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          <View style={styles.insightBadge}>
            <Ionicons name="trending-up" size={16} color="#2FAE60" />
            <Text style={styles.insightText}>30% increase on weekends</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Selling Items</Text>
          <BarChart
            data={popularItems}
            width={width - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.7,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
          <View style={styles.insightBadge}>
            <Ionicons name="star" size={16} color="#2FAE60" />
            <Text style={styles.insightText}>Nasi Lemak is your best seller</Text>
          </View>
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Key Insights</Text>

          <View style={styles.insightCard}>
            <View style={styles.insightIconContainer}>
              <Ionicons name="time" size={24} color="#2FAE60" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Peak Hours</Text>
              <Text style={styles.insightDescription}>
                Your busiest hours are 12-2PM and 6-8PM. Consider adding staff during these times.
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIconContainer}>
              <Ionicons name="calendar" size={24} color="#2FAE60" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Day of Week</Text>
              <Text style={styles.insightDescription}>
                Saturday is your most profitable day, with 30% higher sales than weekdays.
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIconContainer}>
              <Ionicons name="people" size={24} color="#2FAE60" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Customer Retention</Text>
              <Text style={styles.insightDescription}>
                65% of your customers are returning customers. Your loyalty program is working well.
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIconContainer}>
              <Ionicons name="cart" size={24} color="#2FAE60" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Inventory Alert</Text>
              <Text style={styles.insightDescription}>
                3 popular items are running low. Check your inventory management page for details.
              </Text>
            </View>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  container: {
    flex: 1,
    padding: 16,
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
  cardTitle: {
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#2FAE60",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  divider: {
    width: 1,
    backgroundColor: "#eee",
  },
  chartCard: {
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
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9f4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  insightText: {
    fontSize: 12,
    color: "#2FAE60",
    marginLeft: 4,
    fontWeight: "500",
  },
  insightsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f9f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
})
