import Matter from "matter-js";
import React from "react";
import { Image } from "react-native";

// Component that draws the red box at its physics body position
const RedBoxRenderer = (props) => {
  const { body } = props;
  const width = 40;
  const height = 40;

  // Calculate the top-left corner position for the image
  const x = body.position.x - width / 2;
  const y = body.position.y - height / 2;

  return (
    <Image
      source={require("../assets/redpointsBox.png")}
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

// Function to create a red box with physics and rendering logic
export default function RedBox(world, pos, label, score, setScore, onLand) {
  // Create the Matter.js physics body
  const box = Matter.Bodies.rectangle(pos.x, pos.y, 40, 40, {
    label,
    restitution: 0,
    friction: 0.3,
    frictionStatic: 0.5,
    density: 0.002,
    inertia: Infinity,
    angle: 0,
  });

  // Add the red box to the game world
  Matter.World.add(world, [box]);

  // Return the complete entity used by the game engine
  return {
    body: box,
    size: [40, 40],
    label,
    renderer: RedBoxRenderer,
    points: 20,
    onLand,
  };
}
