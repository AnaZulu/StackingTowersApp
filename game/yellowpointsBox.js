import Matter from "matter-js";
import React from "react";
import { Image } from "react-native";

// Renders the yellow box image at the correct physics body position
const YellowBoxRenderer = (props) => {
  const { body } = props;
  const width = 40;
  const height = 40;

  const x = body.position.x - width / 2;
  const y = body.position.y - height / 2;

  return (
    <Image
      source={require("../assets/yellowpointsBox.png")}
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

// Creates and returns a YellowBox entity with physics and rendering
export default function YellowBox(world, pos, label, score, setScore, onLand) {
  const box = Matter.Bodies.rectangle(pos.x, pos.y, 40, 40, {
    label,
    restitution: 0,
    friction: 0.3,
    frictionStatic: 0.5,
    density: 0.002,
    inertia: Infinity,
    angle: 0,
  });

  Matter.World.add(world, [box]);

  return {
    body: box,
    size: [40, 40],
    label,
    renderer: YellowBoxRenderer,
    points: 10,
    // Pass along the callback
    onLand,
  };
}
