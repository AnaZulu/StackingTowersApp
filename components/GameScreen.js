import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { GameEngine } from "react-native-game-engine";
import Matter from "matter-js";
import createEntities from "../game/entities";
import Physics from "../Physics";
import ScoreBoard from "./ScoreBoard";
import BlueBox from "../game/bluepointsBox";
import YellowBox from "../game/yellowpointsBox";
import RedBox from "../game/redpointsBox";

export default function GameScreen({ onGameOver }) {
  const engine = useRef(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const entitiesRef = useRef(createEntities(score, setScore));

  useEffect(() => {
    if (engine.current) {
      entitiesRef.current.score = score;
      engine.current.swap(entitiesRef.current);
    }

    if (score >= 200) {
      setRunning(false);
      onGameOver?.();
    }
  }, [score]);

  const reset = () => {
    setRunning(false);
    setTimeout(() => {
      setScore(0);
      entitiesRef.current = createEntities(0, setScore);
      setRunning(true);
    }, 100);
  };

  const handleDrop = () => {
    const craneBody = entitiesRef.current.crane.body;
    const craneX = craneBody.position.x;
    const craneY = craneBody.position.y;

    let BoxComponent;
    let boxLabel;
    let dropSpeed;
    let boxPoints;

    // Choose block color based on score
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

    // Generate a unique key for each box
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const entityKey = `${boxLabel}_${timestamp}_${random}`;

    // Create the box using BoxComponent
    const newBox = BoxComponent(
      entitiesRef.current.physics.world,
      { x: craneX, y: craneY + 50 },
      boxLabel,
      boxPoints,
      setScore
    );

    // Set the block's fall speed
    Matter.Body.setVelocity(newBox.body, { x: 0, y: dropSpeed });

    // Add the block to the engine using its unique key
    entitiesRef.current[entityKey] = newBox;

    // Force the engine to refresh
    engine.current.swap(entitiesRef.current);
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

        <TouchableOpacity style={styles.restartBtn} onPress={reset}>
          <Image
            source={require("../assets/Restartbtn.png")}
            style={styles.restartImage}
          />
        </TouchableOpacity>
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
  restartBtn: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
  },
  restartImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
