/**
 * Main Entry Point
 * Initializes the accident simulation application
 */

import "../src/styles/main.css";
import { GameController } from "../src/GameController.js";

// Register components immediately when module loads, before A-Frame scene initializes
console.log("📦 Main.js loaded, waiting for AFRAME...");

// Wait for AFRAME to be available (it's loaded via CDN script tag)
function waitForAFrame() {
  return new Promise((resolve) => {
    if (window.AFRAME) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.AFRAME) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    }
  });
}

waitForAFrame().then(() => {
  console.log("✅ AFRAME loaded, initializing game controller early...");
  
  // Initialize game controller BEFORE scene loads so components are registered
  const game = new GameController();
  
  // Make game controller available globally
  window.gameController = game;
  
  // Now wait for scene to be ready and start the game
  const scene = document.querySelector("a-scene");
  
  if (scene) {
    scene.addEventListener('loaded', () => {
      console.log("🎮 A-Frame scene loaded successfully");
      game.start();
      console.log("✅ Game started");
    });
  } else {
    console.error("❌ A-Frame scene not found!");
  }
});

