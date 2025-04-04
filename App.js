import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import StartScreen from "./components/StartScreen";
import GameScreen from "./components/GameScreen";

export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  console.log("LOGGED APP LOADED", isGameStarted);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {isGameStarted ? (
          <GameScreen
            onGameOver={() => {
              console.log("LOGGED GAME OVER");
              setIsGameStarted(false);
            }}
          />
        ) : (
          <StartScreen
            onStart={() => {
              console.log("LOGGED START BUTTON");
              setIsGameStarted(true);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  inner: {
    flex: 1,
  },
});
