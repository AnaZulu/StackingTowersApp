import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

export default function WinScreen({ onBackToMenu }) {
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require("../assets/Trophy.png")} style={styles.trophy} />
      <Text style={styles.winText}>🎉 Congratulations, You Won! 🎉</Text>
      <TouchableOpacity onPress={onBackToMenu} style={styles.button}>
        <Text style={styles.buttonText}>Back to Start</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffe",
    alignItems: "center",
    justifyContent: "center",
  },
  trophy: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
  },
  winText: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});
