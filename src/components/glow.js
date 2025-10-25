/**
 * A-Frame Component: glow
 * Adds pulsing glow effect to interactable items
 */

export function registerGlow() {
  if (!window.AFRAME) {
    console.error('AFRAME not loaded');
    return;
  }
  
  AFRAME.registerComponent('glow', {
    schema: { 
      active: { type: 'boolean', default: false } 
    },
    
    init: function () {
      this.animId = null;
    },
    
    update: function () {
      if (this.data.active) {
        // Pulse scale & color
        this.el.setAttribute('animation__pulse', 
          'property: scale; dir: alternate; dur: 800; to: 1.12 1.12 1.12; loop: true'
        );
        this.el.setAttribute('animation__color', 
          'property: color; dir: alternate; dur: 800; to: #ffffff; loop: true'
        );
      } else {
        this.el.removeAttribute('animation__pulse');
        this.el.removeAttribute('animation__color');
        this.el.setAttribute('scale', '1 1 1');
      }
    }
  });
}
