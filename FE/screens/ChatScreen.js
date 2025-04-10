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
  ActivityIndicator,
  PermissionsAndroid,
} from "react-native"
import { Audio } from "expo-av"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import {OPENAI_API_KEY} from "@env"

export default function ChatScreen({ navigation }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm your GrabMerchant assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])

  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState(null)
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false)

  const flatListRef = useRef(null)

  const quickReplies = [
    "Show my sales insights",
    "Best selling items?",
    "How can I increase my revenue?",
    "Tips for customer retention",
  ]

    const requestAudioPermission = async () => {
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        alert('Microphone permission is required!')
        return false
      }
      return true
    }

  const startRecording = async () => {
    const permission = await requestAudioPermission()
    if (!permission) return

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      setRecording(recording)
      setIsRecording(true)
    } catch (err) {
      console.error("Failed to start recording", err)
    }
  }

  const stopRecording = async () => {
    try {
      if (!recording) return
      await recording.stopAndUnloadAsync()
      setIsRecording(false)

      const uri = recording.getURI()
      console.log("Recording URI:", uri)
      setRecording(null)
      if (uri) {
        await transcribeWithWhisper(uri)
      }
    } catch (err) {
      console.error("Failed to stop recording", err)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const transcribeWithWhisper = async (uri) => {
    setIsLoadingTranscription(true)
  
    console.log("Sending file to Whisper:", uri)
  
    const formData = new FormData()
    formData.append("file", {
      uri,
      name: "audio.wav",
      type: "audio/wav",
    })
    formData.append("model", "whisper-1")
  
    try {
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      })
  
      const data = await response.json()
      console.log("Whisper response:", data)
  
      if (data.text) {
        setMessage(data.text)
      } else if (data.error) {
        alert("Transcription error: " + data.error.message)
      }
    } catch (err) {
      console.error("Whisper API error:", err)
      alert("Something went wrong with the transcription.")
    } finally {
      setIsLoadingTranscription(false)
    }
  }

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

      if (message.toLowerCase().includes("sale") || message.toLowerCase().includes("revenue")) {
        responseText =
          "Your sales this week are 15% higher than last week. Would you like to see your detailed insights?"
      } else if (message.toLowerCase().includes("item") || message.toLowerCase().includes("product")) {
        responseText =
          "Based on your data, your best selling items are Nasi Lemak, Ayam Goreng, and Mee Goreng. These items account for 60% of your total sales."
      } else if (message.toLowerCase().includes("customer") || message.toLowerCase().includes("retention")) {
        responseText =
          "To improve customer retention, try implementing a loyalty program, responding to reviews promptly, and offering occasional discounts to returning customers."
      } else if (message.toLowerCase().includes("inventory") || message.toLowerCase().includes("stock")) {
        responseText =
          "You currently have 3 items that are running low on stock: chicken, rice, and cooking oil. Would you like to place an order with your suppliers?"
      } else {
        responseText =
          "I can help you with sales insights, inventory management, and tips to maximize your business growth. What would you like to know?"
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
        <Text style={styles.headerTitle}>Chat with Business Assistant</Text>
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

        <TouchableOpacity style={styles.micButton} onPress={toggleRecording}>
          <Ionicons name={isListening ? "mic" : "mic-outline"} size={20} color={isListening ? "#FF3B30" : "#666"} />
          {isLoadingTranscription && (
            <View style={styles.listeningIndicator}>
              <ActivityIndicator size="small" color="#FF3B30" />
            </View>
          )}
        </TouchableOpacity>

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
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  listeningIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "transparent",
  },
})
