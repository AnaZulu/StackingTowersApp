import Matter from "matter-js";
import { Audio } from "expo-av";

let swingAngle = 0;
let gameOverTriggered = false;
let gameOverTimeout = null;

let collapseSound = null;

// Load the collapse sound effect once when the module loads
(async () => {
  const { sound } = await Audio.Sound.createAsync(
    require("./assets/collapse.wav"),
    { volume: 1.0 }
  );
  collapseSound = sound;
})();

export default function Physics(entities, { time }) {
  const engine = entities.physics.engine;
  Matter.Engine.update(engine, time.delta);

  const crane = entities.crane?.body;
  if (crane) {
    swingAngle += 0.05;
    const amplitude = 80;
    const centerX = entities.screen?.width || 400;
    const newX = centerX / 2 + Math.sin(swingAngle) * amplitude;

    Matter.Body.setPosition(crane, { x: newX, y: 100 });
    Matter.Body.setVelocity(crane, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(crane, 0);
  }

  Matter.Events.on(engine, "collisionStart", (event) => {
    if (gameOverTriggered) return;

    const pairs = event.pairs;

    pairs.forEach(({ bodyA, bodyB }) => {
      let boxBody = null;
      let otherBody = null;

      if (bodyA.label.includes("Box")) {
        boxBody = bodyA;
        otherBody = bodyB;
      } else if (bodyB.label.includes("Box")) {
        boxBody = bodyB;
        otherBody = bodyA;
      }

      if (boxBody) {
        const boxEntity = Object.values(entities).find(
          (e) => e.body && e.body.id === boxBody.id
        );

        if (boxEntity && boxEntity.points && !boxEntity.hasScored) {
          boxEntity.hasScored = true;
          boxEntity.hasLanded = true;

          const currentScore = entities.score || 0;
          const newScore = currentScore + boxEntity.points;
          entities.score = newScore;

          if (typeof entities.setScore === "function") {
            entities.setScore(newScore);
          }
        }

        if (otherBody.label === "Ground" && !boxEntity?.hasLanded) {
          triggerCollapse(entities);
        }

        if (
          boxEntity?.hasLanded &&
          otherBody.label.includes("Box") &&
          boxBody.label.includes("Box")
        ) {
          const deltaX = Math.abs(boxBody.position.x - otherBody.position.x);
          if (deltaX > 10) {
            triggerCollapse(entities);
          }
        }
      }
    });
  });

  return entities;
}

// Collapse Logic
async function triggerCollapse(entities) {
  gameOverTriggered = true;

  Object.values(entities).forEach((entity) => {
    if (entity.body && entity.label?.includes("Box")) {
      Matter.Body.setStatic(entity.body, false);
      Matter.Sleeping.set(entity.body, false);
      Matter.Body.applyForce(entity.body, entity.body.position, {
        x: (Math.random() - 0.5) * 0.05,
        y: 0.05,
      });
      Matter.Body.setAngularVelocity(entity.body, (Math.random() - 0.5) * 0.5);
    }
  });

  if (typeof entities.setInputEnabled === "function") {
    entities.setInputEnabled(false);
  }

  // Play the collapse sound
  if (collapseSound) {
    await collapseSound.replayAsync();
  }

  gameOverTimeout = setTimeout(() => {
    if (typeof entities.setRunning === "function") {
      entities.setRunning(false);
    }
    if (typeof entities.onGameOver === "function") {
      entities.onGameOver("lose");
    }

    gameOverTriggered = false;
    gameOverTimeout = null;
  }, 2500);
}

export function resetGameOverFlag() {
  gameOverTriggered = false;
  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
    gameOverTimeout = null;
  }
}
