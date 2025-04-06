import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import Matter from "matter-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resetGameOverFlag } from "../Physics";
import { Audio } from "expo-av";

import createEntities from "../game/entities";
import Physics from "../Physics";
import ScoreBoard from "./ScoreBoard";
import BlueBox from "../game/bluepointsBox";
import YellowBox from "../game/yellowpointsBox";
import RedBox from "../game/redpointsBox";
import GameOverOverlay from "./GameOverOverlay";

export default function GameScreen({ onGameOver }) {
  const engine = useRef(null);
  const [running, setRunning] = useState(true);
  const [inputEnabled, setInputEnabled] = useState(true);
  const [score, setScore] = useState(0);
  const entitiesRef = useRef(createEntities(score, setScore));
  const onGameOverRef = useRef(onGameOver);
  const soundRef = useRef(null); // Background Music
  const gameOverSoundRef = useRef(null); // Game Over sound effect

  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  // Load both the BGM and Game Over sound
  useEffect(() => {
    const loadSounds = async () => {
      const { sound: bgm } = await Audio.Sound.createAsync(
        require("../assets/bgm.mp3"),
        { isLooping: true, volume: 0.8 }
      );
      soundRef.current = bgm;
      await bgm.playAsync();

      const { sound: gameOverSound } = await Audio.Sound.createAsync(
        require("../assets/gameover.wav"),
        { volume: 1.0 }
      );
      gameOverSoundRef.current = gameOverSound;
    };

    loadSounds();

    return () => {
      soundRef.current?.unloadAsync();
      gameOverSoundRef.current?.unloadAsync();
    };
  }, []);

  // When the game over overlay appears, pause the BGM and play the sound
  useEffect(() => {
    if (!inputEnabled && gameOverSoundRef.current) {
      soundRef.current?.pauseAsync(); // pause the bgm
      gameOverSoundRef.current.replayAsync(); // play the game over sound
    }
  }, [inputEnabled]);

  useEffect(() => {
    entitiesRef.current.setScore = setScore;
    entitiesRef.current.setRunning = setRunning;
    entitiesRef.current.setInputEnabled = setInputEnabled;
    entitiesRef.current.onGameOver = (type) => {
      if (type === "win") {
        onGameOverRef.current?.("win");
      }
    };

    if (engine.current) {
      entitiesRef.current.score = score;
      engine.current.swap(entitiesRef.current);
    }

    if (score >= 200) {
      setRunning(false);
      setInputEnabled(false);
      saveHighScore(score);
      onGameOver?.("win");
    }
  }, [score]);

  const saveHighScore = async (newScore) => {
    try {
      const stored = await AsyncStorage.getItem("HIGH_SCORE");
      const high = stored ? parseInt(stored) : 0;
      if (newScore > high) {
        await AsyncStorage.setItem("HIGH_SCORE", newScore.toString());
      }
    } catch (error) {
      console.error("Error saving high score:", error);
    }
  };

  const reset = () => {
    resetGameOverFlag();
    setRunning(false);
    setInputEnabled(false);
    saveHighScore(score);

    // Resume background music when restarting
    soundRef.current?.playAsync();

    setTimeout(() => {
      const newEntities = createEntities(0, setScore);
      newEntities.setScore = setScore;
      newEntities.setRunning = setRunning;
      newEntities.setInputEnabled = setInputEnabled;
      newEntities.onGameOver = (type) => {
        onGameOverRef.current?.(type);
      };
      newEntities.score = 0;

      entitiesRef.current = newEntities;
      setScore(0);
      setInputEnabled(true);

      if (engine.current) {
        engine.current.swap(newEntities);
      }

      setRunning(true);
    }, 300);
  };

  // Drop sound effect
  const playDropSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/drop.wav"),
      { volume: 1.0 }
    );
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  };

  const handleDrop = async () => {
    if (!inputEnabled) return;

    const craneBody = entitiesRef.current.crane.body;
    const craneX = craneBody.position.x;
    const craneY = craneBody.position.y;

    let BoxComponent, boxLabel, dropSpeed, boxPoints;

    if (score >= 100) {
      BoxComponent = RedBox;
      boxLabel = "RedBox";
      dropSpeed = 8;
      boxPoints = 20;
    } else if (score >= 50) {
      BoxComponent = YellowBox;
      boxLabel = "YellowBox";
      dropSpeed = 5;
      boxPoints = 10;
    } else {
      BoxComponent = BlueBox;
      boxLabel = "BlueBox";
      dropSpeed = 2;
      boxPoints = 5;
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const entityKey = `${boxLabel}_${timestamp}_${random}`;

    const newBox = BoxComponent(
      entitiesRef.current.physics.world,
      { x: craneX, y: craneY + 50 },
      boxLabel,
      boxPoints,
      setScore
    );

    Matter.Body.setVelocity(newBox.body, { x: 0, y: dropSpeed });
    entitiesRef.current[entityKey] = newBox;
    engine.current.swap(entitiesRef.current);

    await playDropSound(); // Play the drop sound after dropping
  };

  return (
    <TouchableWithoutFeedback onPress={handleDrop}>
      <View style={styles.container}>
        <Image
          source={require("../assets/Backgroundimg.jpg")}
          style={styles.background}
        />

        <GameEngine
          ref={engine}
          style={styles.gameEngine}
          systems={[Physics]}
          entities={entitiesRef.current}
          running={running}
        >
          <ScoreBoard score={score} />
        </GameEngine>

        {!inputEnabled && (
          <GameOverOverlay
            onRestart={reset}
            onBackToStart={() => onGameOver?.("lose")}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gameEngine: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
