import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

export default function AdviceScreen() {
  const adviceCategories = [
    {
      id: "1",
      title: "Sales Optimization",
      icon: "cash-outline",
      color: "#2FAE60",
    },
    {
      id: "2",
      title: "Inventory Management",
      icon: "cube-outline",
      color: "#2D9CDB",
    },
    {
      id: "3",
      title: "Customer Engagement",
      icon: "people-outline",
      color: "#F2994A",
    },
    {
      id: "4",
      title: "Financial Planning",
      icon: "wallet-outline",
      color: "#9B51E0",
    },
  ]

  const adviceItems = [
    {
      id: "1",
      category: "Sales Optimization",
      title: "Optimize your peak hours",
      description:
        "Based on your data, consider offering combo deals during 12-2 PM to maximize your lunch rush. This could increase your average order value by 20%.",
      icon: "trending-up",
      color: "#2FAE60",
    },
    {
      id: "2",
      category: "Location Strategy",
      title: "Expand your delivery radius",
      description:
        "Data shows high demand for your cuisine in nearby neighborhoods. Consider expanding your delivery radius by 2km to reach more customers.",
      icon: "location",
      color: "#2D9CDB",
    },
    {
      id: "3",
      category: "Customer Engagement",
      title: "Boost your ratings",
      description:
        "Responding to customer reviews within 24 hours has been shown to increase repeat orders by 15%. Try to respond to all reviews this week.",
      icon: "star",
      color: "#F2994A",
    },
    {
      id: "4",
      category: "Financial Planning",
      title: "Track your expenses",
      description:
        "Your food cost percentage is 32%, which is slightly above industry average. Consider reviewing your suppliers or adjusting portion sizes.",
      icon: "calculator",
      color: "#9B51E0",
    },
    {
      id: "5",
      category: "Inventory Management",
      title: "Reduce food waste",
      description:
        "Your data shows consistent overstock of certain ingredients. Consider implementing a just-in-time inventory system to reduce waste by up to 25%.",
      icon: "cube",
      color: "#2D9CDB",
    },
  ]

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Advice</Text>
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Categories</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {adviceCategories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                <Ionicons name={category.icon} size={24} color={category.color} />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.todayAdviceContainer}>
          <Text style={styles.sectionTitle}>Today's Recommendations</Text>

          {adviceItems.map((item) => (
            <View key={item.id} style={styles.adviceCard}>
              <View style={styles.adviceHeader}>
                <View style={[styles.adviceIconContainer, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <View style={styles.adviceTitleContainer}>
                  <Text style={styles.adviceCategory}>{item.category}</Text>
                  <Text style={styles.adviceTitle}>{item.title}</Text>
                </View>
                <TouchableOpacity style={styles.bookmarkButton}>
                  <Ionicons name="bookmark-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={styles.adviceDescription}>{item.description}</Text>

              <View style={styles.adviceActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="checkmark-circle" size={16} color="#2FAE60" />
                  <Text style={styles.actionText}>Apply</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-social" size={16} color="#666" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.resourcesContainer}>
          <Text style={styles.sectionTitle}>Learning Resources</Text>

          <TouchableOpacity style={styles.resourceCard}>
            <View style={styles.resourceIconContainer}>
              <Ionicons name="book" size={24} color="#2D9CDB" />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Financial Management for Small Businesses</Text>
              <Text style={styles.resourceDescription}>Free online course • 2 hours</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceCard}>
            <View style={styles.resourceIconContainer}>
              <Ionicons name="videocam" size={24} color="#F2994A" />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Maximizing Your Restaurant Sales</Text>
              <Text style={styles.resourceDescription}>Video tutorial • 15 minutes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingBottom: 16,
  },
  categoryCard: {
    width: 120,
    height: 100,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  todayAdviceContainer: {
    marginVertical: 16,
  },
  adviceCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
  adviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  adviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  adviceTitleContainer: {
    flex: 1,
  },
  adviceCategory: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  bookmarkButton: {
    padding: 8,
  },
  adviceDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  adviceActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  resourcesContainer: {
    marginBottom: 20,
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
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
  resourceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
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
  resourceDescription: {
    fontSize: 12,
    color: "#999",
  },
})
