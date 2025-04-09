import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart } from "react-native-chart-kit"

const { width } = Dimensions.get("window")

export default function InsightScreen() {
  // Sample data for charts
  const weeklyEarnings = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [85, 120, 95, 110, 140, 180, 150],
        color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }

  const hourlyEarnings = {
    labels: ["6-8", "8-10", "10-12", "12-2", "2-4", "4-6", "6-8", "8-10"],
    datasets: [
      {
        data: [25, 45, 35, 55, 40, 60, 70, 50],
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
        <Text style={styles.headerTitle}>Your Insights</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Weekly Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>RM880</Text>
              <Text style={styles.summaryLabel}>Total Earnings</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>42</Text>
              <Text style={styles.summaryLabel}>Total Trips</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>32h</Text>
              <Text style={styles.summaryLabel}>Active Hours</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Earnings</Text>
          <LineChart
            data={weeklyEarnings}
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
          <Text style={styles.chartTitle}>Hourly Performance</Text>
          <BarChart
            data={hourlyEarnings}
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
            <Ionicons name="time" size={16} color="#2FAE60" />
            <Text style={styles.insightText}>Peak earnings: 6-8 PM</Text>
          </View>
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Key Insights</Text>

          <View style={styles.insightCard}>
            <View style={styles.insightIconContainer}>
              <Ionicons name="location" size={24} color="#2FAE60" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Location Analysis</Text>
              <Text style={styles.insightDescription}>
                You earn 40% more in downtown areas compared to suburban areas.
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
                Saturday is your most profitable day, with 30% higher earnings.
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIconContainer}>
              <Ionicons name="timer" size={24} color="#2FAE60" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Efficiency</Text>
              <Text style={styles.insightDescription}>Your average earnings per hour increased by 15% this month.</Text>
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
