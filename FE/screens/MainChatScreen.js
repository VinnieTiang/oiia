"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

// Get screen dimensions
const { width: screenWidth } = Dimensions.get("window")

// Define message types for different content
const MESSAGE_TYPES = {
  TEXT: "text",
  SALES_SUMMARY: "sales_summary",
  INVENTORY_ALERT: "inventory_alert",
  INSIGHT_CHART: "insight_chart",
  QUICK_ACTIONS: "quick_actions",
  PROFILE_CARD: "profile_card",
}

export default function MainChatScreen({ navigation }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      type: MESSAGE_TYPES.TEXT,
      text: "Hello! I'm Grablet, your AI assistant. How can I help you today?",
      sender: "mascot",
      timestamp: new Date(),
    },
    {
      id: "welcome-2",
      type: MESSAGE_TYPES.QUICK_ACTIONS,
      sender: "mascot",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [mascotAnimation] = useState(new Animated.Value(0))

  const flatListRef = useRef(null)
  const inputRef = useRef(null)

  // Animate mascot on load
  useEffect(() => {
    animateMascot()
  }, [])

  const animateMascot = () => {
    Animated.sequence([
      Animated.timing(mascotAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(mascotAnimation, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(mascotAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleSend = () => {
    if (message.trim() === "") return

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: MESSAGE_TYPES.TEXT,
      text: message,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])
    setMessage("")

    // Show typing indicator
    setIsTyping(true)

    // Process the message and generate a response
    setTimeout(() => {
      processUserMessage(message)
      setIsTyping(false)
    }, 1000)
  }

  const processUserMessage = (userMessage) => {
    // Animate mascot when responding
    animateMascot()

    const lowerCaseMessage = userMessage.toLowerCase()

    // Handle different types of queries
    if (
      lowerCaseMessage.includes("sales") ||
      lowerCaseMessage.includes("revenue") ||
      lowerCaseMessage.includes("earning") ||
      lowerCaseMessage.includes("income")
    ) {
      // Sales related query
      addMascotMessage("Here's a summary of your recent sales performance:", MESSAGE_TYPES.TEXT)
      addMascotMessage(null, MESSAGE_TYPES.SALES_SUMMARY)
    } else if (
      lowerCaseMessage.includes("inventory") ||
      lowerCaseMessage.includes("stock") ||
      lowerCaseMessage.includes("item") ||
      lowerCaseMessage.includes("product")
    ) {
      // Inventory related query
      addMascotMessage("I noticed some items in your inventory are running low:", MESSAGE_TYPES.TEXT)
      addMascotMessage(null, MESSAGE_TYPES.INVENTORY_ALERT)

      // Add option to go to inventory screen
      setTimeout(() => {
        addMascotMessage("Would you like to see your full inventory?", MESSAGE_TYPES.TEXT)
        addQuickReplies([
          { text: "View Inventory", action: "inventory" },
          { text: "Not now", action: "dismiss" },
        ])
      }, 500)
    } else if (
      lowerCaseMessage.includes("insight") ||
      lowerCaseMessage.includes("chart") ||
      lowerCaseMessage.includes("data") ||
      lowerCaseMessage.includes("analytics") ||
      lowerCaseMessage.includes("performance")
    ) {
      // Insights related query
      addMascotMessage("Here's your latest business performance data:", MESSAGE_TYPES.TEXT)
      addMascotMessage(null, MESSAGE_TYPES.INSIGHT_CHART)

      // Add option to go to insights screen
      setTimeout(() => {
        addMascotMessage("Would you like to see more detailed insights?", MESSAGE_TYPES.TEXT)
        addQuickReplies([
          { text: "View Insights", action: "insight" },
          { text: "Not now", action: "dismiss" },
        ])
      }, 500)
    } else if (
      lowerCaseMessage.includes("profile") ||
      lowerCaseMessage.includes("account") ||
      lowerCaseMessage.includes("setting") ||
      lowerCaseMessage.includes("my info")
    ) {
      // Profile related query
      addMascotMessage("Here's your profile information:", MESSAGE_TYPES.TEXT)
      addMascotMessage(null, MESSAGE_TYPES.PROFILE_CARD)
    } else if (
      lowerCaseMessage.includes("help") ||
      lowerCaseMessage.includes("what can you do") ||
      lowerCaseMessage.includes("feature") ||
      lowerCaseMessage.includes("function")
    ) {
      // Help query
      addMascotMessage("I can help you with many things! Here are some options:", MESSAGE_TYPES.TEXT)
      addMascotMessage(null, MESSAGE_TYPES.QUICK_ACTIONS)
    } else {
      // General response
      const generalResponses = [
        "I can help you manage your business. Try asking about your sales, inventory, or insights!",
        "Would you like to see your business performance or check your inventory?",
        "I'm here to boost your business! Ask me about sales trends, inventory status, or business advice.",
        "How can I assist you with your business today? I can show sales data, inventory status, or provide recommendations.",
      ]

      const randomResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)]
      addMascotMessage(randomResponse, MESSAGE_TYPES.TEXT)

      // After a short delay, show quick actions
      setTimeout(() => {
        addMascotMessage(null, MESSAGE_TYPES.QUICK_ACTIONS)
      }, 500)
    }
  }

  const addMascotMessage = (text, type) => {
    const newMessage = {
      id: `mascot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      text: text,
      sender: "mascot",
      timestamp: new Date(),
    }

    setMessages((prevMessages) => [...prevMessages, newMessage])
  }

  const addQuickReplies = (replies) => {
    const newMessage = {
      id: `quick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: "quick_replies",
      replies: replies,
      sender: "mascot",
      timestamp: new Date(),
    }

    setMessages((prevMessages) => [...prevMessages, newMessage])
  }

  const handleQuickAction = (action) => {
    // Add user message showing the selected action
    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: MESSAGE_TYPES.TEXT,
      text: action.text || action,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])

    // Show typing indicator
    setIsTyping(true)

    // Process the action
    setTimeout(() => {
      handleAction(action)
      setIsTyping(false)
    }, 800)
  }

  const quickReplies = [
    "Show my sales insights",
    "Best selling items?",
    "How can I increase my revenue?",
    "Tips for customer retention",
    // Malay quick replies
    "Tunjukkan analisis jualan saya",
    "Item paling laris?",
    "Bagaimana meningkatkan pendapatan?",
    "Petua untuk kekalkan pelanggan",
    // Chinese quick replies
    "显示我的销售分析",
    "最畅销的商品？",
    "如何增加收入？",
    "客户保留技巧",
  ]

  const handleAction = (action) => {
    // Animate mascot when responding
    animateMascot()

    // Handle different actions
    if (typeof action === "object" && action.action) {
      switch (action.action) {
        case "sales":
          addMascotMessage("Here's your sales summary:", MESSAGE_TYPES.TEXT)
          addMascotMessage(null, MESSAGE_TYPES.SALES_SUMMARY)
          break
        case "inventory":
          navigation.navigate("Inventory")
          break
        case "insight":
          navigation.navigate("Insight")
          break
        case "advice":
          navigation.navigate("Advice")
          break
        case "profile":
          navigation.navigate("Profile")
          break
        case "dismiss":
          addMascotMessage("No problem! Let me know if you need anything else.", MESSAGE_TYPES.TEXT)
          break
        default:
          addMascotMessage(
            "I'm not sure how to help with that yet. Is there something else you'd like to know?",
            MESSAGE_TYPES.TEXT,
          )
      }
    } else {
      // Handle text-based actions
      switch (action.toLowerCase()) {
        case "show sales":
          addMascotMessage("Here's your sales summary:", MESSAGE_TYPES.TEXT)
          addMascotMessage(null, MESSAGE_TYPES.SALES_SUMMARY)
          break
        case "check inventory":
          addMascotMessage("I noticed some items in your inventory are running low:", MESSAGE_TYPES.TEXT)
          addMascotMessage(null, MESSAGE_TYPES.INVENTORY_ALERT)

          setTimeout(() => {
            addMascotMessage("Would you like to see your full inventory?", MESSAGE_TYPES.TEXT)
            addQuickReplies([
              { text: "View Inventory", action: "inventory" },
              { text: "Not now", action: "dismiss" },
            ])
          }, 500)
          break
        case "view insights":
          addMascotMessage("Here's your latest business performance data:", MESSAGE_TYPES.TEXT)
          addMascotMessage(null, MESSAGE_TYPES.INSIGHT_CHART)

          setTimeout(() => {
            addMascotMessage("Would you like to see more detailed insights?", MESSAGE_TYPES.TEXT)
            addQuickReplies([
              { text: "View Insights", action: "insight" },
              { text: "Not now", action: "dismiss" },
            ])
          }, 500)
          break
        case "get advice":
          addMascotMessage("Based on your recent performance, here's my advice:", MESSAGE_TYPES.TEXT)
          addMascotMessage(
            "Consider adding more spicy options to your menu. 85% of customers in your area prefer spicy food, and restaurants with spicy options see 18% higher repeat orders in your region.",
            MESSAGE_TYPES.TEXT,
          )

          setTimeout(() => {
            addMascotMessage("Would you like to see more business advice?", MESSAGE_TYPES.TEXT)
            addQuickReplies([
              { text: "View Advice", action: "advice" },
              { text: "Not now", action: "dismiss" },
            ])
          }, 500)
          break
        default:
          addMascotMessage(
            "I'm not sure how to help with that yet. Is there something else you'd like to know?",
            MESSAGE_TYPES.TEXT,
          )
          setTimeout(() => {
            addMascotMessage(null, MESSAGE_TYPES.QUICK_ACTIONS)
          }, 500)
      }
    }
  }

  const renderMessage = ({ item }) => {
    const isMascot = item.sender === "mascot"

    switch (item.type) {
      case MESSAGE_TYPES.TEXT:
        return (
          <View style={[styles.messageBubble, isMascot ? styles.mascotMessage : styles.userMessage]}>
            {isMascot && (
              <View style={styles.mascotAvatarContainer}>
                <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotAvatar} />
              </View>
            )}
            <View style={[styles.messageContent, isMascot ? styles.mascotContent : styles.userContent]}>
              <Text style={isMascot ? styles.mascotText : styles.userText}>{item.text}</Text>
              <Text style={isMascot ? styles.mascotTimestamp : styles.userTimestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>
        )

      case MESSAGE_TYPES.SALES_SUMMARY:
        return (
          <View style={styles.messageBubble}>
            <View style={styles.mascotAvatarContainer}>
              <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotAvatar} />
            </View>
            <View style={[styles.messageContent, styles.cardContent]}>
              <View style={styles.salesCard}>
                <Text style={styles.cardTitle}>Sales Summary</Text>
                <View style={styles.salesRow}>
                  <View style={styles.salesItem}>
                    <Text style={styles.salesValue}>RM1,250</Text>
                    <Text style={styles.salesLabel}>Today</Text>
                  </View>
                  <View style={styles.salesItem}>
                    <Text style={styles.salesValue}>RM8,800</Text>
                    <Text style={styles.salesLabel}>This Week</Text>
                  </View>
                  <View style={styles.salesItem}>
                    <Text style={styles.salesValue}>+12%</Text>
                    <Text style={styles.salesLabel}>vs Last Week</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate("Insight")}>
                  <Text style={styles.cardButtonText}>View Details</Text>
                  <Ionicons name="arrow-forward" size={16} color="#2FAE60" />
                </TouchableOpacity>
              </View>
              <Text style={styles.mascotTimestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>
        )

      case MESSAGE_TYPES.INVENTORY_ALERT:
        return (
          <View style={styles.messageBubble}>
            <View style={styles.mascotAvatarContainer}>
              <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotAvatar} />
            </View>
            <View style={[styles.messageContent, styles.cardContent]}>
              <View style={styles.inventoryCard}>
                <Text style={styles.cardTitle}>Low Stock Alert</Text>
                <View style={styles.inventoryList}>
                  <View style={styles.inventoryItem}>
                    <View style={[styles.inventoryStatus, { backgroundColor: "#ffebee" }]} />
                    <Text style={styles.inventoryName}>Chicken Rice</Text>
                    <Text style={styles.inventoryCount}>5 left</Text>
                  </View>
                  <View style={styles.inventoryItem}>
                    <View style={[styles.inventoryStatus, { backgroundColor: "#ffebee" }]} />
                    <Text style={styles.inventoryName}>Nasi Lemak</Text>
                    <Text style={styles.inventoryCount}>3 left</Text>
                  </View>
                  <View style={styles.inventoryItem}>
                    <View style={[styles.inventoryStatus, { backgroundColor: "#fff8e1" }]} />
                    <Text style={styles.inventoryName}>Curry Puff</Text>
                    <Text style={styles.inventoryCount}>4 left</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate("Inventory")}>
                  <Text style={styles.cardButtonText}>Manage Inventory</Text>
                  <Ionicons name="arrow-forward" size={16} color="#2FAE60" />
                </TouchableOpacity>
              </View>
              <Text style={styles.mascotTimestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>
        )

      case MESSAGE_TYPES.INSIGHT_CHART:
        return (
          <View style={styles.messageBubble}>
            <View style={styles.mascotAvatarContainer}>
              <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotAvatar} />
            </View>
            <View style={[styles.messageContent, styles.cardContent]}>
              <View style={styles.insightCard}>
                <Text style={styles.cardTitle}>Weekly Performance</Text>
                <Image source={require("../assets/chart-preview.png")} style={styles.chartImage} resizeMode="contain" />
                <View style={styles.insightHighlight}>
                  <Ionicons name="trending-up" size={16} color="#2FAE60" />
                  <Text style={styles.insightText}>Sales are up 12% this week</Text>
                </View>
                <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate("Insight")}>
                  <Text style={styles.cardButtonText}>View Full Insights</Text>
                  <Ionicons name="arrow-forward" size={16} color="#2FAE60" />
                </TouchableOpacity>
              </View>
              <Text style={styles.mascotTimestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>
        )

      case MESSAGE_TYPES.QUICK_ACTIONS:
        return (
          <View style={styles.quickActionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction("Show Sales")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "#E8F5FF" }]}>
                  <Ionicons name="cash-outline" size={20} color="#2D9CDB" />
                </View>
                <Text style={styles.quickActionText}>Show Sales</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction("Check Inventory")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "#F3F0FF" }]}>
                  <Ionicons name="cube-outline" size={20} color="#9B51E0" />
                </View>
                <Text style={styles.quickActionText}>Check Inventory</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction("View Insights")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "#F0FFF4" }]}>
                  <Ionicons name="bar-chart-outline" size={20} color="#2FAE60" />
                </View>
                <Text style={styles.quickActionText}>View Insights</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction("Get Advice")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "#FFF8E8" }]}>
                  <Ionicons name="bulb-outline" size={20} color="#F2994A" />
                </View>
                <Text style={styles.quickActionText}>Get Advice</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )

      case "quick_replies":
        return (
          <View style={styles.quickRepliesContainer}>
            {item.replies.map((reply, index) => (
              <TouchableOpacity key={index} style={styles.quickReplyButton} onPress={() => handleQuickAction(reply)}>
                <Text style={styles.quickReplyText}>{reply.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )

      case MESSAGE_TYPES.PROFILE_CARD:
        return (
          <View style={styles.messageBubble}>
            <View style={styles.mascotAvatarContainer}>
              <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotAvatar} />
            </View>
            <View style={[styles.messageContent, styles.cardContent]}>
              <View style={styles.profileCard}>
                <View style={styles.profileHeader}>
                  <Image source={require("../assets/profile-placeholder.png")} style={styles.profileImage} />
                  <Text style={styles.profileName}>Warung Makan Sedap</Text>
                  <Text style={styles.profileBio}>Restaurant • Since 2018</Text>
                </View>
                <View style={styles.profileStats}>
                  <View style={styles.profileStat}>
                    <Text style={styles.profileStatValue}>4.8</Text>
                    <Text style={styles.profileStatLabel}>Rating</Text>
                  </View>
                  <View style={styles.profileStat}>
                    <Text style={styles.profileStatValue}>12,480</Text>
                    <Text style={styles.profileStatLabel}>Orders</Text>
                  </View>
                  <View style={styles.profileStat}>
                    <Text style={styles.profileStatValue}>5 yrs</Text>
                    <Text style={styles.profileStatLabel}>On Grab</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate("Profile")}>
                  <Text style={styles.cardButtonText}>View Profile</Text>
                  <Ionicons name="arrow-forward" size={16} color="#2FAE60" />
                </TouchableOpacity>
              </View>
              <Text style={styles.mascotTimestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          </View>
        )

      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Animated.View
            style={[
              styles.mascotHeaderContainer,
              {
                transform: [
                  {
                    scale: mascotAnimation,
                  },
                ],
              },
            ]}
          >
            <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotHeaderImage} />
          </Animated.View>
          <Text style={styles.headerTitle}>Grablet</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true })
          }
        }}
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingAvatarContainer}>
            <Image source={require("../assets/mascot-avatar.png")} style={styles.typingAvatar} />
          </View>
          <View style={styles.typingBubble}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      )}
      
      <View style={styles.quickQuestionContainer}>
        <FlatList
          data={quickReplies}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.quickReplyButton} onPress={() => handleQuickReply(item)}>
              <Text style={styles.quickReplyText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={15}
        style={[styles.inputContainer, { marginBottom: 20 }]}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask Grablet anything..."
          placeholderTextColor="#999"
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, message.trim() === "" ? styles.sendButtonDisabled : null]}
          onPress={handleSend}
          disabled={message.trim() === ""}
        >
          <Ionicons name="send" size={20} color={message.trim() === "" ? "#ccc" : "white"} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mascotHeaderContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f9f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  mascotHeaderImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  menuButton: {
    padding: 8,
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "100%",
  },
  mascotAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f9f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    alignSelf: "flex-start",
  },
  mascotAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageContent: {
    borderRadius: 16,
    padding: 12,
    maxWidth: "80%",
  },
  mascotContent: {
    backgroundColor: "#f0f9f4",
    borderTopLeftRadius: 4,
  },
  userContent: {
    backgroundColor: "#2FAE60",
    borderTopRightRadius: 4,
    marginLeft: "auto",
  },
  mascotText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  userText: {
    fontSize: 16,
    color: "white",
    lineHeight: 22,
  },
  mascotTimestamp: {
    fontSize: 10,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  userTimestamp: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  mascotMessage: {
    justifyContent: "flex-start",
  },
  cardContent: {
    padding: 0,
    backgroundColor: "transparent",
  },
  salesCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: screenWidth * 0.7,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  salesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  salesItem: {
    alignItems: "center",
  },
  salesValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2FAE60",
    marginBottom: 4,
  },
  salesLabel: {
    fontSize: 12,
    color: "#666",
  },
  cardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
  },
  cardButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2FAE60",
    marginRight: 4,
  },
  inventoryCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: screenWidth * 0.7,
  },
  inventoryList: {
    marginBottom: 16,
  },
  inventoryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  inventoryStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  inventoryName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  inventoryCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#d32f2f",
  },
  insightCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: screenWidth * 0.7,
  },
  chartImage: {
    width: "100%",
    height: 120,
    marginBottom: 12,
    borderRadius: 8,
  },
  insightHighlight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9f4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  insightText: {
    fontSize: 12,
    color: "#2FAE60",
    marginLeft: 4,
    fontWeight: "500",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: screenWidth * 0.7,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 12,
    color: "#666",
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
    marginBottom: 12,
  },
  profileStat: {
    alignItems: "center",
  },
  profileStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2FAE60",
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: "#666",
  },
  quickActionsContainer: {
    marginVertical: 8,
    marginLeft: 44,
  },
  quickActionButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    width: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  quickRepliesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 44,
    marginBottom: 8,
  },
  quickReplyButton: {
    backgroundColor: "#f0f9f4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quickReplyText: {
    color: "#2FAE60",
    fontSize: 14,
  },
  typingIndicator: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  typingAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f9f4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  typingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  typingBubble: {
    flexDirection: "row",
    backgroundColor: "#f0f9f4",
    borderRadius: 16,
    padding: 12,
    width: 70,
    justifyContent: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2FAE60",
    marginHorizontal: 2,
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2FAE60",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  quickQuestionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "white",
  },
})
