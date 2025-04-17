"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { LineChart } from "react-native-chart-kit"

const { width } = Dimensions.get("window")

export default function PromoMonitorScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("active")
  const [isLoading, setIsLoading] = useState(false)
  const [promotions, setPromotions] = useState([])
  const [selectedPromo, setSelectedPromo] = useState(null)

  // Sample promotions data
  const samplePromotions = {
    active: [
      {
        id: 1,
        name: "Nasi Lemak Combo",
        type: "bundle",
        discount: "15% OFF",
        startDate: "2023-10-01",
        endDate: "2023-10-31",
        status: "active",
        items: ["Nasi Lemak", "Teh Tarik"],
        performance: {
          views: 1250,
          clicks: 320,
          redemptions: 180,
          revenue: 1620,
          conversionRate: 14.4,
          dailyData: {
            labels: ["1 Oct", "8 Oct", "15 Oct", "22 Oct", "29 Oct"],
            datasets: [
              {
                data: [20, 45, 28, 80, 99],
                color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
              },
            ],
          },
        },
      },
      {
        id: 2,
        name: "Weekend Special",
        type: "percentage",
        discount: "20% OFF",
        startDate: "2023-10-07",
        endDate: "2023-10-29",
        status: "active",
        items: ["All Menu Items"],
        performance: {
          views: 980,
          clicks: 250,
          redemptions: 120,
          revenue: 1080,
          conversionRate: 12.2,
          dailyData: {
            labels: ["7 Oct", "14 Oct", "21 Oct", "28 Oct"],
            datasets: [
              {
                data: [15, 35, 40, 30],
                color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
              },
            ],
          },
        },
      },
    ],
    scheduled: [
      {
        id: 3,
        name: "Breakfast Special",
        type: "bundle",
        discount: "10% OFF",
        startDate: "2023-11-01",
        endDate: "2023-11-30",
        status: "scheduled",
        items: ["Roti Canai", "Teh Tarik"],
      },
    ],
    completed: [
      {
        id: 4,
        name: "Merdeka Promo",
        type: "fixed",
        discount: "RM5 OFF",
        startDate: "2023-08-20",
        endDate: "2023-09-20",
        status: "completed",
        items: ["All Menu Items"],
        performance: {
          views: 2100,
          clicks: 580,
          redemptions: 320,
          revenue: 2880,
          conversionRate: 15.2,
          dailyData: {
            labels: ["20 Aug", "27 Aug", "3 Sep", "10 Sep", "17 Sep"],
            datasets: [
              {
                data: [25, 60, 85, 70, 40],
                color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
              },
            ],
          },
        },
      },
      {
        id: 5,
        name: "Lunch Special",
        type: "percentage",
        discount: "15% OFF",
        startDate: "2023-07-01",
        endDate: "2023-07-31",
        status: "completed",
        items: ["All Main Courses"],
        performance: {
          views: 1800,
          clicks: 420,
          redemptions: 240,
          revenue: 2160,
          conversionRate: 13.3,
          dailyData: {
            labels: ["1 Jul", "8 Jul", "15 Jul", "22 Jul", "29 Jul"],
            datasets: [
              {
                data: [30, 45, 60, 50, 35],
                color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
              },
            ],
          },
        },
      },
    ],
  }

  useEffect(() => {
    loadPromotions()
  }, [activeTab])

  const loadPromotions = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setPromotions(samplePromotions[activeTab] || [])
      setIsLoading(false)
    }, 500)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#2FAE60"
      case "scheduled":
        return "#2D9CDB"
      case "completed":
        return "#9B51E0"
      default:
        return "#999"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  }

  const handlePromoPress = (promo) => {
    setSelectedPromo(promo)
  }

  const handleCreatePromo = () => {
    navigation.navigate("PromoBuilder")
  }

  const renderPromoCard = (promo) => (
    <TouchableOpacity
      key={promo.id}
      style={[styles.promoCard, selectedPromo?.id === promo.id && styles.promoCardSelected]}
      onPress={() => handlePromoPress(promo)}
    >
      <View style={styles.promoHeader}>
        <View style={styles.promoTitleContainer}>
          <Text style={styles.promoName}>{promo.name}</Text>
          <View style={[styles.promoStatus, { backgroundColor: `${getStatusColor(promo.status)}20` }]}>
            <Text style={[styles.promoStatusText, { color: getStatusColor(promo.status) }]}>
              {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
            </Text>
          </View>
        </View>
        <View style={styles.promoDiscount}>
          <Text style={styles.promoDiscountText}>{promo.discount}</Text>
        </View>
      </View>

      <View style={styles.promoItems}>
        {promo.items.map((item, index) => (
          <Text key={index} style={styles.promoItemText}>
            • {item}
          </Text>
        ))}
      </View>

      <View style={styles.promoDates}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.promoDateText}>
          {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
        </Text>
      </View>

      {promo.status === "active" && promo.performance && (
        <View style={styles.promoPerformancePreview}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>{promo.performance.redemptions}</Text>
            <Text style={styles.performanceLabel}>Redeemed</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>{promo.performance.conversionRate}%</Text>
            <Text style={styles.performanceLabel}>Conversion</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceValue}>RM{promo.performance.revenue}</Text>
            <Text style={styles.performanceLabel}>Revenue</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )

  const renderPromoDetails = () => {
    if (!selectedPromo) return null

    return (
      <Modal
        visible={!!selectedPromo}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPromo(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.promoDetailsHeader}>
              <Text style={styles.promoDetailsTitle}>Promotion Details</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPromo(null)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.promoDetailsCard}>
                <View style={styles.promoDetailsTop}>
                  <View>
                    <Text style={styles.promoDetailsName}>{selectedPromo.name}</Text>
                    <View
                      style={[styles.promoStatus, { backgroundColor: `${getStatusColor(selectedPromo.status)}20` }]}
                    >
                      <Text style={[styles.promoStatusText, { color: getStatusColor(selectedPromo.status) }]}>
                        {selectedPromo.status.charAt(0).toUpperCase() + selectedPromo.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.promoDetailsDiscount}>
                    <Text style={styles.promoDetailsDiscountText}>{selectedPromo.discount}</Text>
                  </View>
                </View>

                <View style={styles.promoDetailsSection}>
                  <Text style={styles.promoDetailsSectionTitle}>Promotion Period</Text>
                  <View style={styles.promoDetailsDates}>
                    <View style={styles.promoDetailsDate}>
                      <Text style={styles.promoDetailsDateLabel}>Start Date</Text>
                      <Text style={styles.promoDetailsDateValue}>{formatDate(selectedPromo.startDate)}</Text>
                    </View>
                    <View style={styles.promoDetailsDateSeparator} />
                    <View style={styles.promoDetailsDate}>
                      <Text style={styles.promoDetailsDateLabel}>End Date</Text>
                      <Text style={styles.promoDetailsDateValue}>{formatDate(selectedPromo.endDate)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.promoDetailsSection}>
                  <Text style={styles.promoDetailsSectionTitle}>Included Items</Text>
                  <View style={styles.promoDetailsItems}>
                    {selectedPromo.items.map((item, index) => (
                      <View key={index} style={styles.promoDetailsItem}>
                        <Ionicons name="checkmark-circle" size={16} color="#2FAE60" />
                        <Text style={styles.promoDetailsItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {selectedPromo.performance && (
                  <>
                    <View style={styles.promoDetailsSection}>
                      <Text style={styles.promoDetailsSectionTitle}>Performance</Text>
                      <View style={styles.promoDetailsPerformance}>
                        <View style={styles.promoDetailsPerformanceRow}>
                          <View style={styles.promoDetailsPerformanceItem}>
                            <Text style={styles.promoDetailsPerformanceValue}>{selectedPromo.performance.views}</Text>
                            <Text style={styles.promoDetailsPerformanceLabel}>Views</Text>
                          </View>
                          <View style={styles.promoDetailsPerformanceItem}>
                            <Text style={styles.promoDetailsPerformanceValue}>{selectedPromo.performance.clicks}</Text>
                            <Text style={styles.promoDetailsPerformanceLabel}>Clicks</Text>
                          </View>
                        </View>
                        <View style={styles.promoDetailsPerformanceRow}>
                          <View style={styles.promoDetailsPerformanceItem}>
                            <Text style={styles.promoDetailsPerformanceValue}>
                              {selectedPromo.performance.redemptions}
                            </Text>
                            <Text style={styles.promoDetailsPerformanceLabel}>Redemptions</Text>
                          </View>
                          <View style={styles.promoDetailsPerformanceItem}>
                            <Text style={styles.promoDetailsPerformanceValue}>
                              {selectedPromo.performance.conversionRate}%
                            </Text>
                            <Text style={styles.promoDetailsPerformanceLabel}>Conversion Rate</Text>
                          </View>
                        </View>
                        <View style={styles.promoDetailsPerformanceRow}>
                          <View style={styles.promoDetailsPerformanceItem}>
                            <Text style={styles.promoDetailsPerformanceValue}>
                              RM{selectedPromo.performance.revenue}
                            </Text>
                            <Text style={styles.promoDetailsPerformanceLabel}>Revenue</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.promoDetailsSection}>
                      <Text style={styles.promoDetailsSectionTitle}>Redemption Trend</Text>
                      <LineChart
                        data={selectedPromo.performance.dailyData}
                        width={width - 64}
                        height={180}
                        chartConfig={{
                          backgroundGradientFrom: "#fff",
                          backgroundGradientTo: "#fff",
                          decimalPlaces: 0,
                          color: (opacity = 1) => `rgba(47, 174, 96, ${opacity})`,
                          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                          style: {
                            borderRadius: 16,
                          },
                          propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: "#2FAE60",
                          },
                        }}
                        bezier
                        style={styles.chart}
                      />
                    </View>
                  </>
                )}

                <View style={styles.promoDetailsActions}>
                  {selectedPromo.status === "active" && (
                    <TouchableOpacity style={[styles.promoDetailsAction, styles.promoDetailsActionEnd]}>
                      <Ionicons name="stop-circle-outline" size={20} color="#d32f2f" />
                      <Text style={[styles.promoDetailsActionText, styles.promoDetailsActionTextEnd]}>
                        End Promotion
                      </Text>
                    </TouchableOpacity>
                  )}

                  {selectedPromo.status === "scheduled" && (
                    <TouchableOpacity style={[styles.promoDetailsAction, styles.promoDetailsActionEdit]}>
                      <Ionicons name="create-outline" size={20} color="#2D9CDB" />
                      <Text style={[styles.promoDetailsActionText, styles.promoDetailsActionTextEdit]}>
                        Edit Promotion
                      </Text>
                    </TouchableOpacity>
                  )}

                  {selectedPromo.status === "completed" && (
                    <TouchableOpacity style={[styles.promoDetailsAction, styles.promoDetailsActionDuplicate]}>
                      <Ionicons name="copy-outline" size={20} color="#9B51E0" />
                      <Text style={[styles.promoDetailsActionText, styles.promoDetailsActionTextDuplicate]}>
                        Duplicate Promotion
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={[styles.tabText, activeTab === "active" && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "scheduled" && styles.activeTab]}
          onPress={() => setActiveTab("scheduled")}
        >
          <Text style={[styles.tabText, activeTab === "scheduled" && styles.activeTabText]}>Scheduled</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text style={[styles.tabText, activeTab === "completed" && styles.activeTabText]}>Completed</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2FAE60" />
            <Text style={styles.loadingText}>Loading promotions...</Text>
          </View>
        ) : promotions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No {activeTab} promotions found</Text>
            <TouchableOpacity style={styles.createPromoButton} onPress={handleCreatePromo}>
              <Text style={styles.createPromoButtonText}>Create New Promotion</Text>
              <Ionicons name="add-circle-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <ScrollView style={styles.promoList}>{promotions.map((promo) => renderPromoCard(promo))}</ScrollView>
            {selectedPromo && renderPromoDetails()}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.floatingButton} onPress={handleCreatePromo}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  createButton: {
    padding: 8,
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
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1
  },
  promoList: {
    flex: 1,
    padding: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  createPromoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2FAE60",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createPromoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  promoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  promoCardSelected: {
    borderWidth: 2,
    borderColor: "#2FAE60",
  },
  promoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  promoTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  promoName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  promoStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  promoStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  promoDiscount: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  promoDiscountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  promoItems: {
    marginBottom: 12,
  },
  promoItemText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  promoDates: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  promoDateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  promoPerformancePreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  performanceItem: {
    alignItems: "center",
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2FAE60",
    marginBottom: 2,
  },
  performanceLabel: {
    fontSize: 12,
    color: "#666",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2FAE60",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  promoDetailsContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
  },
  promoDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  promoDetailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  promoDetailsCard: {
    margin: 16,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  promoDetailsTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  promoDetailsName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  promoDetailsDiscount: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  promoDetailsDiscountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  promoDetailsSection: {
    marginBottom: 20,
  },
  promoDetailsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  promoDetailsDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  promoDetailsDate: {
    flex: 1,
    alignItems: "center",
  },
  promoDetailsDateLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  promoDetailsDateValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  promoDetailsDateSeparator: {
    width: 20,
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  promoDetailsItems: {
    marginBottom: 8,
  },
  promoDetailsItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  promoDetailsItemText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  promoDetailsPerformance: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
  },
  promoDetailsPerformanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  promoDetailsPerformanceItem: {
    flex: 1,
    alignItems: "center",
  },
  promoDetailsPerformanceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2FAE60",
    marginBottom: 4,
  },
  promoDetailsPerformanceLabel: {
    fontSize: 12,
    color: "#666",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  promoDetailsActions: {
    marginTop: 8,
  },
  promoDetailsAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  promoDetailsActionEnd: {
    borderColor: "#d32f2f",
  },
  promoDetailsActionEdit: {
    borderColor: "#2D9CDB",
  },
  promoDetailsActionDuplicate: {
    borderColor: "#9B51E0",
  },
  promoDetailsActionText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  promoDetailsActionTextEnd: {
    color: "#d32f2f",
  },
  promoDetailsActionTextEdit: {
    color: "#2D9CDB",
  },
  promoDetailsActionTextDuplicate: {
    color: "#9B51E0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalScrollView: {
    maxHeight: "100%",
  },
})
