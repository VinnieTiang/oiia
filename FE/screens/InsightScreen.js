import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart, PieChart, ProgressChart } from "react-native-chart-kit"
import { useState } from "react"

export default function InsightScreen() {
  const [timePeriod, setTimePeriod] = useState("weekly")
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = windowWidth - 32 - 32;
  
  // Sample data for different time periods
  const salesData = {
    daily: {
      labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"],
      datasets: [{
        data: [200, 350, 1200, 800, 400, 900, 600],
        color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
        strokeWidth: 2,
      }]
    },
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        data: [850, 1200, 950, 1100, 1400, 1800, 1500],
        color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
        strokeWidth: 2,
      }]
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{
        data: [5200, 5800, 6200, 7000],
        color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
        strokeWidth: 2,
      }]
    }
  }

  const itemsData = {
    daily: {
      labels: ["Nasi L.", "Ayam G.", "Mee G.", "Roti C.", "Teh T."],
      datasets: [{
        data: [25, 20, 15, 10, 30]
      }]
    },
    weekly: {
      labels: ["Nasi L.", "Ayam G.", "Mee G.", "Roti C.", "Teh T."],
      datasets: [{
        data: [85, 75, 65, 55, 45]
      }]
    },
    monthly: {
      labels: ["Nasi L.", "Ayam G.", "Mee G.", "Roti C.", "Teh T."],
      datasets: [{
        data: [320, 280, 240, 200, 180]
      }]
    }
  }

  const categoryData = [
    {
      name: "Main Course",
      population: 65,
      color: "#2FAE60",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    },
    {
      name: "Beverages",
      population: 20,
      color: "#FFA726",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    },
    {
      name: "Desserts",
      population: 15,
      color: "#42A5F5",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    }
  ]

  const summaryData = {
    daily: {
      totalSales: "RM3,450",
      totalOrders: "128",
      rating: "4.7",
      avgOrderValue: "RM26.95",
      peakHour: "12PM"
    },
    weekly: {
      totalSales: "RM8,800",
      totalOrders: "342",
      rating: "4.8",
      avgOrderValue: "RM25.73",
      peakDay: "Saturday"
    },
    monthly: {
      totalSales: "RM24,200",
      totalOrders: "1,150",
      rating: "4.8",
      avgOrderValue: "RM21.04",
      peakWeek: "Week 4"
    }
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
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#2FAE60"
    }
  }

  const pieChartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    }
  }

  return (
    

      <ScrollView style={styles.container}>
        {/* Time period selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity 
            style={[styles.periodButton, timePeriod === 'daily' && styles.activePeriodButton]}
            onPress={() => setTimePeriod('daily')}
          >
            <Ionicons 
              name="today" 
              size={16} 
              color={timePeriod === 'daily' ? "#2FAE60" : "#666"} 
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.periodText, timePeriod === 'daily' && styles.activePeriodText]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, timePeriod === 'weekly' && styles.activePeriodButton]}
            onPress={() => setTimePeriod('weekly')}
          >
            <Ionicons 
              name="calendar" 
              size={16} 
              color={timePeriod === 'weekly' ? "#2FAE60" : "#666"} 
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.periodText, timePeriod === 'weekly' && styles.activePeriodText]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodButton, timePeriod === 'monthly' && styles.activePeriodButton]}
            onPress={() => setTimePeriod('monthly')}
          >
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={timePeriod === 'monthly' ? "#2FAE60" : "#666"} 
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.periodText, timePeriod === 'monthly' && styles.activePeriodText]}>Monthly</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Total Sales</Text>
            <Text 
              style={[styles.summaryValue, { fontSize: 18 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {summaryData[timePeriod].totalSales}
            </Text>
            <View style={styles.trendContainer}>
              <Ionicons name="trending-up" size={14} color="#2FAE60" />
              <Text style={styles.summaryLabel}>12% from last {timePeriod}</Text>
            </View>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Total Orders</Text>
            <Text style={styles.summaryValue}>{summaryData[timePeriod].totalOrders}</Text>
            <View style={styles.trendContainer}>
              <Ionicons name="trending-up" size={14} color="#2FAE60" />
              <Text style={styles.summaryLabel}>8% from last {timePeriod}</Text>
            </View>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Avg. Order</Text>
            <Text style={styles.summaryValue}>{summaryData[timePeriod].avgOrderValue}</Text>
            <View style={styles.trendContainer}>
              <Ionicons 
                name={timePeriod === 'monthly' ? "trending-down" : "trending-up"} 
                size={14} 
                color={timePeriod === 'monthly' ? "#FF3D00" : "#2FAE60"} 
              />
              <Text style={[styles.summaryLabel, 
                { color: timePeriod === 'monthly' ? "#FF3D00" : "#2FAE60" }]}>
                {timePeriod === 'monthly' ? "5% decrease" : "3% increase"}
              </Text>
            </View>
          </View>
        </View>

        {/* Sales Trend Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Sales Trend</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#2FAE60' }]} />
                <Text style={styles.legendText}>This {timePeriod}  </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#E0E0E0' }]} />
                <Text style={styles.legendText}>Last {timePeriod}  </Text>
              </View>
            </View>
          </View>
          <LineChart
            data={{
              ...salesData[timePeriod],
              datasets: [
                ...salesData[timePeriod].datasets,
                {
                  data: timePeriod === 'daily' ? [180, 300, 1000, 700, 350, 800, 500] :
                        timePeriod === 'weekly' ? [700, 1000, 800, 900, 1200, 1500, 1300] :
                        [5000, 5200, 5800, 6500],
                  color: (opacity = 1) => `rgba(224, 224, 224, ${opacity})`,
                  strokeWidth: 2,
                }
              ]
            }}
            width={chartWidth}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#2FAE60"
              }
            }}
            bezier
            style={styles.chart}
          />
          <View style={styles.insightBadge}>
            <Ionicons name="trending-up" size={16} color="#2FAE60" />
            <Text style={styles.insightText}>
              {timePeriod === 'daily' ? `Peak at ${summaryData.daily.peakHour}` : 
               timePeriod === 'weekly' ? `30% higher on ${summaryData.weekly.peakDay}` : 
               `Best performance in ${summaryData.monthly.peakWeek}`}
            </Text>
          </View>
        </View>

        {/* Top Selling Items Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Selling Items</Text>
          <BarChart
            data={itemsData[timePeriod]}
            width={chartWidth}
            height={220}
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.7,
              color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
          <View style={styles.insightBadge}>
            <Ionicons name="star" size={16} color="#2FAE60" />
            <Text style={styles.insightText}>Nasi Lemak is your best seller</Text>
          </View>
        </View>

        {/* Customer and Category Analysis */}
        <View style={styles.doubleChartContainer}>
          {/* Customer Type Pie Chart */}
          <View style={[styles.chartCard, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.chartTitle}>Customer Type</Text>
            <View style={styles.pieChartContainer}>
              <PieChart
                data={[
                  {
                    name: "Repeat",
                    population: 70,
                    color: "#2FAE60",
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12
                  },
                  {
                    name: "New",
                    population: 30,
                    color: "#FFA726",
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12
                  }
                ]}
                width={chartWidth / 2 - 40}  // Reduced width
                height={130}  // Reduced height (should match width for circle)
                chartConfig={pieChartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="25"  // Remove padding to maximize space
                absolute
                hasLegend={false}
              />
            </View>
            {/* Custom legend */}
            <View style={styles.customLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#2FAE60' }]} />
                <Text style={styles.legendText}>Repeat (70%)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#FFA726' }]} />
                <Text style={styles.legendText}>New (30%)</Text>
              </View>
            </View>
            <View style={styles.insightBadge}>
              <Ionicons name="people" size={16} color="#2FAE60" />
              <Text style={styles.insightText}>70% repeat customers</Text>
            </View>
          </View>

          {/* Category Distribution Pie Chart */}
          <View style={[styles.chartCard, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.chartTitle}>Category Sales</Text>
            <View style={styles.pieChartContainer}>
              <PieChart
                data={categoryData}
                width={chartWidth / 2 - 40}  // Reduced width
                height={130} 
                chartConfig={pieChartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="25"  // Remove padding to maximize space
                absolute
                hasLegend={false}
              />
            </View>
            {/* Custom legend */}
            <View style={styles.customLegend}>
              {categoryData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name} ({item.population}%)</Text>
                </View>
              ))}
            </View>
            <View style={styles.insightBadge}>
              <Ionicons name="pricetags" size={16} color="#2FAE60" />
              <Text style={styles.insightText}>65% from Main Course</Text>
            </View>
          </View>
        </View>

        {/* Progress Chart for Goals */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Goals Progress</Text>
          <ProgressChart
            data={{
              labels: ["Sales", "Orders", "Rating"],
              data: [0.75, 0.9, 0.96],
              colors: ["#2FAE60", "#FFC107", "#4FC3F7"]
            }}
            width={chartWidth}
            height={220}
            strokeWidth={8}
            radius={32}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            hideLegend={false}
            style={styles.chart}
          />
          <View style={styles.insightBadge}>
            <Ionicons name="trophy" size={16} color="#2FAE60" />
            <Text style={styles.insightText}>You're on track to meet monthly goals</Text>
          </View>
        </View>

        {/* Additional Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          
          <View style={styles.insightCard}>
            <View style={[styles.insightIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="time" size={20} color="#1976D2" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Best Selling Time</Text>
              <Text style={styles.insightDescription}>
                {timePeriod === 'daily' ? 'Lunch hours (12PM-2PM) account for 35% of daily sales' : 
                 timePeriod === 'weekly' ? 'Weekends generate 40% more revenue than weekdays' : 
                 'The last week of the month sees a 20% sales increase'}
              </Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <View style={[styles.insightIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="restaurant" size={20} color="#2FAE60" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Menu Performance</Text>
              <Text style={styles.insightDescription}>
                Nasi Lemak with Ayam Goreng combo accounts for 45% of main course orders. 
                Consider promoting it as a bundle deal.
              </Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <View style={[styles.insightIconContainer, { backgroundColor: '#FFF8E1' }]}>
              <Ionicons name="alert-circle" size={20} color="#FFA000" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Opportunity</Text>
              <Text style={styles.insightDescription}>
                Beverage sales are lower than industry average. Consider introducing 
                new drinks or combo meals to boost this category.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#f0f9f4',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activePeriodText: {
    color: '#2FAE60',
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: 100, // Set a minimum width
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2FAE60",
    marginBottom: 4,
    textAlign: 'center',
    flexShrink: 1, // Allow text to shrink if needed
    flexWrap: 'nowrap', // Prevent wrapping
  },
cardTitle: {
  fontSize: 12,
  fontWeight: "600",
  color: "#666",
  marginBottom: 4,
  textAlign: 'center',
},
trendContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 4,
},
summaryLabel: {
  fontSize: 10,
  color: "#666",
  marginLeft: 4,
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
    overflow: "hidden",
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  chartLegend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
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
  doubleChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  customLegend: {
    marginTop: 8,
    alignItems: 'flex-start',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
})