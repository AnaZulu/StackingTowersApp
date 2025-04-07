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

// Game logic and components
import createEntities from "../game/entities";
import Physics from "../Physics";
import ScoreBoard from "./ScoreBoard";
import BlueBox from "../game/bluepointsBox";
import YellowBox from "../game/yellowpointsBox";
import RedBox from "../game/redpointsBox";
import GameOverOverlay from "./GameOverOverlay";

// Main game screen component
export default function GameScreen({ onGameOver, difficulty }) {
  // Game engine ref
  const engine = useRef(null);
  // Whether the game is running
  const [running, setRunning] = useState(true);
  // Input toggle
  const [inputEnabled, setInputEnabled] = useState(true);
  // Player score
  const [score, setScore] = useState(0);
  // Game entities
  const entitiesRef = useRef(createEntities(score, setScore));
  // Store game over callback
  const onGameOverRef = useRef(onGameOver);
  // Background music reference
  const soundRef = useRef(null);
  // Game over sound effect
  const gameOverSoundRef = useRef(null);

  // Update the game over callback when it changes
  useEffect(() => {
    onGameOverRef.current = onGameOver;
  }, [onGameOver]);

  // Load and play the sound effects (background music and game over sound)
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

  // Pause the BGM and play the game over sound if the game ends
  useEffect(() => {
    if (!inputEnabled && gameOverSoundRef.current) {
      soundRef.current?.pauseAsync();
      gameOverSoundRef.current.replayAsync();
    }
  }, [inputEnabled]);

  // Update entities with the score, game state handlers, and difficulty
  useEffect(() => {
    entitiesRef.current.setScore = setScore;
    entitiesRef.current.setRunning = setRunning;
    entitiesRef.current.setInputEnabled = setInputEnabled;
    entitiesRef.current.onGameOver = (type) => {
      if (type === "win") {
        onGameOverRef.current?.("win");
      }
    };

    // Pass in the updated score and difficulty
    if (engine.current) {
      entitiesRef.current.score = score;
      entitiesRef.current.difficulty = difficulty;
      engine.current.swap(entitiesRef.current);
    }

    // Check the win condition
    if (score >= 200) {
      setRunning(false);
      setInputEnabled(false);
      saveHighScore(score);
      onGameOver?.("win");
    }
  }, [score]);

  // Save the high score to the local storage
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

  // Reset the game state and entities
  const reset = () => {
    resetGameOverFlag();
    setRunning(false);
    setInputEnabled(false);
    saveHighScore(score);

    setTimeout(async () => {
      const newEntities = createEntities(0, setScore);
      newEntities.setScore = setScore;
      newEntities.setRunning = setRunning;
      newEntities.setInputEnabled = setInputEnabled;
      newEntities.onGameOver = (type) => {
        onGameOverRef.current?.(type);
      };
      newEntities.score = 0;
      newEntities.landedBoxes = [];
      newEntities.difficulty = difficulty;

      entitiesRef.current = newEntities;
      setScore(0);
      setInputEnabled(true);

      if (engine.current) {
        engine.current.swap(newEntities);
      }

      if (soundRef.current) {
        await soundRef.current.playAsync();
      }

      setRunning(true);
    }, 300);
  };

  // Play the drop sound when a box is dropped
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

  // Handle screen tap: drop a new box
  const handleDrop = async () => {
    if (!inputEnabled) return;

    const craneBody = entitiesRef.current.crane.body;
    const craneX = craneBody.position.x;
    const craneY = craneBody.position.y;

    let BoxComponent, boxLabel, dropSpeed, boxPoints;

    // Determine the box type based on score
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

    // Create a unique ID for the new box
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const entityKey = `${boxLabel}_${timestamp}_${random}`;

    // Create the box entity
    const newBox = BoxComponent(
      entitiesRef.current.physics.world,
      { x: craneX, y: craneY + 50 },
      boxLabel,
      boxPoints,
      setScore,
      () => {
        // Track all the landed boxes
        if (!entitiesRef.current.landedBoxes) {
          entitiesRef.current.landedBoxes = [];
        }

        entitiesRef.current.landedBoxes.push({
          key: entityKey,
          body: newBox.body,
        });

        // Remove bottom-most box if more than 7 are stacked
        while (entitiesRef.current.landedBoxes.length > 7) {
          const oldest = entitiesRef.current.landedBoxes.shift();
          if (oldest?.body) {
            const entityKeyToRemove = Object.keys(entitiesRef.current).find(
              (key) =>
                entitiesRef.current[key]?.body &&
                entitiesRef.current[key].body === oldest.body
            );

            if (entityKeyToRemove) {
              Matter.World.remove(
                entitiesRef.current.physics.world,
                oldest.body
              );
              delete entitiesRef.current[entityKeyToRemove];

              // Temporarily stabilize the new bottom box
              const nextOldest = entitiesRef.current.landedBoxes[0];
              if (nextOldest && nextOldest.body) {
                Matter.Body.setStatic(nextOldest.body, true);
                Matter.Body.setVelocity(nextOldest.body, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(nextOldest.body, 0);

                setTimeout(() => {
                  Matter.Body.setStatic(nextOldest.body, false);
                }, 150);
              }
            }
          }
        }
      }
    );

    // Apply downward velocity to drop the box
    Matter.Body.setVelocity(newBox.body, { x: 0, y: dropSpeed });

    // Add new box to the game entities
    entitiesRef.current[entityKey] = newBox;

    // Update the game engine with new entities
    engine.current.swap(entitiesRef.current);

    // Play the drop sound effect
    await playDropSound();
  };

  return (
    <TouchableWithoutFeedback onPress={handleDrop}>
      <View style={styles.container}>
        {/* Game background */}
        <Image
          source={require("../assets/Backgroundimg.jpg")}
          style={styles.background}
        />

        {/* Game engine with physics and game entities */}
        <GameEngine
          ref={engine}
          style={styles.gameEngine}
          systems={[Physics]}
          entities={entitiesRef.current}
          running={running}
        >
          <ScoreBoard score={score} />
        </GameEngine>

        {/* Game over overlay */}
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

// Screen styling
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
