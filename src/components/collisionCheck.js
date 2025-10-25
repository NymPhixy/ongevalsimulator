/**
 * A-Frame Component: collision-check
 * Detects collision between car and person
 */

import { GAME_CONFIG } from '../config/gameConfig.js';

export function registerCollisionCheck(gameState, onCrash) {
  console.log('🚀 Registering collision-check component...');
  if (!window.AFRAME) {
    console.error('❌ AFRAME not loaded');
    return;
  }
  console.log('✅ AFRAME is loaded, registering component');
  
  AFRAME.registerComponent('collision-check', {
    init: function() {
      console.log('🔍 Collision check component initialized');
      this.checkCount = 0;
    },
    tick: function () {
      if (!gameState.carMoving) return;
      
      this.checkCount++;
      if (this.checkCount % 60 === 0) {
        console.log('🚗 Car is moving, checking collision...');
      }
      
      const car = document.getElementById('car');
      const person = document.getElementById('person');
      
      if (!car || !person) return;
      
      const carPos = car.getAttribute('position');
      const personPos = person.getAttribute('position');
      
      const dx = carPos.x - personPos.x;
      const dz = carPos.z - personPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < GAME_CONFIG.collision.detectionDistance && !gameState.crashed) {
        console.log('💥 COLLISION! Distance:', distance);
        if (onCrash) {
          onCrash();
        }
      }
    }
  });
}
