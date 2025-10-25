// public/main.js
// Minimal entry module for Vite. Add actual app logic here.
// Import A-Frame from the npm package so Vite can pre-bundle it.
import "aframe";

console.log("public/main.js loaded");

// Example: bind an overlay start button if present
document.addEventListener("DOMContentLoaded", () => {
  // Placeholder for project-specific initialization
  const scene = document.querySelector("a-scene");
  if (scene) {
    console.log("A-Frame scene found");
  }
});
