import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StartScreen({ onStart }) {
  const [highScore, setHighScore] = useState(0);

  // Load the high score from storage when screen loads
  useEffect(() => {
    const loadHighScore = async () => {
      const stored = await AsyncStorage.getItem("HIGH_SCORE");
      if (stored) setHighScore(parseInt(stored));
    };
    loadHighScore();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/Logo.png")} style={styles.logo} />

      <Text style={styles.topScore}> High Score: {highScore}</Text>

      <Text style={styles.credits}>Ana Zuluaga</Text>
      <Text style={styles.credits}>Gerry Lopez</Text>
      <Text style={styles.credits}>Hayden Stewart</Text>

      <TouchableOpacity onPress={onStart}>
        <Image
          source={require("../assets/Startbtn.png")}
          style={styles.startBtn}
        />
      </TouchableOpacity>
    </View>
  );
}

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
  startBtn: { width: 150, height: 50, marginTop: 30 },
});
