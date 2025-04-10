import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"

export default function AdviceScreen() {
  const [expandedAdvice, setExpandedAdvice] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAllInsights, setShowAllInsights] = useState(false)
  const [showAllResources, setShowAllResources] = useState(false)
  
  // Mock merchant data - in a real app, this would come from an API
  const merchantData = {
    name: "Vni",
    businessName: "Warung Makan Sedap",
    recentPerformance: {
      salesChange: "+12%",
      period: "this week",
      topSellingItem: "Nasi Lemak",
    }
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

  const adviceItems = [
    {
        id: "1",
        category: "sales",
        title: "Add more spicy options",
        impact: "Potential +18% new orders",
        details: "85% of customers in your area prefer spicy food. Consider adding Sambal Udang and spicier versions of your Mee Goreng. Restaurants with spicy options see 18% higher repeat orders in your region.",
        icon: "flame",
        color: "#E74C3C",
    },
    {
      id: "2",
      category: "sales",
      title: "Optimize peak hours",
      impact: "Potential +15% revenue",
      details: "Your restaurant is busiest from 12-2 PM and 7-9 PM. Consider offering a special combo of Nasi Lemak with Ayam Goreng during these hours to increase your average order value.",
      icon: "trending-up",
      color: "#2FAE60",
    },
    {
      id: "3",
      category: "sales",
      title: "Expand delivery radius",
      impact: "Potential +8% new customers",
      details: "There's high demand for Malaysian food in the Bukit Timah area, just outside your current delivery zone. Expanding your radius could bring in 20-30 new customers weekly.",
      icon: "location",
      color: "#2D9CDB",
    },
    {
      id: "4",
      category: "customers",
      title: "Boost your ratings",
      impact: "Potential +15% repeat orders",
      details: "Your rating is 4.2/5, with praise for your authentic flavors. However, 15% of reviews mention wait times. Responding to these reviews could improve customer retention.",
      icon: "star",
      color: "#F2994A",
    },
    {
      id: "5",
      category: "finance",
      title: "Optimize rice costs",
      impact: "Potential $1,440 annual savings",
      details: "Your rice costs increased 8% this quarter. Switching to a local supplier could save approximately $120/month while maintaining the quality of your Nasi Lemak and other rice dishes.",
      icon: "calculator",
      color: "#9B51E0",
    },
    {
      id: "6",
      category: "inventory",
      title: "Reduce food waste",
      impact: "Potential 12% cost reduction",
      details: "Data shows you're discarding 18% of prepared Mee Goreng on Mondays. Consider reducing your preparation by 15% on slower days or offering end-of-day discounts.",
      icon: "cube",
      color: "#2D9CDB",
    },
  ]
  
  const learningResources = [
    {
        id: "1",
        title: "Spicy Food Trends in Southeast Asia",
        type: "Report",
        duration: "8 min read",
        icon: "document-text",
        color: "#E74C3C",
        category: "sales",
    },
    {
      id: "2",
      title: "Managing Peak Hours in Restaurants",
      type: "Video",
      duration: "12 min",
      icon: "videocam",
      color: "#F2994A",
      category: "sales",
    },
    {
      id: "3",
      title: "Reducing Food Waste in Asian Cuisine",
      type: "Guide",
      duration: "5 min read",
      icon: "document-text",
      color: "#2D9CDB",
      category: "inventory",
    },
    {
      id: "4",
      title: "Customer Service Excellence",
      type: "Course",
      duration: "1 hour",
      icon: "school",
      color: "#9B51E0",
      category: "customers",
    },
    {
      id: "5",
      title: "Financial Planning for Food Businesses",
      type: "Webinar",
      duration: "45 min",
      icon: "cash",
      color: "#2FAE60",
      category: "finance",
    },
  ]

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Insights</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* Personalized greeting */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingContent}>
            <Text style={styles.greetingName}>Hi, {merchantData.name}</Text>
            <Text style={styles.greetingBusiness}>{merchantData.businessName}</Text>
            <View style={styles.performanceContainer}>
              <Text style={styles.performanceText}>
                Sales are up <Text style={styles.highlightText}>{merchantData.recentPerformance.salesChange}</Text> {merchantData.recentPerformance.period}
              </Text>
              <Text style={styles.performanceText}>
                Top seller: <Text style={styles.highlightText}>{merchantData.recentPerformance.topSellingItem}</Text>
              </Text>
            </View>
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
          <Text style={styles.sectionTitle}>
            {selectedCategory && selectedCategory !== "all"
              ? `${adviceCategories.find(c => c.id === selectedCategory)?.title} Tips` 
              : "Personalized Tips"}
          </Text>

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
                      <Ionicons name={item.icon} size={18} color={item.color} />
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
        </View>
        
        {/* Learning Resources */}
        {filteredResources.length > 0 && (
          <View style={styles.resourcesContainer}>
            <Text style={styles.sectionTitle}>Learning Resources</Text>
            
            {filteredResources.map((resource) => (
              <TouchableOpacity key={resource.id} style={styles.resourceCard}>
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
    width: 85,
    height: 85,
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
})