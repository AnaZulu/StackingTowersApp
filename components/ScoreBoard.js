import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function ScoreBoard({ score }) {
  return (
    <View style={styles.scoreContainer}>
      {/* Top Score Image */}
      <Image
        source={require('../assets/TopScore.png')} // Your TopScore image
        style={styles.topScoreImage}
      />
      
      {/* Actual Score */}
      <Text style={styles.scoreText}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row', // Align items in a row (image + score)
    alignItems: 'center', // Center vertically
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
  },
  topScoreImage: {
    width: 100,  // Adjust width as needed
    height: 40,  // Adjust height as needed
    marginRight: 10, // Space between image and text
  },
  scoreText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
