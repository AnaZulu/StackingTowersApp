import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function StartScreen({ onStart }) {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/Logo.png")} style={styles.logo} />
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
  credits: { marginTop: 5, fontSize: 24 },
  startBtn: { width: 150, height: 50, marginTop: 30 },
});
