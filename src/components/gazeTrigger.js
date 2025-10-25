/**
 * A-Frame Component: gaze-trigger
 * Handles gaze/click triggers for looking left and right
 */

import { GAME_CONFIG } from '../config/gameConfig.js';

export function registerGazeTrigger(gameState, onBothLooked) {
  if (!window.AFRAME) {
    console.error('AFRAME not loaded');
    return;
  }
  
  AFRAME.registerComponent('gaze-trigger', {
    schema: { 
      id: { type: 'string' } 
    },
    
    init: function () {
      console.log('👁️ Gaze-trigger component initialized on element:', this.el.id, 'with id:', this.data.id);
      const el = this.el;
      this.completed = false;
      
      this.handleClick = () => {
        // Prevent clicks after completion
        if (this.completed) {
          console.log('⛔ Click ignored - already completed');
          return;
        }
        
        const id = this.data.id;
        console.log('👆 Gaze marker clicked:', id);
        
        if (id === 'left') {
          console.log('✅ Setting looked left to true');
          gameState.setLookedLeft(true);
          el.setAttribute('color', GAME_CONFIG.colors.gazeCompleted);
          el.setAttribute('scale', '1.3 1.3 1.3');
        } else if (id === 'right') {
          console.log('✅ Setting looked right to true');
          gameState.setLookedRight(true);
          el.setAttribute('color', GAME_CONFIG.colors.gazeCompleted);
          el.setAttribute('scale', '1.3 1.3 1.3');
        }
        
        // Check if both have been looked at
        if (gameState.hasLookedBothWays()) {
          console.log('🎯 Both markers looked at! Triggering callback...');
          this.completed = true;
          gameState.completeGazeCheck();
          
          const lookLeft = document.getElementById('lookLeft');
          const lookRight = document.getElementById('lookRight');
          const lookHint = document.getElementById('lookHint');
          
          // Remove event listeners to prevent further clicks
          if (lookLeft) {
            lookLeft.removeEventListener('click', this.handleClick);
            lookLeft.removeEventListener('mousedown', this.handleClick);
            lookLeft.removeEventListener('touchstart', this.handleClick);
            lookLeft.setAttribute('visible', false);
          }
          if (lookRight) {
            lookRight.removeEventListener('click', this.handleClick);
            lookRight.removeEventListener('mousedown', this.handleClick);
            lookRight.removeEventListener('touchstart', this.handleClick);
            lookRight.setAttribute('visible', false);
          }
          if (lookHint) lookHint.setAttribute('visible', false);
          
          if (onBothLooked) {
            onBothLooked();
          }
        }
      };
      
      console.log('🔗 Adding click listeners to element:', el.id);
      el.addEventListener('click', this.handleClick);
      el.addEventListener('mousedown', this.handleClick);
      el.addEventListener('touchstart', this.handleClick);
    }
  });
}
