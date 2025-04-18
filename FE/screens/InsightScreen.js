"use client"

import {View,Text,StyleSheet,ScrollView,TouchableOpacity,useWindowDimensions,ActivityIndicator,} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart, PieChart, ProgressChart } from "react-native-chart-kit"
import { useRef, useEffect, useState } from "react"
import { useRoute } from "@react-navigation/native"
import { fetchForecast, fetchSalesData, fetchSalesTrend, fetchInsights, fetchTopSellingItems } from "../api"

export default function InsightScreen() {
  const [timePeriod, setTimePeriod] = useState("weekly")
  const [forecastData, setForecastData] = useState(null)
  const [isLoadingForecast, setIsLoadingForecast] = useState(false)
  const [forecastError, setForecastError] = useState(null)
  const { width: windowWidth } = useWindowDimensions()
  const chartWidth = windowWidth - 32 - 32
  const scrollViewRef = useRef(null)
  const route = useRoute()
  const [todaySales, setTodaySales] = useState(null)
  const [todayLoading, setTodayLoading] = useState(true)
  const [todayError, setTodayError] = useState(null)
  const [weeklySales, setWeeklySales] = useState(null)
  const [weeklyLoading, setWeeklyLoading] = useState(true)
  const [weeklyError, setWeeklyError] = useState(null)
  const [monthlySales, setMonthlySales] = useState(null)
  const [monthlyLoading, setMonthlyLoading] = useState(true)
  const [monthlyError, setMonthlyError] = useState(null)
  const [salesTrend, setSalesTrend] = useState(null)
  const [salesTrendLoading, setSalesTrendLoading] = useState(true)
  const [salesTrendError, setSalesTrendError] = useState(null)
  const [insights, setInsights] = useState(null)
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [topItems, setTopItems] = useState(null);
  const [topItemsLoading, setTopItemsLoading] = useState(true);

  useEffect(() => {
    if (route.params?.scrollToBottom) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 100) // Small delay to ensure content is rendered
    }
  }, [route.params])

  // Fetch forecast data when component mounts
  useEffect(() => {
    const loadForecastData = async () => {
      try {
        setIsLoadingForecast(true)
        setForecastError(null)
        const data = await fetchForecast()
        setForecastData(data)
      } catch (error) {
        console.error("Error loading forecast data:", error)
        setForecastError("Unable to load forecast data. Please try again later.")
      } finally {
        setIsLoadingForecast(false)
      }
    }

    loadForecastData()
  }, [])

  useEffect(() => {
    const fetchAllSalesData = async () => {
      try {
        // Fetch today's data
        setTodayLoading(true)
        const todaySales = await fetchSalesData('today')
        setTodaySales(todaySales)
        setTodayLoading(false)
        
        // Fetch weekly data
        setWeeklyLoading(true)
        const weeklySales = await fetchSalesData('week');
        setWeeklySales(weeklySales)
        setWeeklyLoading(false)
        
        // Fetch monthly data
        setMonthlyLoading(true)
        const monthlySales = await fetchSalesData('month');
        setMonthlySales(monthlySales)
        setMonthlyLoading(false)
      } catch (error) {
        console.error("Error fetching sales data:", error)
        setTodayError(error.message)
        setWeeklyError(error.message)
        setMonthlyError(error.message)
      } finally {
        setTodayLoading(false)
        setWeeklyLoading(false)
        setMonthlyLoading(false)
      }
    }
    fetchAllSalesData()
  }, []) // Empty dependency array - run once on mount

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setSalesTrendLoading(true)
        setSalesTrendError(null)
        const data = await fetchSalesTrend(timePeriod)
        setSalesTrend(data)
      } catch (error) {
        console.error(`Error fetching ${timePeriod} trend data:`, error)
        setSalesTrendError(error.message)
      } finally {
        setSalesTrendLoading(false)
      }
    }

    fetchTrendData()
  }, [timePeriod])


  useEffect(() => {
    const fetchTopItems = async () => {
      try {
        setTopItemsLoading(true);
        const data = await fetchTopSellingItems();
        if (!data || data.status === "loading") {
          setTopItems({ status: "loading" });
        } else {
          setTopItems(data);
        }
        setTopItemsLoading(false);
      } catch (error) {
        console.error("Failed to fetch top items:", error);
        setTopItemsLoading(false);
      }
    };
  
    fetchTopItems();
  }, []);
  

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setInsightsLoading(true);
        const data = await fetchInsights(timePeriod);
        setInsights(data);
      } catch (error) {
        console.error(`Error loading insights for ${timePeriod}:`, error);
      } finally {
        setInsightsLoading(false);
      }
    };
    
    loadInsights();
  }, [timePeriod]);

  // Sample data for different time periods
  const salesData = {
    daily: salesTrend || {
      labels: [],
      datasets: [
        {
          data: [],
          color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
          strokeWidth: 2,
        },
      ],
    },
    weekly: salesTrend || {
      labels: [],
      datasets: [
        {
          data: [],
          color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
          strokeWidth: 2,
        },
      ],
    },
    monthly: salesTrend || {
      labels: [],
      datasets: [
        {
          data: [],
          color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
          strokeWidth: 2,
        },
      ],
    },
  }


  const categoryData = [
    {
      name: "Main Course",
      population: 65,
      color: "#2FAE60",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Beverages",
      population: 20,
      color: "#FFA726",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
    {
      name: "Desserts",
      population: 15,
      color: "#42A5F5",
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    },
  ]

  const summaryData = {
    daily: {
      totalSales: todaySales?.total_sales_formatted || "RM0.00",
      totalOrders: todaySales?.total_orders?.toString() || "0",
      // Keep hardcoded values for data not provided by API
      rating: "4.7",
      // Use API-calculated average order value when available
      avgOrderValue: todaySales?.avg_order_value_formatted || "RM0.00",
      // Use dynamic peak hour from salesTrend when available
      peakHour: salesTrend?.peak_hour || "...",
    },
    weekly: {
      totalSales: weeklySales?.total_sales_formatted || "RM0.00",
      totalOrders: weeklySales?.total_orders?.toString() || "0",
      rating: "4.8",
      avgOrderValue: weeklySales?.avg_order_value_formatted || "RM0.00",
      peakDay: salesTrend?.peak_day || "...",
    },
    monthly: {
      totalSales: monthlySales?.total_sales_formatted || "RM0.00",
      totalOrders: monthlySales?.total_orders?.toString() || "0",
      rating: "4.8",
      avgOrderValue: monthlySales?.avg_order_value_formatted || "RM0.00",
      peakWeek: salesTrend?.peak_week || "...",
    },
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
      stroke: "#2FAE60",
    },
  }

  const pieChartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
  }

  // Format forecast data for chart
  const prepareForecastChart = () => {
    if (!forecastData || !forecastData.forecast) return null

    const labels = forecastData.forecast.map((item) => {
      const date = new Date(item.ds)
      return date.toLocaleDateString("en-US", { weekday: "short" })
    })

    const data = forecastData.forecast.map((item) => Math.round(item.yhat))

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    }
  }

  const forecastChartData = prepareForecastChart()

  // Ensure your chart data has valid defaults
  const chartData = {
    labels: salesData[timePeriod]?.labels || [],
    datasets: [
      {
        data: (salesData[timePeriod]?.datasets?.[0]?.data || [])
          .filter(value => isFinite(value)), // Filter out Infinity values
        color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
        strokeWidth: 2,
      }
    ]
  };

  ///////////// Define a reusable SummaryCard (Second Row) ////////////
  const SummaryCard = ({ 
    title, 
    value, 
    isLoading, 
    trendPercentage, 
    trendValue, 
    customStyles = {} 
  }) => {
    // Changed: Consider 0% as positive (or neutral) for UI purposes
    // This ensures 0% always shows trending up icon
    const isTrendPositive = trendValue >= 0;
    const trendIconName = isTrendPositive ? "trending-up" : "trending-down";
    const trendColor = isTrendPositive ? "#2FAE60" : "#FF3D00";
    
    // Determine the comparison text based on time period using proper nouns
    let comparisonText;
    switch(timePeriod) {
      case "daily":
        comparisonText = "yesterday";
        break;
      case "weekly":
        comparisonText = "last week";
        break;
      case "monthly":
        comparisonText = "last month";
        break;
      default:
        comparisonText = `last ${timePeriod}`;
    }
    
    return (
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>{title}</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#2FAE60" />
        ) : (
          <>
            <Text style={[styles.summaryValue, customStyles]} numberOfLines={1} adjustsFontSizeToFit>
              {value}
            </Text>
            <View style={styles.trendContainer}>
              <Ionicons name={trendIconName} size={14} color={trendColor} />
              <Text style={[styles.summaryLabel, customStyles.label || {}]}>
                {trendPercentage} from {comparisonText}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <ScrollView ref={scrollViewRef} style={styles.container}>
      {/* Time period selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, timePeriod === "daily" && styles.activePeriodButton]}
          onPress={() => setTimePeriod("daily")}
        >
          <Ionicons
            name="today"
            size={16}
            color={timePeriod === "daily" ? "#2FAE60" : "#666"}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.periodText, timePeriod === "daily" && styles.activePeriodText]}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, timePeriod === "weekly" && styles.activePeriodButton]}
          onPress={() => setTimePeriod("weekly")}
        >
          <Ionicons
            name="calendar"
            size={16}
            color={timePeriod === "weekly" ? "#2FAE60" : "#666"}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.periodText, timePeriod === "weekly" && styles.activePeriodText]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, timePeriod === "monthly" && styles.activePeriodButton]}
          onPress={() => setTimePeriod("monthly")}
        >
          <Ionicons
            name="calendar-outline"
            size={16}
            color={timePeriod === "monthly" ? "#2FAE60" : "#666"}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.periodText, timePeriod === "monthly" && styles.activePeriodText]}>Monthly</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        {/* Total Sales Card */}
        <SummaryCard
          title="Total Sales"
          value={summaryData[timePeriod].totalSales}
          isLoading={(timePeriod === "daily" && todayLoading) ||
                    (timePeriod === "weekly" && weeklyLoading) ||
                    (timePeriod === "monthly" && monthlyLoading)}
          trendValue={
            timePeriod === "daily"
              ? todaySales?.vs_last_period
              : timePeriod === "weekly"
                ? weeklySales?.vs_last_period
                : monthlySales?.vs_last_period
          }
          trendPercentage={
            timePeriod === "daily" 
              ? todaySales?.vs_last_period_formatted || "+0%" 
              : timePeriod === "weekly" 
                ? weeklySales?.vs_last_period_formatted || "+0%"
                : monthlySales?.vs_last_period_formatted || "+0%"
          }
          customStyles={{ fontSize: 18 }}
        />

        {/* Total Orders Card */}
        <SummaryCard
          title="Total Orders"
          value={summaryData[timePeriod].totalOrders}
          isLoading={(timePeriod === "daily" && todayLoading) ||
                    (timePeriod === "weekly" && weeklyLoading) ||
                    (timePeriod === "monthly" && monthlyLoading)}
          trendValue={
            timePeriod === "daily"
              ? todaySales?.orders_vs_last_period
              : timePeriod === "weekly"
                ? weeklySales?.orders_vs_last_period
                : monthlySales?.orders_vs_last_period
          }
          trendPercentage={
            timePeriod === "daily" 
              ? todaySales?.orders_vs_last_period_formatted || "+0%" 
              : timePeriod === "weekly" 
                ? weeklySales?.orders_vs_last_period_formatted || "+0%"
                : monthlySales?.orders_vs_last_period_formatted || "+0%"
          }
        />

        {/* Average Order Value Card */}
        <SummaryCard
          title="Avg. Order"
          value={
            timePeriod === "daily"
              ? todaySales?.avg_order_value_formatted || "RM0.00"
              : timePeriod === "weekly"
                ? weeklySales?.avg_order_value_formatted || "RM0.00"
                : monthlySales?.avg_order_value_formatted || "RM0.00"
          }
          isLoading={false} // This card doesn't show a loader
          trendValue={
            timePeriod === "daily"
              ? todaySales?.avg_order_vs_last_period
              : timePeriod === "weekly"
                ? weeklySales?.avg_order_vs_last_period
                : monthlySales?.avg_order_vs_last_period
          }
          trendPercentage={
            timePeriod === "daily"
              ? todaySales?.avg_order_vs_last_period_formatted || "+0%"
              : timePeriod === "weekly"
                ? weeklySales?.avg_order_vs_last_period_formatted || "+0%"
                : monthlySales?.avg_order_vs_last_period_formatted || "+0%"
          }
          customStyles={{
            label: { 
              color: timePeriod === "daily"
                ? todaySales?.avg_order_vs_last_period >= 0 ? "#2FAE60" : "#FF3D00" 
                : timePeriod === "weekly"
                  ? weeklySales?.avg_order_vs_last_period >= 0 ? "#2FAE60" : "#FF3D00"
                  : monthlySales?.avg_order_vs_last_period >= 0 ? "#2FAE60" : "#FF3D00"
            }
          }}
        />
      </View>

      {/* Sales Trend Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Sales Trend</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#2FAE60" }]} />
              <Text style={styles.legendText}>This {timePeriod} </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#E0E0E0" }]} />
              <Text style={styles.legendText}>Last {timePeriod} </Text>
            </View>
          </View>
        </View>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [
              {
                data: chartData.datasets[0].data.length > 0 ? 
                      chartData.datasets[0].data : 
                      [0], // Provide fallback data if empty
                color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
                strokeWidth: 2,
              },
              {
                data: salesTrend && Array.isArray(salesTrend.comparison_data) ? 
                      salesTrend.comparison_data.filter(value => 
                        typeof value === 'number' && isFinite(value) && !isNaN(value)
                      ) : 
                      [0], // More robust filtering and fallback
                color: function(opacity = 1) { return `rgba(224, 224, 224, ${opacity})`; },
                strokeWidth: 2,
              },
            ],
          }}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#2FAE60",
            },
          }}
          bezier
          style={styles.chart}
        />
        <View style={styles.insightBadge}>
          <Ionicons 
            name={salesTrend?.peak_week_increase?.includes('-') ? "trending-down" : "trending-up"} 
            size={16} 
            color={salesTrend?.peak_week_increase?.includes('-') ? "#FF3D00" : "#2FAE60"} 
          />
          <Text style={[
            styles.insightText, 
            {color: salesTrend?.peak_week_increase?.includes('-') ? "#FF3D00" : "#2FAE60"}
          ]}>
            {timePeriod === "daily"
              ? `Peak at ${salesTrend?.peak_hour || summaryData.daily.peakHour}`
              : timePeriod === "weekly"
                ? `${salesTrend?.peak_day_increase || ""} ${salesTrend?.peak_day_increase?.includes('-') ? 'lower' : 'higher'} on ${salesTrend?.peak_day || summaryData.weekly.peakDay}`
                : salesTrend?.peak_week_increase?.includes('-')
                  ? `${salesTrend?.peak_week_increase || ""} in ${salesTrend?.peak_week || summaryData.monthly.peakWeek}`
                  : `Best performance (+${salesTrend?.peak_week_increase || ""}) in ${salesTrend?.peak_week || summaryData.monthly.peakWeek}`
            }
          </Text>
        </View>
      </View>

      {/* Top Selling Items Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Top Selling Items (Last 30 Days)</Text>
        
        {topItemsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2FAE60" />
            <Text style={styles.loadingText}>Loading top items data...</Text>
          </View>
        ) : (
          <>
            <BarChart
              data={topItems?.chart_data || {
                labels: [],
                datasets: [{ data: [] }]
              }}
              width={chartWidth}
              height={220}
              chartConfig={{
                ...chartConfig,
                barPercentage: 0.7,
                color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
            />
            <View style={styles.insightBadge}>
              <Ionicons name="star" size={16} color="#2FAE60" />
              <Text style={styles.insightText}>
                {topItems && topItems.status === "success" ? 
                  `${topItems.best_seller} is your best seller (${topItems.best_seller_percent}%)` : 
                  topItemsLoading ? "Loading..." : "No top items data available"}
              </Text>
            </View>
          </>
        )}
      </View>

       {/* Sales Forecast Section */}
       <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Sales Forecast (Next 7 Days)</Text>
          <View style={styles.forecastBadge}>
            <Ionicons name="analytics" size={14} color="#4285F4" />
            <Text style={[styles.insightText, { color: "#4285F4" }]}>AI Powered</Text>
          </View>
        </View>

        {isLoadingForecast ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
            <Text style={styles.loadingText}>Loading forecast data...</Text>
          </View>
        ) : forecastError ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF3D00" />
            <Text style={styles.errorText}>{forecastError}</Text>
          </View>
        ) : forecastChartData ? (
          <>
            <LineChart
              data={forecastChartData}
              width={chartWidth}
              height={220}
              yAxisMin={4000}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(66, 133, 244, ${opacity})`,
                propsForDots: {
                  r: "5",
                  yAxisMin:"0",
                  strokeWidth: "2",
                  stroke: "#4285F4",
                },
              }}
              bezier
              style={styles.chart}
            />
            <View style={styles.forecastSummaryContainer}>
              {forecastData && forecastData.summary && (
                <>
                  <View style={styles.forecastCardRow}>
                    <View style={[styles.forecastMetricCard, styles.avgSalesCard]}>
                      <View style={styles.forecastMetricIconContainer}>
                        <Ionicons name="calculator-outline" size={20} color="#4285F4" />
                      </View>
                      <Text style={styles.forecastMetricLabel}>Average Daily</Text>
                      <Text style={styles.forecastMetricValue}>
                        {forecastData.summary.match(/Average predicted daily sales: (RM[\d,.]+)/)?.[1] || "N/A"}
                      </Text>
                    </View>

                    <View style={[styles.forecastMetricCard, styles.highSalesCard]}>
                      <View style={styles.forecastMetricIconContainer}>
                        <Ionicons name="trending-up" size={20} color="#2FAE60" />
                      </View>
                      <Text style={styles.forecastMetricLabel}>Highest Sales</Text>
                      <Text style={styles.forecastMetricValue}>
                        {forecastData.summary.match(/Highest predicted sales: (RM[\d,.]+)/)?.[1] || "N/A"}
                      </Text>
                      <Text style={styles.forecastMetricDate}>
                        {forecastData.summary.match(/Highest predicted sales: RM[\d,.]+ on ([^\n]+)/)?.[1]}
                      </Text>
                    </View>

                    <View style={[styles.forecastMetricCard, styles.lowSalesCard]}>
                      <View style={styles.forecastMetricIconContainer}>
                        <Ionicons name="trending-down" size={20} color="#FF3D00" />
                      </View>
                      <Text style={styles.forecastMetricLabel}>Lowest Sales</Text>
                      <Text style={styles.forecastMetricValue}>
                        {forecastData.summary.match(/Lowest predicted sales: (RM[\d,.]+)/)?.[1] || "N/A"}
                      </Text>
                      <Text style={styles.forecastMetricDate}>
                        {forecastData.summary.match(/Lowest predicted sales: RM[\d,.]+ on ([^\n]+)/)?.[1]}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
            <View style={styles.insightBadge}>
              <Ionicons name="trending-up" size={16} color="#4285F4" />
              <Text style={[styles.insightText, { color: "#4285F4" }]}>
                Plan your inventory based on predicted sales
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF3D00" />
            <Text style={styles.errorText}>No forecast data available</Text>
          </View>
        )}
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
                  legendFontSize: 12,
                },
                {
                  name: "New",
                  population: 30,
                  color: "#FFA726",
                  legendFontColor: "#7F7F7F",
                  legendFontSize: 12,
                },
              ]}
              width={chartWidth / 2 - 40} // Reduced width
              height={130} // Reduced height (should match width for circle)
              chartConfig={pieChartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="25" // Remove padding to maximize space
              absolute
              hasLegend={false}
            />
          </View>
          {/* Custom legend */}
          <View style={styles.customLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#2FAE60" }]} />
              <Text style={styles.legendText}>Repeat (70%)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: "#FFA726" }]} />
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
              width={chartWidth / 2 - 40} // Reduced width
              height={130}
              chartConfig={pieChartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="25" // Remove padding to maximize space
              absolute
              hasLegend={false}
            />
          </View>
          {/* Custom legend */}
          <View style={styles.customLegend}>
            {categoryData.map((item, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                <Text style={styles.legendText}>
                  {item.name} ({item.population}%)
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.insightBadge}>
            <Ionicons name="pricetags" size={16} color="#2FAE60" />
            <Text style={styles.insightText}>65% from Main Course</Text>
          </View>
        </View>
      </View>

      {/* Key Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Key Insights</Text>

        {insightsLoading ? (
          <ActivityIndicator size="large" color="#2FAE60" />
        ) : (
          <>
            <View style={styles.insightCard}>
              <View style={[styles.insightIconContainer, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="time" size={20} color="#1976D2" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insights?.best_selling_time?.title || "Best Selling Time"}</Text>
                <Text style={styles.insightDescription}>
                  {insights?.best_selling_time?.description || 
                    (timePeriod === "daily"
                      ? "Lunch hours (12PM-2PM) account for 35% of daily sales"
                      : timePeriod === "weekly"
                        ? "Weekends generate 40% more revenue than weekdays"
                        : "The last week of the month sees a 20% sales increase")
                  }
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={[styles.insightIconContainer, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="restaurant" size={20} color="#2FAE60" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insights?.menu_performance?.title || "Menu Performance"}</Text>
                <Text style={styles.insightDescription}>
                  {insights?.menu_performance?.description || 
                    "Nasi Lemak with Ayam Goreng combo accounts for 45% of main course orders. Consider promoting it as a bundle deal."}
                </Text>
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={[styles.insightIconContainer, { backgroundColor: "#FFF8E1" }]}>
                <Ionicons name="alert-circle" size={20} color="#FFA000" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insights?.opportunity?.title || "Opportunity"}</Text>
                <Text style={styles.insightDescription}>
                  {insights?.opportunity?.description || 
                    "Beverage sales are lower than industry average. Consider introducing new drinks or combo meals to boost this category."}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "white",
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  activePeriodButton: {
    backgroundColor: "#f0f9f4",
  },
  periodText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activePeriodText: {
    color: "#2FAE60",
    fontWeight: "600",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: 100, // Set a minimum width
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
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
    textAlign: "center",
    flexShrink: 1, // Allow text to shrink if needed
    flexWrap: "nowrap", // Prevent wrapping
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  chartLegend: {
    flexDirection: "row",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#666",
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
    flexDirection: "row",
    justifyContent: "space-between",
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
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  customLegend: {
    marginTop: 8,
    alignItems: "flex-start",
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#666",
  },
  // New styles for forecast section
  forecastBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F0FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: "#FF3D00",
    textAlign: "center",
  },
  forecastSummaryContainer: {
    marginVertical: 12,
  },
  forecastCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  forecastMetricCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 120,
  },
  avgSalesCard: {
    borderTopWidth: 3,
    borderTopColor: "#4285F4",
  },
  highSalesCard: {
    borderTopWidth: 3,
    borderTopColor: "#2FAE60",
  },
  lowSalesCard: {
    borderTopWidth: 3,
    borderTopColor: "#FF3D00",
  },
  forecastMetricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  forecastMetricLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    height:30,
    textAlign: "center",
  },
  forecastMetricValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  forecastMetricDate: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
  },
})
