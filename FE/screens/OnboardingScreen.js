"use client"

import { useState, useRef } from "react"
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

const slides = [
  {
    id: "1",
    title: "Grow Your Business",
    description: "Get personalized insights and advice to maximize your sales and customer engagement",
    icon: "trending-up-outline",
  },
  {
    id: "2",
    title: "Smart Insights",
    description: "Track your performance and discover patterns to make data-driven business decisions",
    icon: "analytics-outline",
  },
  {
    id: "3",
    title: "AI-Powered Advice",
    description: "Receive tailored recommendations based on your business history and goals",
    icon: "bulb-outline",
  },
]

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef(null)

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={80} color="#2FAE60" />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    )
  }

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 })
      setCurrentIndex(currentIndex + 1)
    } else {
      navigation.navigate("MainApp")
    }
  }

  const handleSkip = () => {
    navigation.navigate("MainApp")
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width)
          setCurrentIndex(index)
        }}
      />

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.paginationDot, index === currentIndex ? styles.paginationDotActive : null]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{currentIndex === slides.length - 1 ? "Get Started" : "Next"}</Text>
          <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 5 }} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  slide: {
    width,
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#f0f9f4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: "#2FAE60",
    width: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  skipButton: {
    padding: 15,
  },
  skipButtonText: {
    color: "#666",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "#2FAE60",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
