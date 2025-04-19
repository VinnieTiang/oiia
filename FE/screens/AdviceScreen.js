import { useAdviceQueryData, fetchMerchantName } from "../api"
import { ActivityIndicator, View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useState, useEffect } from "react"

export default function AdviceScreen() {
  const [expandedAdvice, setExpandedAdvice] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAllInsights, setShowAllInsights] = useState(false)
  const [showAllResources, setShowAllResources] = useState(false)

  const { data: adviceItems = [], refetch, isFetching } = useAdviceQueryData();
  const [merchantName, setMerchantName] = useState("Loading...")
    const [isLoading, setIsLoading] = useState(true)
  
    useEffect(() => {
      async function loadMerchantData() {
        try {
          setIsLoading(true)
          const name = await fetchMerchantName()
          setMerchantName(name)
        } catch (error) {
          console.error("Error fetching merchant name:", error)
          setMerchantName("Merchant Name Unavailable")
        } finally {
          setIsLoading(false)
        }
      }
  
      loadMerchantData()
    }, [])

  // Mock merchant data - in a real app, this would come from an API
  const merchantData = {
    name: "Vni",
    businessName: merchantName,
  }

  const adviceCategories = [
    {
      id: "all",
      title: "All",
      icon: "grid-outline",
      color: "#555555",
    },
    {
      id: "sales",
      title: "Sales",
      icon: "cash-outline",
      color: "#2FAE60",
    },
    {
      id: "inventory",
      title: "Inventory",
      icon: "cube-outline",
      color: "#2D9CDB",
    },
    {
      id: "customers",
      title: "Customers",
      icon: "people-outline",
      color: "#F2994A",
    },
    {
      id: "finance",
      title: "Finance",
      icon: "wallet-outline",
      color: "#9B51E0",
    },
  ]

  const learningResources = [
    {
        id: "1",
        title: "Spicy Food Trends in Southeast Asia",
        type: "Report",
        duration: "10 mins read",
        icon: "document-text",
        color: "#E74C3C",
        category: "sales",
        url: "https://www.euromonitor.com/article/spicy-food-trends-in-southeast-asia",
    },
    {
      id: "2",
      title: "Managing Peak Hours in Restaurants",
      type: "Video",
      duration: "1 min",
      icon: "videocam",
      color: "#F2994A",
      category: "sales",
      url: "https://youtu.be/uhJ_VOLySPk?si=dI8R1cKNmGURuddr"
    },
    {
      id: "3",
      title: "Reducing Food Waste in Asian Cuisine",
      type: "Guide",
      duration: "1 hour read",
      icon: "document-text",
      color: "#2D9CDB",
      category: "inventory",
      url: "https://www.switch-asia.eu/site/assets/files/3901/food_waste_reduction_practical_guide.pdf"
    },
    {
      id: "4",
      title: "Customer Service Excellence",
      type: "Course",
      duration: "5 days",
      icon: "school",
      color: "#9B51E0",
      category: "customers",
      url: "https://www.lpcentre.com/kualaLumpur/customer-service/customer-service-excellence"
    },
    {
      id: "5",
      title: "Financial Planning for Food Businesses",
      type: "Guide",
      duration: "30 mins read",
      icon: "cash",
      color: "#2FAE60",
      category: "finance",
      url: "https://www.incentivio.com/blog-news-restaurant-industry/financial-planning-and-budgeting-for-restaurants-long-term-success",
    },
  ]

  const handleAdviceRefresh = () => {
    refetch();
  };

  // Set first item expanded by default
  useEffect(() => {
    if (adviceItems.length > 0) {
      setExpandedAdvice(adviceItems[0].id)
    }
  }, [])

  // Reset showAllInsights when category changes
  useEffect(() => {
    setShowAllInsights(false)
  }, [selectedCategory])

  const toggleAdvice = (id) => {
    setExpandedAdvice(expandedAdvice === id ? null : id)
  }

  const toggleShowAllInsights = () => {
    setShowAllInsights(!showAllInsights)
  }

  const toggleShowAllResources = () => {
    setShowAllResources(!showAllResources)
  }

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId === "all" ? "all" : categoryId)
    // Reset expanded state when changing categories
    if (categoryId === "all") {
      setExpandedAdvice(adviceItems[0].id)
    } else {
      const filteredItems = adviceItems.filter(item => item.category === categoryId)
      if (filteredItems.length > 0) {
        setExpandedAdvice(filteredItems[0].id)
      } else {
        setExpandedAdvice(null)
      }
    }
  }

  const filteredAdvice = selectedCategory === "all"
    ? adviceItems
    : adviceItems.filter(item => item.category === selectedCategory)

  // Limit to 3 items unless showAllInsights is true
  const displayedAdvice = showAllInsights
    ? filteredAdvice
    : filteredAdvice.slice(0, 3)

    const allCategoryResources = selectedCategory && selectedCategory !== "all"
    ? learningResources.filter(item => item.category === selectedCategory)
    : learningResources

    const filteredResources = showAllResources
    ? allCategoryResources
    : allCategoryResources.slice(0, 2)

  return (
      <ScrollView style={styles.container}>
        {/* Personalized greeting */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingContent}>
            <Text style={styles.greetingName}>Hi, {merchantData.name}</Text>
            <Text style={styles.greetingBusiness}>{merchantData.businessName}</Text>
          </View>
          <View style={styles.greetingImageContainer}>
            <View style={styles.greetingImage}>
              <Ionicons name="restaurant" size={32} color="#2FAE60" />
            </View>
          </View>
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Advice Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {adviceCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.selectedCategoryCard
              ]}
              onPress={() => selectCategory(category.id)}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: `${category.color}20` }
                ]}
              >
                <Ionicons name={category.icon} size={22} color={category.color} />
              </View>
              <Text
                style={[
                  styles.categoryTitle,
                  selectedCategory === category.id && styles.selectedCategoryTitle
                ]}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Advice items */}
        <View style={styles.todayAdviceContainer}>
            <View style={{ flexDirection: "row" }}>
                <Text style={styles.sectionTitle}>
                    {selectedCategory && selectedCategory !== "all"
                    ? `${adviceCategories.find(c => c.id === selectedCategory)?.title} Tips`
                    : "Personalized Tips"}
                </Text>
                <TouchableOpacity
                    style={{ marginLeft: 18 }} // move margin here instead of icon itself
                    onPress={handleAdviceRefresh}
                >
                    <Feather name="refresh-cw" size={20} color="#999" />
                </TouchableOpacity>
            </View>

            {isFetching ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color="#2D9CDB" />
          <Text>Generating advice...</Text>
        </View>
      ) : (
        <>
          {filteredAdvice.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="information-circle-outline" size={40} color="#999" />
              <Text style={styles.emptyStateText}>No insights available in this category</Text>
            </View>
          ) : (
            <>
              {displayedAdvice.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.insightItem,
                    expandedAdvice === item.id && styles.expandedInsightItem
                  ]}
                  onPress={() => toggleAdvice(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.insightHeader}>
                    <View style={[styles.insightIconContainer, { backgroundColor: `${item.color}20` }]}>
                      <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
                    </View>
                    <View style={styles.insightTitleContainer}>
                      <Text style={styles.insightTitle}>{item.title}</Text>
                      <Text style={styles.insightImpact}>{item.impact}</Text>
                    </View>
                    <Ionicons
                      name={expandedAdvice === item.id ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#666"
                    />
                  </View>

                  {expandedAdvice === item.id && (
                    <View style={styles.insightDetailsContainer}>
                      <Text style={styles.detailsText}>{item.details}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              {/* Show "See more" / "See less" button only if there are more than 3 items */}
              {filteredAdvice.length > 3 && (
                <TouchableOpacity
                  style={styles.seeMoreButton}
                  onPress={toggleShowAllInsights}
                >
                  <Text style={styles.seeMoreText}>
                    {showAllInsights ? "See less" : "See more"}
                  </Text>
                  <Ionicons
                    name={showAllInsights ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#2D9CDB"
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </>
      )}
    </View>

        {/* Learning Resources */}
        {filteredResources.length > 0 && (
          <View style={styles.resourcesContainer}>
            <Text style={styles.sectionTitle}>Learning Resources</Text>

            {filteredResources.map((resource) => (
              <TouchableOpacity
                  key={resource.id}
                  style={styles.resourceCard}
                  onPress={() => Linking.openURL(resource.url)}>
                <View style={[styles.resourceIconContainer, { backgroundColor: `${resource.color}15` }]}>
                  <Ionicons name={resource.icon} size={20} color={resource.color} />
                </View>
                <View style={styles.resourceContent}>
                  <Text style={styles.resourceTitle}>{resource.title}</Text>
                  <View style={styles.resourceMeta}>
                    <Text style={styles.resourceType}>{resource.type}</Text>
                    <Text style={styles.resourceDot}>•</Text>
                    <Text style={styles.resourceDuration}>{resource.duration}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>
            ))}

            {allCategoryResources.length > 2 && (
              <TouchableOpacity onPress={toggleShowAllResources} style={styles.seeMoreButton}>
                <Text style={styles.seeMoreText}>
                {showAllResources ? "See less" : "See more"}
                </Text>
                <Ionicons
                    name={showAllResources ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#2D9CDB"
                  />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
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
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  greetingCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: "row",
  },
  greetingContent: {
    flex: 1,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  greetingBusiness: {
    fontSize: 15,
    color: "#666",
    marginBottom: 12,
  },
  performanceContainer: {
    marginTop: 8,
  },
  performanceText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  highlightText: {
    color: "#2FAE60",
    fontWeight: "600",
  },
  greetingImageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  greetingImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingBottom: 20,
  },
  categoryCard: {
    width: 90,
    height: 90,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  selectedCategoryCard: {
    backgroundColor: "#f5f9ff",
    borderWidth: 1,
    borderColor: "#2D9CDB20",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#555",
    textAlign: "center",
  },
  selectedCategoryTitle: {
    color: "#2D9CDB",
    fontWeight: "600",
  },
  todayAdviceContainer: {
    marginBottom: 24,
  },
  insightItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  expandedInsightItem: {
    borderWidth: 1,
    borderColor: "#2D9CDB20",
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  insightImpact: {
    fontSize: 12,
    color: "#2FAE60",
    fontWeight: "500",
  },
  insightDetailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  detailsText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  seeMoreText: {
    fontSize: 14,
    color: "#2D9CDB",
    fontWeight: "500",
    marginRight: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "white",
    borderRadius: 16,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  resourcesContainer: {
    marginBottom: 24,
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  resourceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  resourceMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  resourceType: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  resourceDot: {
    fontSize: 12,
    color: "#999",
    marginHorizontal: 4,
  },
  resourceDuration: {
    fontSize: 12,
    color: "#999",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: "#2D9CDB",
    fontWeight: "500",
    marginRight: 6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.6)', // white overlay with transparency
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // make sure it sits on top
  },
})