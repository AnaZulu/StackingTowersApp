import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
// Slider for selecting difficulty
import Slider from "@react-native-community/slider";
// Used to store and retrieve high score
import AsyncStorage from "@react-native-async-storage/async-storage";

// Main component for the Start Screen
export default function StartScreen({ onStart }) {
  // Local state for high score and difficulty level
  const [highScore, setHighScore] = useState(0);
  // Default difficulty
  const [difficulty, setDifficulty] = useState("Normal");

  // Load the high score from storage when the screen first loads
  useEffect(() => {
    const loadHighScore = async () => {
      const stored = await AsyncStorage.getItem("HIGH_SCORE");
      // Save the retrieved high score into state
      if (stored) setHighScore(parseInt(stored));
    };
    loadHighScore();
  }, []);

  // Called when the slider value changes
  const handleDifficultyChange = (value) => {
    // Matching slider values to difficulty strings
    const levels = ["Easy", "Normal", "Hard"];
    const level = levels[Math.round(value)];
    setDifficulty(level);
  };

  // Called when the "Start" button is pressed
  const handleStart = () => {
    // Pass selected difficulty to App.js
    onStart(difficulty);
  };

  return (
    <View style={styles.container}>
      {/* Game logo */}
      <Image source={require("../assets/Logo.png")} style={styles.logo} />

      {/* High score display */}
      <Text style={styles.topScore}> High Score: {highScore}</Text>

      {/* Difficulty slider */}
      <Text style={styles.label}>Select Difficulty:</Text>
      <Slider
        style={{ width: 200, height: 40 }}
        minimumValue={0}
        maximumValue={2}
        step={1}
        value={1}
        onValueChange={handleDifficultyChange}
      />
      <Text style={styles.difficultyLabel}>{difficulty}</Text>

      {/* Start button */}
      <TouchableOpacity onPress={handleStart}>
        <Image
          source={require("../assets/Startbtn.png")}
          style={styles.startBtn}
        />
      </TouchableOpacity>

      {/* Developer credits */}
      <Text style={styles.credits}>Ana Zuluaga</Text>
      <Text style={styles.credits}>Gerry Lopez</Text>
      <Text style={styles.credits}>Hayden Stewart</Text>
    </View>
  );
}

// Styling for the Start Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 350, height: 250, marginBottom: 20 },
  topScore: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  credits: { marginTop: 5, fontSize: 24 },
  label: { fontSize: 18, marginTop: 30 },
  difficultyLabel: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  startBtn: { width: 150, height: 50, marginTop: 30 },
});
