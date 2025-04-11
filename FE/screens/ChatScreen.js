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
} from "react-native"
import { Animated } from "react-native"
import { Audio } from "expo-av"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, Feather } from "@expo/vector-icons"
import { OPENAI_API_KEY, ELEVENLABS_API_KEY } from "@env"
import * as FileSystem from "expo-file-system"

export default function ChatScreen({ navigation }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm your GrabMerchant assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
      feedback: null,
    },
  ])

  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState(null)
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false)

  // TTS related states
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [soundObject, setSoundObject] = useState(null)

  const flatListRef = useRef(null)
  // Refs to hold animation values per message
  const animationRefs = useRef({})

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

  // Initialize audio for playback on component mount
  useEffect(() => {
    // Set up audio mode for playback
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false, // Use speaker instead of earpiece
        })
        console.log("Audio mode set up for playback")
      } catch (error) {
        console.error("Failed to set audio mode:", error)
      }
    }

    setupAudio()

    return () => {
      // Clean up any playing audio when component unmounts
      if (soundObject) {
        soundObject.unloadAsync()
      }
    }
  }, [])

  const requestAudioPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync()
    if (status !== "granted") {
      alert("Microphone permission is required!")
      return false
    }
    return true
  }

  const startRecording = async () => {
    const permission = await requestAudioPermission()
    if (!permission) return

    try {
      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
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
    const fileExtension = Platform.OS === "ios" ? "m4a" : "wav"
    const mimeType = Platform.OS === "ios" ? "audio/m4a" : "audio/wav"

    formData.append("file", {
      uri,
      name: `audio.${fileExtension}`,
      type: mimeType,
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

  // Convert text to speech using OpenAI TTS API
  const textToSpeech = async (text, messageId) => {
    // Stop any currently playing audio
    if (soundObject) {
      console.log("Unloading previous audio")
      await soundObject.unloadAsync()
    }
  
    setCurrentlyPlayingId(messageId)
    setIsSpeaking(true)
  
    try {
      console.log("Starting TTS process for text:", text.substring(0, 30) + "...")
  
      // Detect language to choose voice and API
      const isMalay = /(terima kasih|apa khabar|bagus|tolong|saya|ini|anda|tinggi|jualan)/i.test(text)
      const isChinese = /(谢谢|你好|帮助|销售|问题|我|客户|收入|商品)/i.test(text)
  
      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })
  
      let audioBlob;
      
      // Use ElevenLabs for Malay
      if (isMalay) {
        console.log("Using ElevenLabs API for Malay text")
        
        // Replace with your preferred voice ID from ElevenLabs
        const voiceId = "Xb7hH8MSUJpSbSDYk0k2"; 
        
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVENLABS_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.1,
              style: 0.3
            }
          }),
        });
        
        console.log("ElevenLabs API response status:", response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error("ElevenLabs API error:", errorData)
          throw new Error(errorData.detail?.message || "ElevenLabs API request failed")
        }
        
        audioBlob = await response.blob()
        
      } else {
        // Use original OpenAI TTS for non-Malay languages
        // Select voice based on detected language
        let voice = "nova" // Default English voice
        
        if (isChinese) {
          voice = "alloy" // Use a different voice for Chinese
        }
        
        console.log("Using OpenAI voice:", voice)
        
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1",
            input: text,
            voice: voice,
          }),
        })
        
        console.log("TTS API response status:", response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error("TTS API error:", errorData)
          throw new Error(errorData.error?.message || "TTS API request failed")
        }
        
        audioBlob = await response.blob()
      }
      
      console.log("Received audio blob, size:", audioBlob.size)
  
      // Process the audio blob (same for both APIs)
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
  
      reader.onloadend = async () => {
        const base64data = reader.result
        console.log("Converted blob to base64, length:", base64data.length)
  
        // Remove the data URL prefix to get just the base64 string
        const base64Audio = base64data.split(",")[1]
  
        // Create a temporary file URI for the audio
        const fileUri = `${FileSystem.cacheDirectory}temp_audio_${messageId}.mp3`
        console.log("Writing audio to file:", fileUri)
  
        // Write the base64 data to the file
        await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
          encoding: FileSystem.EncodingType.Base64,
        })
  
        console.log("Audio file written, preparing to play...")
  
        // Play the audio with proper volume
        console.log("Creating sound object...")
        const { sound } = await Audio.Sound.createAsync(
          { uri: fileUri },
          { shouldPlay: true, volume: 1.0 },
        )
  
        console.log("Sound created and playing...")
        setSoundObject(sound)
  
        // Handle audio completion
        sound.setOnPlaybackStatusUpdate((status) => {
          console.log(
            "Playback status:",
            status.isPlaying ? "playing" : "stopped",
            "position:",
            status.positionMillis,
            "duration:",
            status.durationMillis,
          )
  
          if (status.didJustFinish) {
            console.log("Audio playback finished")
            setIsSpeaking(false)
            setCurrentlyPlayingId(null)
          }
        })
      }
    } catch (error) {
      if (error.message.includes("ElevenLabs")) {
        // ElevenLabs specific error handling
        console.error("ElevenLabs API error:", error);
        // Fallback to OpenAI TTS if ElevenLabs fails
        try {
          alert("Falling back to default TTS service");
          // Call OpenAI TTS as fallback
          // ... fallback code here
        } catch (fallbackError) {
          console.error("Fallback TTS also failed:", fallbackError);
          alert("All TTS services failed. Please try again later.");
        }
      } else {
        // Handle other errors
        alert("Failed to play speech: " + error.message);
      }
    }
  }

  // Function to stop speech playback
  const stopSpeech = async () => {
    if (soundObject) {
      await soundObject.stopAsync()
      await soundObject.unloadAsync()
      setSoundObject(null)
    }
    setIsSpeaking(false)
    setCurrentlyPlayingId(null)
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

    // Detect language (simple keyword matching)
    const isMalay = /(terima kasih|apa khabar|bagus|tolong|saya|jualan|item|pelanggan|inventori|pendapatan)/i.test(message);
    const isChinese = /(谢谢|你好|帮助|销售|问题|我|客户|收入|商品)/i.test(message);
  
    // Simulate AI response after a short delay
    setTimeout(() => {
      let responseText = ""

      // English responses (default)
      if (!isMalay && !isChinese) {
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
      }
      // Malay responses
      else if (isMalay) {
        if (message.toLowerCase().includes("jualan") || message.toLowerCase().includes("pendapatan")) {
          responseText =
            "Jualan anda minggu ini adalah 15% lebih tinggi daripada minggu lepas. Adakah anda ingin melihat analisis terperinci?"
        } else if (message.toLowerCase().includes("item") || message.toLowerCase().includes("produk")) {
          responseText =
            "Berdasarkan data anda, item yang paling laris adalah Nasi Lemak, Ayam Goreng, dan Mee Goreng. Item ini menyumbang 60% daripada jumlah jualan anda."
        } else if (message.toLowerCase().includes("pelanggan") || message.toLowerCase().includes("kekal")) {
          responseText =
            "Untuk meningkatkan pengekalan pelanggan, cuba laksanakan program kesetiaan, balas ulasan dengan pantas, dan tawarkan diskaun sekali-sekala kepada pelanggan tetap."
        } else if (message.toLowerCase().includes("inventori") || message.toLowerCase().includes("stok")) {
          responseText =
            "Anda kini mempunyai 3 item yang hampir habis stok: ayam, beras, dan minyak masak. Adakah anda ingin membuat pesanan dengan pembekal anda?"
        } else {
          responseText =
            "Saya boleh membantu anda dengan analisis jualan, pengurusan inventori, dan petua untuk memaksimumkan pertumbuhan perniagaan anda. Apa yang anda ingin tahu?"
        }
      }
      // Chinese responses
      else if (isChinese) {
        if (message.includes("销售") || message.includes("收入")) {
          responseText = "您本周的销售额比上周高出15%。您想查看详细分析吗？"
        } else if (message.includes("产品") || message.includes("商品")) {
          responseText = "根据您的数据，最畅销的商品是椰浆饭、炸鸡和炒面。这些商品占您总销售额的60%。"
        } else if (message.includes("客户") || message.includes("保留") || message.includes("保留")) {
          responseText = "为了提高客户保留率，可以尝试实施忠诚度计划、及时回复评论，并不时为回头客提供折扣。"
        } else if (message.includes("库存") || message.includes("存货")) {
          responseText = "您目前有3种商品的库存较低：鸡肉、大米和食用油。您想向供应商下订单吗？"
        } else {
          responseText = "我可以帮助您了解销售情况、库存管理以及促进业务增长的技巧。您想了解什么？"
        }
      }

      const newMessageId = (Date.now() + 1).toString()
      const aiMessage = {
        id: newMessageId,
        text: responseText,
        sender: "ai",
        timestamp: new Date(),
        feedback: null,
      }

      setMessages((prevMessages) => [...prevMessages, aiMessage])

      // Auto-play the AI response if hands-free mode is detected
      // (This could be based on a setting or if the user used voice input)
      if (isRecording || isListening) {
        // Wait a bit for the UI to update before playing
        setTimeout(() => {
          textToSpeech(responseText, newMessageId)
        }, 500)
      }
    }, 1000)
  }

  const handleQuickReply = (reply) => {
    setMessage(reply)
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  const animateFeedback = (anim) => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const handleFeedback = (messageId, type) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.id === messageId && msg.sender === "ai" ? { ...msg, feedback: type } : msg)),
    )
  }

  const renderMessage = ({ item }) => {
    const isAI = item.sender === "ai"
    const isPlaying = currentlyPlayingId === item.id

    // Create anim refs for this message if not exist
    if (!animationRefs.current[item.id]) {
      animationRefs.current[item.id] = {
        like: new Animated.Value(1),
        dislike: new Animated.Value(1),
      }
    }

    const { like, dislike } = animationRefs.current[item.id]

    return (
      <View>
        <View style={[styles.messageBubble, isAI ? styles.aiMessage : styles.userMessage]}>
          {/* Use userMessageText for user messages */}
          <Text style={isAI ? styles.messageText : styles.userMessageText}>{item.text}</Text>

          {/* Speaker button for AI messages */}
          {isAI && (
            <TouchableOpacity
              style={styles.speakerButton}
              onPress={() => (isPlaying ? stopSpeech() : textToSpeech(item.text, item.id))}
            >
              <Ionicons
                name={isPlaying ? "volume-high" : "volume-medium-outline"}
                size={18}
                color={isPlaying ? "#2FAE60" : "#666"}
              />
              {isPlaying && (
                <View style={styles.speakingIndicator}>
                  <ActivityIndicator size="small" color="#2FAE60" />
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Use userTimestamp for user messages */}
          <Text style={isAI ? styles.timestamp : styles.userTimestamp}>
            {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        {isAI && (
          <View style={styles.feedbackContainer}>
            <TouchableOpacity
              onPress={() => {
                animateFeedback(like)
                handleFeedback(item.id, "like")
              }}
              style={[styles.feedbackButton, item.feedback === "like" && styles.feedbackButtonActive]}
            >
              <Animated.View style={{ transform: [{ scale: like }] }}>
                <Feather name="thumbs-up" size={16} color={item.feedback === "like" ? "#2FAE60" : "#999"} />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                animateFeedback(dislike)
                handleFeedback(item.id, "dislike")
              }}
              style={[styles.feedbackButton, item.feedback === "dislike" && styles.feedbackButtonActive]}
            >
              <Animated.View style={{ transform: [{ scale: dislike }] }}>
                <Feather name="thumbs-down" size={16} color={item.feedback === "dislike" ? "#D9534F" : "#999"} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}
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
        onContentSizeChange={() => {
          // Add a slightly longer delay to ensure feedback buttons are rendered
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true })
            }
          }, 300)
        }}
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
          <Ionicons name={isRecording ? "mic" : "mic-outline"} size={20} color={isRecording ? "#FF3B30" : "#666"} />
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
    position: "relative", // For positioning the speaker button
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
    paddingRight: 26, // Make space for the speaker button
  },
  timestamp: {
    fontSize: 10,
    color: "#999",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  userMessageText: {
    fontSize: 16,
    color: "white", // White text for user messages
    lineHeight: 22,
  },
  userTimestamp: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)", // Semi-transparent white
    alignSelf: "flex-end",
    marginTop: 4,
  },
  speakerButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  speakingIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2FAE60",
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
  feedbackContainer: {
    flexDirection: "row",
    marginTop: -12,
  },
  feedbackButton: {
    padding: 6,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f7f7f7",
  },
  feedbackButtonActive: {
    backgroundColor: "#f5fff5",
  },
})
