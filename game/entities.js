import Matter from "matter-js";
import { Dimensions, Image, View } from "react-native";
import BlueBox from "./bluepointsBox";
import RedBox from "./redpointsBox";
import YellowBox from "./yellowpointsBox";

const { width, height } = Dimensions.get("window");

export default function createEntities(score, setScore) {
  const engine = Matter.Engine.create({ enableSleeping: false });
  const world = engine.world;

  const ground = Matter.Bodies.rectangle(width / 2, height - 25, width, 50, {
    isStatic: true,
    label: "Ground",
  });

  const crane = Matter.Bodies.rectangle(width / 2, 100, 100, 20, {
    isStatic: false,
    label: "Crane",
    render: {
      sprite: {
        texture: require("../assets/Crane.png"),
        xScale: 0.5,
        yScale: 0.5,
      },
    },
  });

  Matter.World.add(world, [ground, crane]);

  const craneRenderer = (props) => {
    const { body } = props;
    const { position, angle } = body;

    return (
      <View
        style={{
          position: "absolute",
          left: position.x - 20,
          top: position.y - 100,
          transform: [{ rotate: `${angle}rad` }],
        }}
      >
        <Image
          source={require("../assets/Crane.png")}
          style={{ width: 40, height: 250 }}
        />
      </View>
    );
  };

  return {
    physics: { engine, world },
    ground: {
      body: ground,
      size: [width, 100],
      color: "transparent",
      renderer: (props) => null,
    },
    crane: {
      body: crane,
      size: [100, 20],
      image: require("../assets/Crane.png"),
      renderer: craneRenderer,
    },
    blueBox: BlueBox(
      world,
      { x: width / 2, y: 150 },
      "BlueBox",
      score,
      setScore
    ),
    yellowBox: YellowBox(
      world,
      { x: width / 2, y: 150 },
      "YellowBox",
      score,
      setScore
    ),
    redBox: RedBox(world, { x: width / 2, y: 150 }, "RedBox", score, setScore),
  };
}
