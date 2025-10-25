/**
 * A-Frame Component: pickable
 * Allows items to be picked up and held by clicking
 */

export function registerPickable(gameState, onPickup) {
  if (!window.AFRAME) {
    console.error('AFRAME not loaded');
    return;
  }
  
  AFRAME.registerComponent('pickable', {
    init: function () {
      const el = this.el;
      
      const tryPickup = () => {
        // Only allow pickup when items are usable (EHBO stage)
        const currentStep = gameState.getCurrentStep();
        const heldItem = gameState.getHeldItem();
        
        if (currentStep >= 4 && !heldItem && el.getAttribute('visible') === true) {
          const itemId = el.getAttribute('id');
          gameState.holdItem(itemId);
          
          try {
            // Attach to camera
            const cam = document.querySelector('[camera]');
            if (cam && el.object3D && el.object3D.parent) {
              el.object3D.parent.removeChild(el.object3D);
              cam.appendChild(el);
              
              el.setAttribute('position', '0 -0.12 -0.6');
              el.setAttribute('rotation', '0 0 0');
              el.setAttribute('scale', '0.9 0.9 0.9');
              
              // Disable glow while held
              if (el.components['glow']) {
                el.setAttribute('glow', { active: false });
              }
              
              if (onPickup) {
                onPickup(itemId);
              }
            }
          } catch (e) {
            console.error('Cannot pick up element', e);
          }
        }
      };
      
      // Support mouse/touch and A-Frame click events
      el.addEventListener('click', tryPickup);
      el.addEventListener('mousedown', tryPickup);
      el.addEventListener('touchstart', tryPickup);
    }
  });
}
