import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import StartScreen from "./components/StartScreen";
import GameScreen from "./components/GameScreen";
import WinScreen from "./components/WinScreen";

export default function App() {
  const [screen, setScreen] = useState("start");

  const startGame = () => {
    setScreen("game");
  };

  const handleGameOver = (type) => {
    if (type === "win") {
      setScreen("win");
    } else if (type === "lose") {
      // Only triggered when "Back to Start" is pressed
      setScreen("start");
    }
  };

  const backToMenu = () => {
    setScreen("start");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {screen === "start" && <StartScreen onStart={startGame} />}
        {screen === "game" && <GameScreen onGameOver={handleGameOver} />}
        {screen === "win" && <WinScreen onBackToMenu={backToMenu} />}
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
