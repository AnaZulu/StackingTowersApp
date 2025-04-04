import Matter from "matter-js";

export default function Physics(entities, { time }) {
  const engine = entities.physics.engine;
  Matter.Engine.update(engine, time.delta);

  const world = entities.physics.world;

  Matter.Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;

    pairs.forEach(({ bodyA, bodyB }) => {
      let boxBody, groundBody;

      if (bodyA.label === "Ground" && bodyB.label.includes("Box")) {
        groundBody = bodyA;
        boxBody = bodyB;
      } else if (bodyB.label === "Ground" && bodyA.label.includes("Box")) {
        groundBody = bodyB;
        boxBody = bodyA;
      }

      if (groundBody && boxBody) {
        const boxEntity = Object.values(entities).find(
          (e) => e.body && e.body.id === boxBody.id
        );

        if (boxEntity && boxEntity.points) {
          if (!boxEntity.hasScored) {
            boxEntity.hasScored = true;
            const currentScore = entities.score || 0;
            const setScore = entities.setScore;

            const newScore = currentScore + boxEntity.points;
            if (typeof setScore === "function") {
              setScore(newScore);
              entities.score = newScore;
            }
          }
        }
      }
    });
  });

  return entities;
}
