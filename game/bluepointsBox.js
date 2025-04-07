import Matter from "matter-js";
import React from "react";
import { Image } from "react-native";

// This component renders the blue box on the screen using its physics body's position
const BlueBoxRenderer = (props) => {
  // The Matter.js body for positioning
  const { body } = props;
  const width = 40;
  const height = 40;

  // Calculate the top-left corner for proper image placement
  const x = body.position.x - width / 2;
  const y = body.position.y - height / 2;

  return (
    <Image
      source={require("../assets/bluepointsBox.png")}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        resizeMode: "contain",
      }}
    />
  );
};

// create a blue box entity for the game
export default function BlueBox(world, pos, label, score, setScore, onLand) {
  // Create the physical box body using Matter.js
  const box = Matter.Bodies.rectangle(pos.x, pos.y, 40, 40, {
    label,
    restitution: 0,
    friction: 0.3,
    frictionStatic: 0.5,
    density: 0.002,
    inertia: Infinity,
    angle: 0,
  });

  // Add the body to the physics world
  Matter.World.add(world, [box]);

  // Return the complete entity for use in the game engine
  return {
    body: box,
    size: [40, 40],
    label,
    renderer: BlueBoxRenderer,
    points: 5,
    onLand,
  };
}
