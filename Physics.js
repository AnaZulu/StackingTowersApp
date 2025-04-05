import Matter from "matter-js";

let swingAngle = 0;

export default function Physics(entities, { time }) {
  const engine = entities.physics.engine;
  Matter.Engine.update(engine, time.delta);

  const world = entities.physics.world;

  // Make the crane swing left and right across the screen
  const crane = entities.crane?.body;
  if (crane) {
    swingAngle += 0.05; // Controls the swing speed
    const amplitude = 80; //  The Max distance the crane swings
    const centerX = entities.screen?.width || 400;
    const newX = centerX / 2 + Math.sin(swingAngle) * amplitude;

    // Keep the crane from drifting or spinning
    Matter.Body.setPosition(crane, { x: newX, y: 100 });
    Matter.Body.setVelocity(crane, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(crane, 0);
  }

  // When the box touches the ground or another box, give points
  Matter.Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;

    pairs.forEach(({ bodyA, bodyB }) => {
      // Ensure we're always using bodyB to check for scoring
      let boxBody = null;

      if (bodyB.label.includes("Box")) {
        boxBody = bodyB;
      }

      if (boxBody) {
        const boxEntity = Object.values(entities).find(
          (e) => e.body && e.body.id === boxBody.id
        );

        if (boxEntity && boxEntity.points) {
          // Ensure a box only scores once
          if (!boxEntity.hasScored) {
            boxEntity.hasScored = true;

            const currentScore = entities.score || 0;
            const points = boxEntity.points || 0;
            const newScore = currentScore + points;

            console.log("Updated score: ", newScore);

            // Update the score
            entities.score = newScore;

            if (typeof entities.setScore === "function") {
              entities.setScore(newScore);
            }
          }
        }
      }
    });
  });

  return entities;
}
