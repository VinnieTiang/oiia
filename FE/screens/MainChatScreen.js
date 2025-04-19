"use client"
import { fetchLowStockItems, askAI, fetchSalesData, useAdviceQueryData,fetchMerchantName } from "../api"
import { useState, useRef, useEffect } from "react"
import {View,Text,StyleSheet,TextInput,TouchableOpacity,FlatList,KeyboardAvoidingView,Platform,Image,Animated,Dimensions,ScrollView,ActivityIndicator,} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, Feather } from "@expo/vector-icons"
import * as FileSystem from "expo-file-system"
import { Audio } from "expo-av"
import { OPENAI_API_KEY, ELEVENLABS_API_KEY } from "@env"

// Get screen dimensions
const { width: screenWidth } = Dimensions.get("window")

// Define message types for different content
const MESSAGE_TYPES = {
  AITEXT: "ai_text",
  TEXT: "text",
  ADVICE: "advice",
  SALES_SUMMARY: "sales_summary",
  INVENTORY_ALERT: "inventory_alert",
  INVENTORY_ALERT2: "inventory_alert2",
  INSIGHT_CHART: "insight_chart",
  QUICK_ACTIONS: "quick_actions",
  PROFILE_CARD: "profile_card",
}

export default function MainChatScreen({ navigation }) {
  ///////////// For testing backend API fetching /////////////
  const [lowStockItems, setLowStockItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const { data } = useAdviceQueryData(); // triggers fetch
  const [merchantName, setMerchantName] = useState("Loading...")
    [isLoading, setIsLoading] = useState(true)
  
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
  const { data: adviceItems = [], isFetching } = useAdviceQueryData(); // triggers fetch

  const checkInventory = async () => {
    try {
      setIsLoading(true)
      setIsTyping(true)

      // Add user message
      const userMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: MESSAGE_TYPES.TEXT,
        text: "Check inventory",
        sender: "user",
        timestamp: new Date(),
      }
      setMessages((prevMessages) => [...prevMessages, userMessage])

      // Fetch data from API
      const items = await fetchLowStockItems()
      setLowStockItems(items)
      addMascotMessage("I checked your inventory and found these low stock items:", MESSAGE_TYPES.TEXT)

      // Add inventory alert message
      const inventoryMessage = {
        id: `mascot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: MESSAGE_TYPES.INVENTORY_ALERT2,
        sender: "mascot",
        timestamp: new Date(),
        items: items,
      }
      setMessages((prevMessages) => [...prevMessages, inventoryMessage])
    } catch (error) {
      addMascotMessage("Sorry, I couldn't fetch your inventory data. Please try again later.", MESSAGE_TYPES.TEXT)
    } finally {
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  ///////////// Welcome Message /////////////
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
  const animationRefs = useRef({})
  const inputRef = useRef(null)

  //////// MICCCCC /////////
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState(null)
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false)
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [soundObject, setSoundObject] = useState(null)

  ///////////// Animate mascot on load (show "...") & MIC /////////////
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

  // Add these new state variables for typing dots animation
  const [dot1Opacity] = useState(new Animated.Value(0.3))
  const [dot2Opacity] = useState(new Animated.Value(0.3))
  const [dot3Opacity] = useState(new Animated.Value(0.3))

  // Add this new function to animate the typing dots
  const animateTypingDots = () => {
    Animated.loop(
      Animated.sequence([
        // First dot animation
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Second dot animation
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Third dot animation
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Reset all dots
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start()
  }

  // Add this effect to start/stop the typing dots animation
  useEffect(() => {
    if (isTyping) {
      animateTypingDots()
    } else {
      // Reset animations when not typing
      dot1Opacity.setValue(0.3)
      dot2Opacity.setValue(0.3)
      dot3Opacity.setValue(0.3)
    }
  }, [isTyping])

  useEffect(() => {
    //Animate "..."
    animateMascot()

    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        })
        console.log("Audio mode set up for playback")
      } catch (error) {
        console.error("Failed to set audio mode:", error)
      }
    }

    setupAudio()

    return () => {
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

  //////////// Convert text to speech using OpenAI TTS API /////////////
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

      let audioBlob

      // Use ElevenLabs for Malay
      if (isMalay) {
        console.log("Using ElevenLabs API for Malay text")

        // Replace with your preferred voice ID from ElevenLabs
        const voiceId = "Xb7hH8MSUJpSbSDYk0k2"

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
              style: 0.3,
            },
          }),
        })

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
        const { sound } = await Audio.Sound.createAsync({ uri: fileUri }, { shouldPlay: true, volume: 1.0 })

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
        console.error("ElevenLabs API error:", error)
        // Fallback to OpenAI TTS if ElevenLabs fails
        try {
          alert("Falling back to default TTS service")
          // Call OpenAI TTS as fallback
          // ... fallback code here
        } catch (fallbackError) {
          console.error("Fallback TTS also failed:", fallbackError)
          alert("All TTS services failed. Please try again later.")
        }
      } else {
        // Handle other errors
        alert("Failed to play speech: " + error.message)
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

  //////////////// Feedback for AI did by YY ////////////////////////////
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
      prevMessages.map((msg) => (msg.id === messageId && msg.sender === "mascot" ? { ...msg, feedback: type } : msg)),
    )
  }

  ///////////// Handle User Send Message Function /////////////
  const handleSend = async () => {
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
    const userQuery = message
    setMessage("")

    if (userQuery.trim().toLowerCase() === "start over") {
      addMascotMessage(
        "I'm here to boost your business! Ask me about sales trends, inventory status, or business advice.",
        MESSAGE_TYPES.TEXT,
      )
      addMascotMessage(null, MESSAGE_TYPES.QUICK_ACTIONS)
      return
    }

    // Show typing indicator
    setIsTyping(true)
    setIsAILoading(true)

    try {
      // Call the AI API
      const aiResponse = await askAI(userQuery)

      // Animate mascot when responding
      //animateMascot()

      // Add the AI response
      addMascotMessage(aiResponse, MESSAGE_TYPES.AITEXT)

      // Process the message to add relevant UI components
      processUserMessage(userQuery)
    } catch (error) {
      console.error("Error getting AI response:", error)
      addMascotMessage(
        "I'm having trouble connecting to my brain right now. Please try again later.",
        MESSAGE_TYPES.TEXT,
      )
    } finally {
      setIsTyping(false)
      setIsAILoading(false)
    }
  }

  ///////////// Hard Code some Reply (If user input include certain words) /////////////
  const processUserMessage = (userMessage) => {
    //animateMascot()
    const lowerCaseMessage = userMessage.toLowerCase()

    // Detect language (simple keyword matching)
    const isMalay = /(terima kasih|apa khabar|bagus|tolong|saya|jualan|item|pelanggan|inventori|pendapatan)/i.test(
      message,
    )
    const isChinese = /(谢谢|你好|帮助|销售|问题|我|客户|收入|商品)/i.test(message)

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
        sender: "mascot",
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

    /////////////// Handle different types of queries (New added one) //////////////////////////
    if (
      lowerCaseMessage.includes("sales") ||
      lowerCaseMessage.includes("revenue") ||
      lowerCaseMessage.includes("earning") ||
      lowerCaseMessage.includes("income")
    ) {
      // Sales related query
      setTimeout(() => {
        addMascotMessage(null, MESSAGE_TYPES.SALES_SUMMARY)
      }, 500)
    } else if (
      lowerCaseMessage.includes("inventory") ||
      lowerCaseMessage.includes("stock") ||
      lowerCaseMessage.includes("item") ||
      lowerCaseMessage.includes("product")
    ) {
      // Inventory related query
      setTimeout(() => {
        addMascotMessage(null, MESSAGE_TYPES.INVENTORY_ALERT)

        // Add option to go to inventory screen
        setTimeout(() => {
          addMascotMessage("Would you like to see your full inventory?", MESSAGE_TYPES.TEXT)
          addQuickReplies([
            { text: "View Inventory", action: "inventory" },
            { text: "Not now", action: "dismiss" },
          ])
        }, 500)
      }, 500)
    } else if (
      lowerCaseMessage.includes("insight") ||
      lowerCaseMessage.includes("chart") ||
      lowerCaseMessage.includes("data") ||
      lowerCaseMessage.includes("analytics") ||
      lowerCaseMessage.includes("performance")
    ) {
      // Insights related query
      setTimeout(() => {
        addMascotMessage(null, MESSAGE_TYPES.INSIGHT_CHART)

        // Add option to go to insights screen
        setTimeout(() => {
          addMascotMessage("Would you like to see more detailed insights?", MESSAGE_TYPES.TEXT)
          addQuickReplies([
            { text: "View Insights", action: "insight" },
            { text: "Not now", action: "dismiss" },
          ])
        }, 500)
      }, 500)
    } else if (
      lowerCaseMessage.includes("profile") ||
      lowerCaseMessage.includes("account") ||
      lowerCaseMessage.includes("setting") ||
      lowerCaseMessage.includes("my info")
    ) {
      // Profile related query
      setTimeout(() => {
        addMascotMessage(null, MESSAGE_TYPES.PROFILE_CARD)
      }, 500)
    } else if (
      lowerCaseMessage.includes("help") ||
      lowerCaseMessage.includes("what can you do") ||
      lowerCaseMessage.includes("feature") ||
      lowerCaseMessage.includes("function")
    ) {
      // Help query
      addMascotMessage("I can help you with many things! Here are some options:", MESSAGE_TYPES.TEXT)
      addMascotMessage(null, MESSAGE_TYPES.QUICK_ACTIONS)
    } else if (
      lowerCaseMessage.includes("leaderboard") ||
      lowerCaseMessage.includes("ranking") ||
      lowerCaseMessage.includes("compare") ||
      lowerCaseMessage.includes("competitor") ||
      lowerCaseMessage.includes("competition")
    ) {
      // Leaderboard related query
      setTimeout(() => {
        addMascotMessage("Would you like to see how you compare with other merchants?", MESSAGE_TYPES.TEXT)
        addQuickReplies([
          { text: "View Leaderboard", action: "leaderboard" },
          { text: "Not now", action: "dismiss" },
        ])
      }, 500)
    } else if (
      lowerCaseMessage.includes("promo") ||
      lowerCaseMessage.includes("discount") ||
      lowerCaseMessage.includes("offer") ||
      lowerCaseMessage.includes("deal") ||
      lowerCaseMessage.includes("bundle")
    ) {
      // Promotion related query
      setTimeout(() => {
        addMascotMessage("Would you like to create a new promotion or view your existing ones?", MESSAGE_TYPES.TEXT)
        addQuickReplies([
          { text: "Create New Promotion", action: "promo" },
          { text: "Not now", action: "dismiss" },
        ])
      }, 500)
    }
    // else {
    //   // General response
    //   const generalResponses = [
    //     "I can help you manage your business. Try asking about your sales, inventory, or insights!",
    //     "Would you like to see your business performance or check your inventory?",
    //     "I'm here to boost your business! Ask me about sales trends, inventory status, or business advice.",
    //     "How can I assist you with your business today? I can show sales data, inventory status, or provide recommendations.",
    //   ]

    //   const randomResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)]
    //   addMascotMessage(randomResponse, MESSAGE_TYPES.TEXT)

    //   // After a short delay, show quick actions (This mcm not working ._.)
    //   setTimeout(() => {
    //     addMascotMessage(null, MESSAGE_TYPES.QUICK_ACTIONS)
    //   }, 10)
    // }
  }

  ///////////// Function to show Mascot chat /////////////
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

  ///////////// Function to show the QuickReplies (the squares) /////////////
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

  ///////////// Function when user press the QuickAction (show under mascot chat) /////////////
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

  ///////////// Those quickSuggestion above text input /////////////
  const quickSuggestion = [
    "Start Over",
    "Show my sales insights",
    "Best selling items?",
    "How can I increase my revenue?",
    "Tips for customer retention",
    "Create a promotion",
    "View my promotions",
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

  const handleQuickReplyForQuickSuggestion = (reply) => {
    setMessage(reply)
    setTimeout(() => {
      handleSend()
    }, 10)
  }

  ///////////// Function when user press the QuickActions (the squares) /////////////
  const handleAction = (action) => {
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
          navigation.navigate("Insight", { scrollToBottom: true })
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
        case "leaderboard":
          navigation.navigate("Leaderboard")
          break
        // Add new cases for promotions
        case "promo":
          navigation.navigate("PromoBuilder")
          break
        case "promoMonitor":
          navigation.navigate("PromoMonitor")
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
          if (adviceItems.length > 0) {
            addMascotMessage(null, MESSAGE_TYPES.ADVICE)
          } else {
            addMascotMessage(
                "💡 Consider adding more spicy options to your menu. 85% of customers in your area prefer spicy food, and restaurants with spicy options see 18% higher repeat orders in your region.",
                MESSAGE_TYPES.TEXT,
            )
            setTimeout(() => {
            addMascotMessage("Would you like to see more business advice?", MESSAGE_TYPES.TEXT)
            addQuickReplies([
                { text: "View Advice", action: "advice" },
                { text: "Not now", action: "dismiss" },
            ])
            }, 500)
          }
          break
        case "view leaderboard":
          addMascotMessage("Here's how you compare with other merchants:", MESSAGE_TYPES.TEXT)
          setTimeout(() => {
            navigation.navigate("Leaderboard")
          }, 500)
          break
        // Add new case for promotions
        case "manage promotions":
          addMascotMessage("Let's manage your promotions! What would you like to do?", MESSAGE_TYPES.TEXT)
          setTimeout(() => {
            addQuickReplies([
              { text: "Create New Promotion", action: "promo" },
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

  //////////////// Fetch Sales Data from DB //////////////////
  const [chatTodaySales, setChatTodaySales] = useState(null);
  const [chatWeeklySales, setChatWeeklySales] = useState(null);
  const [chatSalesLoading, setChatSalesLoading] = useState(true);
  useEffect(() => {
    const fetchSalesForChat = async () => {
      try {
        setChatSalesLoading(true);
        const todayData = await fetchSalesData('today');
        const weekData = await fetchSalesData('week');
        
        setChatTodaySales(todayData);
        setChatWeeklySales(weekData);
      } catch (error) {
        console.error("Error fetching sales for chat:", error);
      } finally {
        setChatSalesLoading(false);
      }
    };
    
    fetchSalesForChat();
  }, []);


  ///////////// Main Funtion for Mascot to render message out /////////////
  const renderMessage = ({ item }) => {
    const isMascot = item.sender === "mascot"

    switch (item.type) {
      case MESSAGE_TYPES.TEXT:
      case MESSAGE_TYPES.AITEXT:
        const isPlaying = currentlyPlayingId === item.id
        const showFeedback = item.type === MESSAGE_TYPES.AITEXT

        if (!animationRefs.current[item.id]) {
          animationRefs.current[item.id] = {
            like: new Animated.Value(1),
            dislike: new Animated.Value(1),
          }
        }

        const { like, dislike } = animationRefs.current[item.id]

        return (
          <View>
            <View style={[styles.messageBubble, isMascot ? styles.mascotMessage : styles.userMessage]}>
              {isMascot && (
                <View style={styles.mascotAvatarContainer}>
                  <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotAvatar} />
                </View>
              )}
              <View style={[styles.messageContent, isMascot ? styles.mascotContent : styles.userContent]}>
                <Text style={isMascot ? styles.mascotText : styles.userText}>{item.text}</Text>

                {/* Speaker Button for Mascot */}
                {isMascot && (
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

                <Text style={isMascot ? styles.mascotTimestamp : styles.userTimestamp}>
                  {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>

            {/* Feedback Buttons for AI-generated messages ONLY :DDDD */}
            {isMascot && showFeedback && (
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

      case MESSAGE_TYPES.SALES_SUMMARY:
        return (
          <View style={styles.messageBubble}>
            <View style={styles.mascotAvatarContainer}>
              <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotAvatar} />
            </View>
            <View style={[styles.messageContent, styles.cardContent]}>
              <View style={styles.salesCard}>
                <Text style={styles.cardTitle}>Sales Summary</Text>
                  {chatSalesLoading ? (
                    <ActivityIndicator size="small" color="#2FAE60" style={{marginVertical: 20}} />
                  ) : (
                    <View style={styles.salesRow}>
                      <View style={styles.salesItem}>
                        <Text style={styles.salesValue}>{chatTodaySales?.total_sales_formatted || "N/A"}</Text>
                        <Text style={styles.salesLabel}>Today</Text>
                      </View>
                      <View style={styles.salesItem}>
                        <Text style={styles.salesValue}>{chatWeeklySales?.total_sales_formatted || "N/A"}</Text>
                        <Text style={styles.salesLabel}>This Week</Text>
                      </View>
                      <View style={styles.salesItem}>
                      <Text style={styles.salesValue}>
                        {chatWeeklySales?.vs_last_period_formatted || "+N/A%"}
                      </Text>
                        <Text style={styles.salesLabel}>vs Last Week</Text>
                      </View>
                    </View>
                  )}
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

      case MESSAGE_TYPES.ADVICE:
        return (
            <View style={styles.messageBubble}>
                <View style={styles.mascotAvatarContainer}>
                    <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotAvatar} />
                </View>
                <View style={[styles.messageContent, styles.cardContent]}>
                    <View style={styles.salesCard}>
                    <Text style={styles.cardTitle}>{adviceItems[0].title} 💡</Text>
                        {isFetching ? (
                        <ActivityIndicator size="small" color="#2FAE60" style={{marginVertical: 20}} />
                        ) : (
                        <View>
                            <Text style={styles.adviceImpact}>{adviceItems[0].impact}</Text>
                            <Text style={styles.adviceDetail}>{adviceItems[0].details}</Text>
                        </View>
                        )}
                    <TouchableOpacity style={styles.cardButton} onPress={() => navigation.navigate("Advice")}>
                        <Text style={styles.cardButtonText}>View More Advice</Text>
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
                    <Text style={styles.inventoryName}>Black Beans</Text>
                    <Text style={styles.inventoryCount}>10 left</Text>
                  </View>
                  <View style={styles.inventoryItem}>
                    <View style={[styles.inventoryStatus, { backgroundColor: "#ffebee" }]} />
                    <Text style={styles.inventoryName}>Chicken</Text>
                    <Text style={styles.inventoryCount}>9 left</Text>
                  </View>
                  <View style={styles.inventoryItem}>
                    <View style={[styles.inventoryStatus, { backgroundColor: "#fff8e1" }]} />
                    <Text style={styles.inventoryName}>Chili Powder</Text>
                    <Text style={styles.inventoryCount}>3 left</Text>
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

      case MESSAGE_TYPES.INVENTORY_ALERT2:
        // Use the items from the message or fall back to the state
        const itemsToDisplay = item.items || lowStockItems

        return (
          <View style={styles.messageBubble}>
            <View style={styles.mascotAvatarContainer}>
              <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotAvatar} />
            </View>
            <View style={[styles.messageContent, styles.cardContent]}>
              <View style={styles.inventoryCard}>
                <Text style={styles.cardTitle}>Low Stock Alert</Text>
                <View style={styles.inventoryList}>
                  {itemsToDisplay.length > 0 ? (
                    itemsToDisplay.map((stockItem) => (
                      <View key={stockItem.id} style={styles.inventoryItem}>
                        <View style={[styles.inventoryStatus, { backgroundColor: "#ffebee" }]} />
                        <Text style={styles.inventoryName}>{stockItem.name}</Text>
                        <Text style={styles.inventoryCount}>{stockItem.current} left</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No low stock items found</Text>
                  )}
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
                <Image source={require("../assets/chart-preview.jpg")} style={styles.chartImage} resizeMode="contain" />
                <View style={styles.insightHighlight}>
                  <Ionicons name="trending-up" size={16} color="#2FAE60" />
                  <Text style={styles.insightText}>Sales are up 12% this week</Text>
                </View>
                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() => navigation.navigate("Insight", { scrollToBottom: true })}
                >
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

              <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction("Check Inventory")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "#F3F0FF" }]}>
                  <Ionicons name="cube-outline" size={20} color="#9B51E0" />
                </View>
                <Text style={styles.quickActionText}>Check Inventory</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction("View Leaderboard")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "#FFF0F5" }]}>
                  <Ionicons name="trophy-outline" size={20} color="#E91E63" />
                </View>
                <Text style={styles.quickActionText}>View Leaderboard</Text>
              </TouchableOpacity>

              {/* Add new button for Promotions */}
              <TouchableOpacity style={styles.quickActionButton} onPress={() => handleQuickAction("Manage Promotions")}>
                <View style={[styles.quickActionIcon, { backgroundColor: "#FFF0E0" }]}>
                  <Ionicons name="pricetag-outline" size={20} color="#FF9800" />
                </View>
                <Text style={styles.quickActionText}>Promotions</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity style={styles.quickActionButton} onPress={checkInventory} disabled={isLoading}>
                <View style={[styles.quickActionIcon, { backgroundColor: "#F3F0FF" }]}>
                  <Ionicons name="cube-outline" size={20} color="#9B51E0" />
                </View>
                <Text style={styles.quickActionText}>
                  {isLoading ? "Loading..." : "Check Inventory Testing BE"}
                </Text>
              </TouchableOpacity> */}
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
                  <Image source={require("../assets/profile-placeholder1.png")} style={styles.profileImage} />
                  <Text style={styles.profileName}>{merchantName}</Text>
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

  ///////////// MAIN CHAT SCREEN /////////////
  return (
    <SafeAreaView style={styles.safeArea}>
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
            <Animated.View
              style={[
                styles.typingDot,
                {
                  opacity: dot1Opacity.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                {
                  opacity: dot2Opacity.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1, 0.5],
                  }),
                  transform: [
                    {
                      scale: mascotAnimation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.8, 1.2, 0.8],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.typingDot,
                {
                  opacity: dot3Opacity.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.7, 1, 0.7],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.quickQuestionContainer}>
        <FlatList
          data={quickSuggestion}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.quickReplyButton} onPress={() => handleQuickReplyForQuickSuggestion(item)}>
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

        <TouchableOpacity style={styles.micButton} onPress={toggleRecording}>
          <Ionicons name={isRecording ? "mic" : "mic-outline"} size={20} color={isRecording ? "#FF3B30" : "#666"} />
          {isLoadingTranscription && (
            <View style={styles.listeningIndicator}>
              <ActivityIndicator size="small" color="#FF3B30" />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            message.trim() === "" ? styles.sendButtonDisabled : null,
            isAILoading ? styles.sendButtonLoading : null,
          ]}
          onPress={handleSend}
          disabled={message.trim() === "" || isAILoading}
        >
          {isAILoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color={message.trim() === "" ? "#ccc" : "white"} />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
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
    marginVertical: 5,
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
    marginTop: 10,
  },
  chartImage: {
    width: "100%",
    height: 170,
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
    marginBottom: 10,
    marginLeft: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 1,
  },
  quickActionButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: "center",
    width: 100,
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
  sendButtonLoading: {
    backgroundColor: "#1D8348", // Darker green when loading
  },
  quickQuestionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "white",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    padding: 10,
  },
  speakerButton: {
    position: "absolute",
    top: 8,
    right: -5,
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
    marginTop: -30,
    marginLeft: 60,
  },
  feedbackButton: {
    padding: 4,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f7f7f7",
  },
  feedbackButtonActive: {
    backgroundColor: "#f5fff5",
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginBottom: 4,
  },
  adviceImpact: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2FAE60",
    marginBottom: 4,
  },
  adviceDetail: {
    fontSize: 16,
    color: "black",
    marginBottom: 4,
  }
})
