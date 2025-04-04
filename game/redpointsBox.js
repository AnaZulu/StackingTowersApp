import Matter from "matter-js";
import React from "react";
import { Image } from "react-native";

export default function RedBox(world, pos, label, score, setScore) {
  const box = Matter.Bodies.rectangle(pos.x, pos.y, 40, 40, {
    label,
    restitution: 0.5,
    friction: 0.5,
  });

  Matter.World.add(world, [box]);

  return {
    body: box,
    size: [40, 40],
    label,
    renderer: () => (
      <Image
        source={require("../assets/redpointsBox.png")}
        style={{
          width: 40,
          height: 40,
          resizeMode: "contain",
          position: "absolute",
          left: box.position.x - 20,
          top: box.position.y - 20,
        }}
      />
    ),
    points: 20,
  };
}
