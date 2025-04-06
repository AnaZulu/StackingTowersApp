import Matter from "matter-js";
import React from "react";
import { Image } from "react-native";

const RedBoxRenderer = (props) => {
  const { body } = props;
  const width = 40;
  const height = 40;

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

export default function RedBox(world, pos, label, score, setScore) {
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
    renderer: RedBoxRenderer,
    points: 20,
  };
}
