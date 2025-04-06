import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function GameOverOverlay({ onBackToStart, onRestart }) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.text}>Game Over</Text>

      <TouchableOpacity
        onPress={onRestart}
        style={[styles.button, styles.restart]}
      >
        <Text style={styles.buttonText}>Restart</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onBackToStart}
        style={[styles.button, styles.back]}
      >
        <Text style={styles.buttonText}>Back to Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  text: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 10,
  },
  restart: {
    backgroundColor: "#4CAF50",
  },
  back: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
});
