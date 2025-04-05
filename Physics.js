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

  // When the box touches the ground or another box, give points ** I forgot I wasnt the one working on the scoring so replace any of the code if needed ** ** I dont think i got it to work anyways**
  Matter.Events.on(engine, "collisionStart", (event) => {
    const pairs = event.pairs;

    pairs.forEach(({ bodyA, bodyB }) => {
      let boxBody = null;

      // Detect if a box hits anything except the crane
      if (bodyA.label.includes("Box") && bodyB.label !== "Crane") {
        boxBody = bodyA;
      } else if (bodyB.label.includes("Box") && bodyA.label !== "Crane") {
        boxBody = bodyB;
      }

      if (boxBody) {
        const boxEntity = Object.values(entities).find(
          (e) => e.body && e.body.id === boxBody.id
        );

        // Only give points oncer per box
        if (boxEntity && boxEntity.points && !boxEntity.hasScored) {
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
    });
  });

  return entities;
}
