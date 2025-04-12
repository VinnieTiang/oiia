"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

// Mock data with point system instead of sales
const mockLeaderboardData = {
  overall: [
    {
      id: 1,
      name: "Warung Makan Sedap",
      rating: 4.9,
      points: 1580,
      orders: 320,
      category: "Local Food",
      rank: 1,
      badges: ["Top Rated", "Fast Delivery", "Customer Favorite"],
    },
    {
      id: 2,
      name: "Restoran Selera Kampung",
      rating: 4.8,
      points: 1420,
      orders: 290,
      category: "Local Food",
      rank: 2,
      badges: ["Consistent Quality"],
    },
    {
      id: 3,
      name: "Nasi Kandar Subang",
      rating: 4.7,
      points: 1350,
      orders: 275,
      category: "Local Food",
      rank: 3,
      badges: ["Popular Choice"],
    },
    {
      id: 4,
      name: "Ayam Penyet Pak Ali",
      rating: 4.7,
      points: 1280,
      orders: 260,
      category: "Local Food",
      rank: 4,
      badges: ["Consistent Quality"],
    },
    {
      id: 5,
      name: "Mee Tarik Warisan",
      rating: 4.6,
      points: 1200,
      orders: 245,
      category: "Noodles",
      rank: 5,
      badges: ["Popular Choice"],
    },
    {
      id: 6,
      name: "Restoran Cili Padi",
      rating: 4.6,
      points: 1150,
      orders: 235,
      category: "Local Food",
      rank: 6,
      badges: ["Fast Delivery"],
    },
    {
      id: 7,
      name: "Nasi Lemak Corner",
      rating: 4.5,
      points: 1100,
      orders: 225,
      category: "Local Food",
      rank: 7,
      badges: ["Popular Choice"],
    },
    {
      id: 8,
      name: "Roti Canai Pak Din",
      rating: 4.5,
      points: 1050,
      orders: 215,
      category: "Breakfast",
      rank: 8,
      badges: ["Early Bird"],
    },
    {
      id: 9,
      name: "Char Kuey Teow Stall",
      rating: 4.4,
      points: 1000,
      orders: 205,
      category: "Street Food",
      rank: 9,
      badges: ["Consistent Quality"],
    },
    {
      id: 10,
      name: "Satay Station",
      rating: 4.4,
      points: 950,
      orders: 195,
      category: "BBQ",
      rank: 10,
      badges: ["Popular Choice"],
    },
  ],
  nearby: [
    {
      id: 1,
      name: "Warung Makan Sedap",
      rating: 4.9,
      points: 1580,
      orders: 320,
      category: "Local Food",
      distance: "0 km",
      rank: 1,
      badges: ["Top Rated", "Fast Delivery", "Customer Favorite"],
    },
    {
      id: 3,
      name: "Nasi Kandar Subang",
      rating: 4.7,
      points: 1350,
      orders: 275,
      category: "Local Food",
      distance: "0.5 km",
      rank: 2,
      badges: ["Popular Choice"],
    },
    {
      id: 6,
      name: "Restoran Cili Padi",
      rating: 4.6,
      points: 1150,
      orders: 235,
      category: "Local Food",
      distance: "0.8 km",
      rank: 3,
      badges: ["Fast Delivery"],
    },
    {
      id: 8,
      name: "Roti Canai Pak Din",
      rating: 4.5,
      points: 1050,
      orders: 215,
      category: "Breakfast",
      distance: "1.2 km",
      rank: 4,
      badges: ["Early Bird"],
    },
    {
      id: 10,
      name: "Satay Station",
      rating: 4.4,
      points: 950,
      orders: 195,
      category: "BBQ",
      distance: "1.5 km",
      rank: 5,
      badges: ["Popular Choice"],
    },
  ],
  category: [
    {
      id: 1,
      name: "Warung Makan Sedap",
      rating: 4.9,
      points: 1580,
      orders: 320,
      category: "Local Food",
      rank: 1,
      badges: ["Top Rated", "Fast Delivery", "Customer Favorite"],
    },
    {
      id: 2,
      name: "Restoran Selera Kampung",
      rating: 4.8,
      points: 1420,
      orders: 290,
      category: "Local Food",
      rank: 2,
      badges: ["Consistent Quality"],
    },
    {
      id: 3,
      name: "Nasi Kandar Subang",
      rating: 4.7,
      points: 1350,
      orders: 275,
      category: "Local Food",
      rank: 3,
      badges: ["Popular Choice"],
    },
    {
      id: 4,
      name: "Ayam Penyet Pak Ali",
      rating: 4.7,
      points: 1280,
      orders: 260,
      category: "Local Food",
      rank: 4,
      badges: ["Consistent Quality"],
    },
    {
      id: 6,
      name: "Restoran Cili Padi",
      rating: 4.6,
      points: 1150,
      orders: 235,
      category: "Local Food",
      rank: 5,
      badges: ["Fast Delivery"],
    },
    {
      id: 7,
      name: "Nasi Lemak Corner",
      rating: 4.5,
      points: 1100,
      orders: 225,
      category: "Local Food",
      rank: 6,
      badges: ["Popular Choice"],
    },
  ],
}

// Badge colors
const badgeColors = {
  "Top Rated": { bg: "#FFF9C4", text: "#F57F17" },
  "Fast Delivery": { bg: "#E1F5FE", text: "#0288D1" },
  "Customer Favorite": { bg: "#F8BBD0", text: "#C2185B" },
  "Consistent Quality": { bg: "#E8F5E9", text: "#388E3C" },
  "Popular Choice": { bg: "#EDE7F6", text: "#7B1FA2" },
  "Early Bird": { bg: "#FFF3E0", text: "#E65100" },
}

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState("overall")
  const [timeFilter, setTimeFilter] = useState("week")
  const [sortBy, setSortBy] = useState("points")
  const [isLoading, setIsLoading] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState(mockLeaderboardData)
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const [showPointsInfo, setShowPointsInfo] = useState(false)

  // Simulate loading data when changing tabs or filters
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [activeTab, timeFilter, sortBy])

  const renderMerchantRank = (merchant, index) => {
    // Determine if this is the current merchant (for highlighting)
    const isCurrentMerchant = merchant.id === 1
    const rankStyles = [styles.rankContainer]
    let rankColor = "#666"
    let rankBgColor = "#f5f5f5"

    // Style based on rank
    if (merchant.rank === 1) {
      rankColor = "#FFD700" // Gold
      rankBgColor = "#FFF9E6"
    } else if (merchant.rank === 2) {
      rankColor = "#C0C0C0" // Silver
      rankBgColor = "#F5F5F5"
    } else if (merchant.rank === 3) {
      rankColor = "#CD7F32" // Bronze
      rankBgColor = "#FFF1E6"
    }

    return (
      <View
        key={merchant.id}
        style={[
          styles.merchantItem,
          isCurrentMerchant && styles.currentMerchantItem,
          { marginBottom: index === leaderboardData[activeTab].length - 1 ? 20 : 12 },
        ]}
      >
        <View style={[styles.rankContainer, { backgroundColor: rankBgColor }]}>
          <Text style={[styles.rankText, { color: rankColor }]}>#{merchant.rank}</Text>
        </View>

        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName} numberOfLines={1}>
            {merchant.name}
            {isCurrentMerchant && <Text style={styles.youLabel}> (You)</Text>}
          </Text>
          <View style={styles.merchantDetails}>
            <Text style={styles.merchantCategory}>{merchant.category}</Text>
            {activeTab === "nearby" && <Text style={styles.merchantDistance}> • {merchant.distance}</Text>}
          </View>

          {/* Badges */}
          <View style={styles.badgesContainer}>
            {merchant.badges &&
              merchant.badges.slice(0, 2).map((badge, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.badgeItem,
                    {
                      backgroundColor: badgeColors[badge]?.bg || "#f0f0f0",
                      marginRight: idx < merchant.badges.slice(0, 2).length - 1 ? 4 : 0,
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: badgeColors[badge]?.text || "#666" }]}>{badge}</Text>
                </View>
              ))}
            {merchant.badges && merchant.badges.length > 2 && (
              <Text style={styles.moreBadges}>+{merchant.badges.length - 2}</Text>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {sortBy === "points" ? merchant.points.toLocaleString() : merchant.orders}
            </Text>
            <Text style={styles.statLabel}>{sortBy === "points" ? "Points" : "Orders"}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{merchant.rating}</Text>
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>
    )
  }

  const renderFilterOptions = () => {
    if (!showFilterOptions) return null

    return (
      <View style={styles.filterOptionsContainer}>
        <Text style={styles.filterTitle}>Sort by</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[styles.filterOption, sortBy === "points" && styles.filterOptionActive]}
            onPress={() => {
              setSortBy("points")
              setShowFilterOptions(false)
            }}
          >
            <Text style={[styles.filterOptionText, sortBy === "points" && styles.filterOptionTextActive]}>Points</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, sortBy === "orders" && styles.filterOptionActive]}
            onPress={() => {
              setSortBy("orders")
              setShowFilterOptions(false)
            }}
          >
            <Text style={[styles.filterOptionText, sortBy === "orders" && styles.filterOptionTextActive]}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterOption, sortBy === "rating" && styles.filterOptionActive]}
            onPress={() => {
              setSortBy("rating")
              setShowFilterOptions(false)
            }}
          >
            <Text style={[styles.filterOptionText, sortBy === "rating" && styles.filterOptionTextActive]}>Rating</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderPointsInfo = () => {
    if (!showPointsInfo) return null

    return (
      <View style={styles.pointsInfoContainer}>
        <View style={styles.pointsInfoHeader}>
          <Text style={styles.pointsInfoTitle}>How Points Are Calculated</Text>
          <TouchableOpacity onPress={() => setShowPointsInfo(false)}>
            <Ionicons name="close" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.pointsInfoContent}>
          <View style={styles.pointsInfoItem}>
            <View style={[styles.pointsInfoIcon, { backgroundColor: "#E8F5FF" }]}>
              <Ionicons name="cart" size={18} color="#2D9CDB" />
            </View>
            <View style={styles.pointsInfoText}>
              <Text style={styles.pointsInfoItemTitle}>Order Volume</Text>
              <Text style={styles.pointsInfoItemDesc}>10 points per order</Text>
            </View>
          </View>

          <View style={styles.pointsInfoItem}>
            <View style={[styles.pointsInfoIcon, { backgroundColor: "#FFF8E8" }]}>
              <Ionicons name="star" size={18} color="#F2994A" />
            </View>
            <View style={styles.pointsInfoText}>
              <Text style={styles.pointsInfoItemTitle}>Customer Ratings</Text>
              <Text style={styles.pointsInfoItemDesc}>50 points per 5-star rating</Text>
            </View>
          </View>

          <View style={styles.pointsInfoItem}>
            <View style={[styles.pointsInfoIcon, { backgroundColor: "#F0FFF4" }]}>
              <Ionicons name="time" size={18} color="#2FAE60" />
            </View>
            <View style={styles.pointsInfoText}>
              <Text style={styles.pointsInfoItemTitle}>Delivery Speed</Text>
              <Text style={styles.pointsInfoItemDesc}>30 points for on-time delivery</Text>
            </View>
          </View>

          <View style={styles.pointsInfoItem}>
            <View style={[styles.pointsInfoIcon, { backgroundColor: "#F3F0FF" }]}>
              <Ionicons name="repeat" size={18} color="#9B51E0" />
            </View>
            <View style={styles.pointsInfoText}>
              <Text style={styles.pointsInfoItemTitle}>Repeat Customers</Text>
              <Text style={styles.pointsInfoItemDesc}>20 points per returning customer</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.safeArea}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overall" && styles.activeTab]}
          onPress={() => setActiveTab("overall")}
        >
          <Text style={[styles.tabText, activeTab === "overall" && styles.activeTabText]}>Overall</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "nearby" && styles.activeTab]}
          onPress={() => setActiveTab("nearby")}
        >
          <Text style={[styles.tabText, activeTab === "nearby" && styles.activeTabText]}>Nearby</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "category" && styles.activeTab]}
          onPress={() => setActiveTab("category")}
        >
          <Text style={[styles.tabText, activeTab === "category" && styles.activeTabText]}>Same Category</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoButton} onPress={() => setShowPointsInfo(!showPointsInfo)}>
            <Ionicons name="information-circle-outline" size={22} color="#333" />
          </TouchableOpacity>
      </View>
      {renderPointsInfo()}

      <View style={styles.timeFilterContainer}>
        <TouchableOpacity
          style={[styles.timeFilterButton, timeFilter === "day" && styles.activeTimeFilter]}
          onPress={() => setTimeFilter("day")}
        >
          <Text style={[styles.timeFilterText, timeFilter === "day" && styles.activeTimeFilterText]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeFilterButton, timeFilter === "week" && styles.activeTimeFilter]}
          onPress={() => setTimeFilter("week")}
        >
          <Text style={[styles.timeFilterText, timeFilter === "week" && styles.activeTimeFilterText]}>This Week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeFilterButton, timeFilter === "month" && styles.activeTimeFilter]}
          onPress={() => setTimeFilter("month")}
        >
          <Text style={[styles.timeFilterText, timeFilter === "month" && styles.activeTimeFilterText]}>This Month</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.leaderboardContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2FAE60" />
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : (
          <>
            <View style={styles.leaderboardHeader}>
              <Text style={styles.leaderboardTitle}>
                {activeTab === "overall"
                  ? "Top Merchants"
                  : activeTab === "nearby"
                    ? "Nearby Competitors"
                    : "Local Food Category"}
              </Text>
              <Text style={styles.leaderboardSubtitle}>
                {timeFilter === "day"
                  ? "Today's Rankings"
                  : timeFilter === "week"
                    ? "This Week's Rankings"
                    : "This Month's Rankings"}
              </Text>
            </View>

            {activeTab === "overall" && (
              <View style={styles.topThreeContainer}>
                {/* Second Place */}
                <View style={[styles.topThreeItem, styles.secondPlace]}>
                  <View style={styles.crownContainer}>
                    <Ionicons name="trophy" size={20} color="#C0C0C0" />
                  </View>
                  <Image source={require("../assets/profile-placeholder2.png")} style={styles.topThreeImage} />
                  <View style={[styles.topThreeBadge, styles.secondPlaceBadge]}>
                    <Text style={styles.topThreeBadgeText}>2</Text>
                  </View>
                  <Text style={styles.topThreeName} numberOfLines={1}>
                    {leaderboardData.overall[1].name}
                  </Text>
                  <Text style={styles.topThreeValue}>{leaderboardData.overall[1].points} pts</Text>
                  {leaderboardData.overall[1].badges && leaderboardData.overall[1].badges[0] && (
                    <View
                      style={[
                        styles.topThreeBadgeItem,
                        { backgroundColor: badgeColors[leaderboardData.overall[1].badges[0]]?.bg || "#f0f0f0" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.topThreeBadgeItemText,
                          { color: badgeColors[leaderboardData.overall[1].badges[0]]?.text || "#666" },
                        ]}
                      >
                        {leaderboardData.overall[1].badges[0]}
                      </Text>
                    </View>
                  )}
                </View>

                {/* First Place */}
                <View style={[styles.topThreeItem, styles.firstPlace]}>
                  <View style={styles.crownContainer}>
                    <Ionicons name="trophy" size={24} color="#FFD700" />
                  </View>
                  <Image
                    source={require("../assets/profile-placeholder1.png")}
                    style={[styles.topThreeImage, styles.firstPlaceImage]}
                  />
                  <View style={[styles.topThreeBadge, styles.firstPlaceBadge]}>
                    <Text style={styles.topThreeBadgeText}>1</Text>
                  </View>
                  <Text style={[styles.topThreeName, styles.firstPlaceName]} numberOfLines={1}>
                    {leaderboardData.overall[0].name}
                  </Text>
                  <Text style={[styles.topThreeValue, styles.firstPlaceValue]}>
                    {leaderboardData.overall[0].points} pts
                  </Text>
                  {leaderboardData.overall[0].badges && leaderboardData.overall[0].badges[0] && (
                    <View
                      style={[
                        styles.topThreeBadgeItem,
                        { backgroundColor: badgeColors[leaderboardData.overall[0].badges[0]]?.bg || "#f0f0f0" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.topThreeBadgeItemText,
                          { color: badgeColors[leaderboardData.overall[0].badges[0]]?.text || "#666" },
                        ]}
                      >
                        {leaderboardData.overall[0].badges[0]}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Third Place */}
                <View style={[styles.topThreeItem, styles.thirdPlace]}>
                  <View style={styles.crownContainer}>
                    <Ionicons name="trophy" size={20} color="#CD7F32" />
                  </View>
                  <Image source={require("../assets/profile-placeholder3.png")} style={styles.topThreeImage} />
                  <View style={[styles.topThreeBadge, styles.thirdPlaceBadge]}>
                    <Text style={styles.topThreeBadgeText}>3</Text>
                  </View>
                  <Text style={styles.topThreeName} numberOfLines={1}>
                    {leaderboardData.overall[2].name}
                  </Text>
                  <Text style={styles.topThreeValue}>{leaderboardData.overall[2].points} pts</Text>
                  {leaderboardData.overall[2].badges && leaderboardData.overall[2].badges[0] && (
                    <View
                      style={[
                        styles.topThreeBadgeItem,
                        { backgroundColor: badgeColors[leaderboardData.overall[2].badges[0]]?.bg || "#f0f0f0" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.topThreeBadgeItemText,
                          { color: badgeColors[leaderboardData.overall[2].badges[0]]?.text || "#666" },
                        ]}
                      >
                        {leaderboardData.overall[2].badges[0]}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <ScrollView style={styles.rankingsList}>
              {leaderboardData[activeTab].map((merchant, index) => {
                // Skip the top 3 in overall view since they're shown in the podium
                if (activeTab === "overall" && index < 3) return null
                return renderMerchantRank(merchant, index)
              })}
            </ScrollView>
          </>
        )}
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Ionicons name="bulb-outline" size={20} color="#2FAE60" />
          <Text style={styles.insightTitle}>Performance Insight</Text>
        </View>
        <Text style={styles.insightText}>
          Your points are 15% higher than the average in your category. Your "Fast Delivery" badge is helping you stand
          out!
        </Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
  },
  filterButton: {
    padding: 8,
  },
  infoButton: {
    padding: 8,
    marginRight: 4,
  },
  filterOptionsContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  filterOptionActive: {
    backgroundColor: "#e6f7ef",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#666",
  },
  filterOptionTextActive: {
    color: "#2FAE60",
    fontWeight: "500",
  },
  pointsInfoContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pointsInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pointsInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  pointsInfoContent: {
    marginBottom: 8,
  },
  pointsInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  pointsInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pointsInfoText: {
    flex: 1,
  },
  pointsInfoItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  pointsInfoItemDesc: {
    fontSize: 12,
    color: "#666",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#e6f7ef",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#2FAE60",
    fontWeight: "500",
  },
  timeFilterContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  timeFilterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  activeTimeFilter: {
    backgroundColor: "#e6f7ef",
  },
  timeFilterText: {
    fontSize: 12,
    color: "#666",
  },
  activeTimeFilterText: {
    color: "#2FA E60",
    fontWeight: "500",
  },
  leaderboardContainer: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 8,
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  leaderboardHeader: {
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  topThreeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  topThreeItem: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  firstPlace: {
    marginTop: -20,
  },
  secondPlace: {
    marginBottom: 10,
  },
  thirdPlace: {
    marginBottom: 10,
  },
  crownContainer: {
    marginBottom: 4,
  },
  topThreeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#C0C0C0",
  },
  firstPlaceImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: "#FFD700",
    borderWidth: 3,
  },
  topThreeBadge: {
    position: "absolute",
    bottom: 45,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#C0C0C0",
    justifyContent: "center",
    alignItems: "center",
  },
  firstPlaceBadge: {
    bottom: 55,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFD700",
  },
  secondPlaceBadge: {
    backgroundColor: "#C0C0C0",
  },
  thirdPlaceBadge: {
    backgroundColor: "#CD7F32",
  },
  topThreeBadgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  topThreeName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    marginTop: 8,
    textAlign: "center",
    width: 80,
  },
  firstPlaceName: {
    fontSize: 14,
    fontWeight: "bold",
    width: 100,
  },
  topThreeValue: {
    fontSize: 12,
    color: "#2FAE60",
    marginTop: 4,
  },
  firstPlaceValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  topThreeBadgeItem: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 6,
  },
  topThreeBadgeItemText: {
    fontSize: 10,
    fontWeight: "500",
  },
  rankingsList: {
    flex: 1,
  },
  merchantItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  currentMerchantItem: {
    borderWidth: 1,
    borderColor: "#2FAE60",
    backgroundColor: "#f0f9f4",
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  youLabel: {
    color: "#2FAE60",
    fontWeight: "bold",
  },
  merchantDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  merchantCategory: {
    fontSize: 12,
    color: "#666",
  },
  merchantDistance: {
    fontSize: 12,
    color: "#666",
  },
  badgesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeItem: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  moreBadges: {
    fontSize: 10,
    color: "#999",
    marginLeft: 2,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    marginLeft: 12,
    minWidth: 60,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2FAE60",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "#999",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 2,
  },
  insightCard: {
    backgroundColor: "#f0f9f4",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderLeftWidth: 4,
    borderLeftColor: "#2FAE60",
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
})
