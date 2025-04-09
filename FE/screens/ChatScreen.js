"use client"

import { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

export default function ChatScreen({ navigation }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm your GigBoost assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])

  const flatListRef = useRef(null)

  const quickReplies = [
    "Show my earnings insights",
    "Best time to work today?",
    "How can I increase my income?",
    "Tips for better ratings",
  ]

  const handleSend = () => {
    if (message.trim() === "") return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prevMessages) => [...prevMessages, userMessage])
    setMessage("")

    // Simulate AI response after a short delay
    setTimeout(() => {
      let responseText = ""

      if (message.toLowerCase().includes("earning") || message.toLowerCase().includes("income")) {
        responseText =
          "Your earnings this week are 15% higher than last week. Would you like to see your detailed insights?"
      } else if (message.toLowerCase().includes("time") || message.toLowerCase().includes("work")) {
        responseText =
          "Based on historical data, the best times to work today are 7-9 AM and 5-8 PM. These hours typically have higher demand in your area."
      } else if (message.toLowerCase().includes("tip") || message.toLowerCase().includes("rating")) {
        responseText =
          "To improve your ratings, try greeting customers by name, keeping your vehicle clean, and offering a bottle of water on hot days."
      } else {
        responseText =
          "I can help you with earnings insights, work scheduling advice, and tips to maximize your income. What would you like to know?"
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prevMessages) => [...prevMessages, aiMessage])
    }, 1000)
  }

  const handleQuickReply = (reply) => {
    setMessage(reply)
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  const renderMessage = ({ item }) => {
    const isAI = item.sender === "ai"

    return (
      <View style={[styles.messageBubble, isAI ? styles.aiMessage : styles.userMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat with AI Assistant</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />

      <View style={styles.quickRepliesContainer}>
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
        keyboardVerticalOffset={100}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={message.trim() === ""}>
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
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  aiMessage: {
    backgroundColor: "#f0f9f4",
    borderTopLeftRadius: 4,
    alignSelf: "flex-start",
  },
  userMessage: {
    backgroundColor: "#2FAE60",
    borderTopRightRadius: 4,
    alignSelf: "flex-end",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  quickRepliesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "white",
  },
  quickReplyButton: {
    backgroundColor: "#f0f9f4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quickReplyText: {
    color: "#2FAE60",
    fontSize: 14,
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
})
