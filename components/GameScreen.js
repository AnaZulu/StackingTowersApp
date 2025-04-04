import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import entities from '../game/entities';
import Physics from '../Physics';
import ScoreBoard from './ScoreBoard';

export default function GameScreen({ onGameOver }) {
  const engine = useRef(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);

  const reset = () => {
    setRunning(false);
    setTimeout(() => {
      setScore(0);
      engine.current.swap(entities(score, setScore));
      setRunning(true);
    }, 100);
  };

  useEffect(() => {
    engine.current && engine.current.swap(entities(score, setScore));
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Backgroundimg.jpg')} style={styles.background} />
      <GameEngine
        ref={engine}
        style={styles.gameEngine}
        systems={[Physics]}
        entities={entities(score, setScore)}
        running={running}
      >
        <ScoreBoard score={score} />
      </GameEngine>

      <TouchableOpacity style={styles.restartBtn} onPress={reset}>
        <Image source={require('../assets/Restartbtn.png')} style={styles.restartImage} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gameEngine: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  restartBtn: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
  },
  restartImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});
