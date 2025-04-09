import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient colors={["#2FAE60", "#1E8449"]} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../assets/logo-placeholder.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>GigBoost</Text>
        <Text style={styles.tagline}>Empowering Gig Workers with AI</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Onboarding")}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.loginButton]} onPress={() => navigation.navigate("MainApp")}>
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
    paddingVertical: 80,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
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
