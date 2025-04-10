import React from "react"
import { TouchableOpacity, StyleSheet, Image } from "react-native"
import { useNavigation } from "@react-navigation/native"

export default function FloatingChatButton() {
  const navigation = useNavigation()

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={() => navigation.navigate("ChatScreen")}
    >
      <Image
        source={require("../assets/chat-icon.png")} // Make sure this exists
        style={styles.icon}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 50,
    zIndex: 1000,
    elevation: 10,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: "#fff",
  },
})
