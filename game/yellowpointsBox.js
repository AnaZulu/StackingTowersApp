import Matter from "matter-js";
import React from "react";
import { Image } from "react-native";

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

export default function YellowBox(world, pos, label, score, setScore) {
  const box = Matter.Bodies.rectangle(pos.x, pos.y, 40, 40, {
    label,
    restitution: 0.1,
    friction: 0.6,
    frictionStatic: 0.5,
    inertia: 5000,
    sleepThreshold: 20,
  });

  Matter.World.add(world, [box]);

  return {
    body: box,
    size: [40, 40],
    label,
    renderer: YellowBoxRenderer,
    points: 10,
  };
}
