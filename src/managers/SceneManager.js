/**
 * SceneManager
 * Manages A-Frame scene elements and animations
 */

import { GAME_CONFIG } from '../config/gameConfig.js';

export class SceneManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.initializeElements();
  }

  initializeElements() {
    this.body = document.getElementById('body');
    this.ambulance = document.getElementById('ambulance');
    this.triangle = document.getElementById('triangle');
    this.car = document.getElementById('car');
    this.person = document.getElementById('person');
    this.cameraRig = document.getElementById('cameraRig');
    this.ehbo = document.getElementById('ehbo');
    this.wound = document.getElementById('wound');
    this.lookLeft = document.getElementById('lookLeft');
    this.lookRight = document.getElementById('lookRight');
    this.lookHint = document.getElementById('lookHint');
    this.spray = document.getElementById('spray');
    this.plaster = document.getElementById('plaster');
    this.sprayLabel = document.getElementById('sprayLabel');
    this.plasterLabel = document.getElementById('plasterLabel');
    this.medic1 = document.getElementById('medic1');
    this.medic2 = document.getElementById('medic2');
    this.scene = document.querySelector('a-scene');
  }

  /**
   * Start the car crash animation
   */
  startCrash() {
    this.gameState.setCarMoving(true);
    this.car.setAttribute('rotation', '0 0 0');
    
    const from = this.car.getAttribute('position');
    const fromStr = `${from.x} ${from.y} ${from.z}`;
    const config = GAME_CONFIG.positions;
    
    this.car.setAttribute('animation__drive', 
      `property: position; from: ${fromStr}; to: ${config.carEnd.x} ${config.carEnd.y} ${config.carEnd.z}; dur: ${GAME_CONFIG.animations.carDriveDuration}; easing: linear`
    );
  }

  /**
   * Trigger the crash impact
   */
  triggerCrashImpact() {
    this.gameState.setCrashed(true);
    this.car.removeAttribute('animation__drive');
    this.gameState.setCarMoving(false);
    
    // Person falls
    this.person.setAttribute('animation__fallrot', 
      `property: rotation; to: 90 0 -90; dur: ${GAME_CONFIG.animations.fallDuration}; easing: easeOutQuad`
    );
    this.person.setAttribute('animation__fallpos', 
      `property: position; to: ${GAME_CONFIG.positions.personFall.x} ${GAME_CONFIG.positions.personFall.y} ${GAME_CONFIG.positions.personFall.z}; dur: ${GAME_CONFIG.animations.fallDuration}; easing: easeOutQuad`
    );
    
    this.body.setAttribute('color', GAME_CONFIG.colors.personInjured);
  }

  /**
   * Show EHBO items
   */
  showEhboItems() {
    console.log('🏥 Showing EHBO items...');
    console.log('Elements found:', {
      ehbo: !!this.ehbo,
      spray: !!this.spray,
      plaster: !!this.plaster,
      sprayLabel: !!this.sprayLabel,
      plasterLabel: !!this.plasterLabel
    });
    
    this.ehbo.setAttribute('visible', true);
    this.spray.setAttribute('visible', true);
    this.plaster.setAttribute('visible', true);
    this.sprayLabel.setAttribute('visible', true);
    this.plasterLabel.setAttribute('visible', true);
    
    console.log('✅ EHBO items set to visible');
    
    // Make items interactable
    this.spray.setAttribute('pickable', '');
    this.plaster.setAttribute('pickable', '');
    this.spray.setAttribute('glow', { active: false });
    this.plaster.setAttribute('glow', { active: false });
    
    console.log('✅ EHBO items made pickable');
  }

  /**
   * Update item glow effects based on game state
   */
  updateGlows() {
    const activeBase = this.gameState.getCurrentStep() >= 4 && this.gameState.isAmbulanceEnRoute();
    
    this.spray.setAttribute('glow', { 
      active: activeBase && !this.gameState.isWoundDisinfected() 
    });
    
    this.plaster.setAttribute('glow', { 
      active: activeBase && this.gameState.isWoundDisinfected() && !this.gameState.isPlasterApplied() 
    });
    
    // Highlight wound
    const woundActive = activeBase && !this.gameState.isWoundDisinfected();
    if (woundActive) {
      this.wound.setAttribute('animation__pulse', 
        'property: scale; dir: alternate; dur: 700; to: 1.35 1.35 1.35; loop: true'
      );
      this.wound.setAttribute('animation__color', 
        'property: color; dir: alternate; dur: 700; to: #ff6b6b; loop: true'
      );
    } else {
      this.wound.removeAttribute('animation__pulse');
      this.wound.removeAttribute('animation__color');
      this.wound.setAttribute('scale', '1 1 1');
      this.wound.setAttribute('color', GAME_CONFIG.colors.woundInitial);
    }
  }

  /**
   * Disinfect the wound
   */
  disinfectWound() {
    this.wound.setAttribute('color', GAME_CONFIG.colors.woundDisinfected);
    this.gameState.disinfectWound();
  }

  /**
   * Apply plaster to wound
   */
  applyPlaster() {
    this.wound.setAttribute('visible', false);
    this.gameState.applyPlaster();
  }

  /**
   * Hide EHBO box
   */
  hideEhboBox() {
    const config = GAME_CONFIG.positions;
    this.ehbo.setAttribute('animation__close', 
      'property: position; to: 0.8 0 1.2; dur: 800; easing: easeInQuad'
    );
    
    setTimeout(() => {
      this.ehbo.setAttribute('visible', false);
      this.ehbo.removeAttribute('animation__close');
    }, 900);
  }

  /**
   * Start ambulance approaching
   */
  startAmbulanceApproach() {
    this.gameState.startAmbulanceRoute();
    this.ambulance.setAttribute('visible', true);
    
    const config = GAME_CONFIG.positions;
    this.ambulance.setAttribute('animation__toward', 
      `property: position; from: ${config.ambulanceStart.x} ${config.ambulanceStart.y} ${config.ambulanceStart.z}; to: ${config.ambulanceMiddle.x} ${config.ambulanceMiddle.y} ${config.ambulanceMiddle.z}; dur: ${GAME_CONFIG.animations.ambulanceTowardDuration}; easing: linear`
    );
  }

  /**
   * Complete ambulance arrival
   */
  completeAmbulanceArrival() {
    if (!this.gameState.isAmbulanceEnRoute() || this.gameState.isAmbulanceArriving()) {
      return;
    }
    
    this.gameState.startAmbulanceArrival();
    this.ambulance.removeAttribute('animation__toward');
    
    const current = this.ambulance.getAttribute('position');
    const config = GAME_CONFIG.positions;
    const fromStr = `${current.x} ${current.y} ${current.z}`;
    
    this.ambulance.setAttribute('animation__arrive', 
      `property: position; from: ${fromStr}; to: ${config.ambulanceFinal.x} ${config.ambulanceFinal.y} ${config.ambulanceFinal.z}; dur: ${GAME_CONFIG.animations.ambulanceArriveDuration}; easing: linear`
    );
    
    setTimeout(() => {
      this.ambulance.removeAttribute('animation__arrive');
      this.ambulance.setAttribute('position', `${config.ambulanceFinal.x} ${config.ambulanceFinal.y} ${config.ambulanceFinal.z}`);
      this.medicSequence();
    }, GAME_CONFIG.animations.ambulanceArriveDuration + 200);
  }

  /**
   * Animate medics arriving and taking patient
   */
  medicSequence() {
    this.medic1.setAttribute('visible', true);
    this.medic2.setAttribute('visible', true);
    
    // Walk to patient
    this.medic1.setAttribute('animation__walk', 
      `property: position; to: 0.6 0 0.6; dur: ${GAME_CONFIG.animations.medicWalkDuration}; easing: easeInOutQuad`
    );
    this.medic2.setAttribute('animation__walk', 
      `property: position; to: -0.6 0 0.6; dur: ${GAME_CONFIG.animations.medicWalkDuration}; easing: easeInOutQuad`
    );
    
    setTimeout(() => {
      this.medic1.removeAttribute('animation__walk');
      this.medic2.removeAttribute('animation__walk');
      
      // Lift person
      this.person.setAttribute('animation__lift', 
        `property: position; to: 0 0 0.6; dur: ${GAME_CONFIG.animations.personLiftDuration}; easing: easeOutQuad`
      );
      
      setTimeout(() => {
        this.person.removeAttribute('animation__lift');
        
        // Carry to ambulance
        this.medic1.setAttribute('animation__carry', 
          `property: position; to: 0.6 0 3; dur: ${GAME_CONFIG.animations.carryDuration}; easing: linear`
        );
        this.medic2.setAttribute('animation__carry', 
          `property: position; to: -0.6 0 3; dur: ${GAME_CONFIG.animations.carryDuration}; easing: linear`
        );
        this.person.setAttribute('animation__tow', 
          `property: position; to: 0 0 3; dur: ${GAME_CONFIG.animations.carryDuration}; easing: linear`
        );
        
        setTimeout(() => {
          // Hide after loading into ambulance
          this.person.setAttribute('visible', false);
          this.medic1.setAttribute('visible', false);
          this.medic2.setAttribute('visible', false);
          this.medic1.removeAttribute('animation__carry');
          this.medic2.removeAttribute('animation__carry');
          this.person.removeAttribute('animation__tow');
          
          // Ambulance leaves
          const config = GAME_CONFIG.positions;
          this.ambulance.setAttribute('animation__away', 
            `property: position; to: ${config.ambulanceExit.x} ${config.ambulanceExit.y} ${config.ambulanceExit.z}; dur: ${GAME_CONFIG.animations.ambulanceLeaveDuration}; easing: linear`
          );
          
          setTimeout(() => {
            if (this.onAmbulanceLeftCallback) {
              this.onAmbulanceLeftCallback();
            }
          }, GAME_CONFIG.animations.ambulanceLeaveDuration);
        }, GAME_CONFIG.animations.carryDuration + 100);
      }, GAME_CONFIG.animations.personLiftDuration + 100);
    }, GAME_CONFIG.animations.medicWalkDuration + 100);
  }

  /**
   * Drop item back to scene
   * @param {string} id - Item ID
   * @param {Object} pos - Position {x, y, z}
   */
  dropItem(id, pos) {
    const item = document.getElementById(id);
    item.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
    item.setAttribute('rotation', '0 0 0');
    item.setAttribute('scale', '1 1 1');
    this.scene.appendChild(item);
    
    if (item.components['glow']) {
      item.setAttribute('glow', { active: false });
    }
  }

  /**
   * Reset scene to initial state
   */
  resetScene() {
    const config = GAME_CONFIG.positions;
    
    // Reset car
    this.car.setAttribute('position', `${config.carStart.x} ${config.carStart.y} ${config.carStart.z}`);
    this.car.setAttribute('rotation', '0 0 0');
    this.car.removeAttribute('animation__drive');
    
    // Reset camera
    this.cameraRig.setAttribute('position', `${config.cameraSpawn.x} ${config.cameraSpawn.y} ${config.cameraSpawn.z}`);
    
    // Reset person
    this.body.setAttribute('color', GAME_CONFIG.colors.personNormal);
    this.person.setAttribute('position', `${config.personStart.x} ${config.personStart.y} ${config.personStart.z}`);
    this.person.setAttribute('rotation', '0 0 0');
    this.person.setAttribute('visible', true);
    
    // Reset wound
    this.wound.setAttribute('visible', true);
    this.wound.setAttribute('color', GAME_CONFIG.colors.woundInitial);
    this.wound.setAttribute('position', '0 0.95 0.22');
    this.wound.removeAttribute('animation__pulse');
    this.wound.removeAttribute('animation__color');
    this.wound.setAttribute('scale', '1 1 1');
    
    // Reset ambulance
    this.ambulance.setAttribute('visible', false);
    this.ambulance.setAttribute('position', `${config.ambulanceStart.x} ${config.ambulanceStart.y} ${config.ambulanceStart.z}`);
    this.ambulance.removeAttribute('animation__toward');
    this.ambulance.removeAttribute('animation__arrive');
    this.ambulance.removeAttribute('animation__away');
    
    // Reset medics
    this.medic1.setAttribute('visible', false);
    this.medic2.setAttribute('visible', false);
    this.medic1.setAttribute('position', '0.6 0 25');
    this.medic2.setAttribute('position', '-0.6 0 25');
    
    // Reset EHBO
    this.ehbo.setAttribute('visible', false);
    this.ehbo.setAttribute('position', '0.8 0 1.2');
    this.ehbo.removeAttribute('animation__close');
    
    // Reset items
    this.spray.setAttribute('position', '0.4 0.2 1.4');
    this.spray.setAttribute('rotation', '0 0 0');
    this.spray.setAttribute('scale', '1 1 1');
    this.spray.setAttribute('visible', false);
    this.spray.setAttribute('glow', { active: false });
    this.scene.appendChild(this.spray);
    
    this.plaster.setAttribute('position', '1.2 0.04 1.4');
    this.plaster.setAttribute('rotation', '0 0 0');
    this.plaster.setAttribute('scale', '1 1 1');
    this.plaster.setAttribute('visible', false);
    this.plaster.setAttribute('glow', { active: false });
    this.scene.appendChild(this.plaster);
    
    this.sprayLabel.setAttribute('visible', false);
    this.plasterLabel.setAttribute('visible', false);
    
    // Reset gaze targets
    this.lookLeft.setAttribute('visible', true);
    this.lookLeft.setAttribute('color', GAME_CONFIG.colors.gazeNormal);
    this.lookLeft.setAttribute('scale', '1 1 1');
    this.lookLeft.setAttribute('position', '-1.2 1.6 6.6');
    
    this.lookRight.setAttribute('visible', true);
    this.lookRight.setAttribute('color', GAME_CONFIG.colors.gazeNormal);
    this.lookRight.setAttribute('scale', '1 1 1');
    this.lookRight.setAttribute('position', '1.2 1.6 6.6');
    
    this.lookHint.setAttribute('visible', true);
    this.lookHint.setAttribute('position', '0 2 6.6');
    
    // Reset triangle
    this.triangle.setAttribute('visible', false);
    this.triangle.removeAttribute('animation');
  }

  /**
   * Set callback for when ambulance leaves
   * @param {Function} callback
   */
  onAmbulanceLeft(callback) {
    this.onAmbulanceLeftCallback = callback;
  }

  /**
   * Mark person as saved
   */
  markPersonSaved() {
    this.body.setAttribute('color', GAME_CONFIG.colors.personSaved);
    this.body.setAttribute('position', '0 0.6 0');
  }
}

export default SceneManager;
