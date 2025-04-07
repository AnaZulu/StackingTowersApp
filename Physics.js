import Matter from "matter-js";
import { Audio } from "expo-av";

// Variables to control crane swing and game over state
let swingAngle = 0;
let gameOverTriggered = false;
let gameOverTimeout = null;

// Audio reference for the collapse sound effect
let collapseSound = null;

// Preload the collapse sound once when the game loads
(async () => {
  const { sound } = await Audio.Sound.createAsync(
    require("./assets/collapse.wav"),
    { volume: 1.0 }
  );
  collapseSound = sound;
})();

// Main physics system for the game
export default function Physics(entities, { time }) {
  const engine = entities.physics.engine;
  // Update physics engine using time delta
  Matter.Engine.update(engine, time.delta);

  // Handle the swinging movement of the crane
  const crane = entities.crane?.body;
  if (crane) {
    let swingIncrement = 0.025;

    // Increase the crane swing speed based on score
    if (entities.score >= 100) {
      swingIncrement = 0.075;
    } else if (entities.score >= 50) {
      swingIncrement = 0.05;
    }

    swingAngle += swingIncrement;

    const amplitude = 80;
    const centerX = entities.screen?.width || 400;
    const newX = centerX / 2 + Math.sin(swingAngle) * amplitude;

    // Move the crane side to side using sine wave motion
    Matter.Body.setPosition(crane, { x: newX, y: 100 });
    Matter.Body.setVelocity(crane, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(crane, 0);
  }

  // Listen for collision events in the game
  Matter.Events.on(engine, "collisionStart", (event) => {
    if (gameOverTriggered) return;

    const pairs = event.pairs;

    // Loop through each collision pair
    pairs.forEach(({ bodyA, bodyB }) => {
      let boxBody = null;
      let otherBody = null;

      // Identify which body is a box
      if (bodyA.label && bodyA.label.includes("Box")) {
        boxBody = bodyA;
        otherBody = bodyB;
      } else if (bodyB.label && bodyB.label.includes("Box")) {
        boxBody = bodyB;
        otherBody = bodyA;
      }

      if (boxBody) {
        // Find the corresponding box entity
        const boxEntity = Object.values(entities).find(
          (e) => e.body && e.body.id === boxBody.id
        );

        // Handle the scoring when the box lands for the first time
        if (boxEntity && boxEntity.points && !boxEntity.hasScored) {
          boxEntity.hasScored = true;
          boxEntity.hasLanded = true;

          const currentScore = entities.score || 0;
          const newScore = currentScore + boxEntity.points;
          entities.score = newScore;

          // Update the score in the UI
          if (typeof entities.setScore === "function") {
            entities.setScore(newScore);
          }

          // Trigger custom onLand logic if it exists
          if (typeof boxEntity.onLand === "function") {
            boxEntity.onLand();
          }
        }

        // If the box hits the ground before landing properly → trigger collapse
        if (otherBody.label === "Ground" && !boxEntity?.hasLanded) {
          triggerCollapse(entities);
        }

        // If a box lands on another box, check alignment
        if (
          boxEntity?.hasLanded &&
          otherBody.label &&
          otherBody.label.includes("Box") &&
          boxBody.label &&
          boxBody.label.includes("Box")
        ) {
          const deltaX = Math.abs(boxBody.position.x - otherBody.position.x);

          // Determine misalignment tolerance based on difficulty setting
          let threshold = 20;
          if (entities.difficulty === "Easy") threshold = 30;
          else if (entities.difficulty === "Hard") threshold = 10;

          // Trigger collapse if box is misaligned beyond the threshold
          if (deltaX > threshold) {
            triggerCollapse(entities);
          }
        }
      }
    });
  });

  return entities;
}

// Handles the collapse animation and game over logic
async function triggerCollapse(entities) {
  gameOverTriggered = true;

  // Apply random forces and rotations to all blocks for the collapse effect
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

  // Disable the user input
  if (typeof entities.setInputEnabled === "function") {
    entities.setInputEnabled(false);
  }

  // Play the collapse sound
  if (collapseSound) {
    await collapseSound.replayAsync();
  }

  // Wait before fully ending the game
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

// Reset the collapse flag so the game can be restarted
export function resetGameOverFlag() {
  gameOverTriggered = false;
  if (gameOverTimeout) {
    clearTimeout(gameOverTimeout);
    gameOverTimeout = null;
  }
}

