import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient colors={["#2FAE60", "#1E8449"]} style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>GRABLET</Text>
        <Text style={styles.tagline}>Your Grab Business. Guided by Grablet.</Text>
      </View>

      <View style={styles.mascotContainer}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>Hi! I'm Grablet, your AI business assistant. Let me help you grow your business!</Text>
        </View>
        <Image source={require("../assets/mascot-avatar.png")} style={styles.mascotImage} resizeMode="contain" />
        
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Onboarding")}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => navigation.navigate("MainChat")}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  mascotContainer: {
    alignItems: "center",
    position: "relative",
  },
  mascotImage: {
    width: 250,
    height: 250,
    marginVertical: 20,
    shadowColor:"#000",
    shadowRadius:10,
    shadowOpacity: 0.5,
    shadowOffset: (10),
  },
  speechBubble: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    maxWidth: 250,
    position: "relative",
  },
  speechText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  buttonContainer: {
    width: "80%",
  },
  button: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#2FAE60",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
})
