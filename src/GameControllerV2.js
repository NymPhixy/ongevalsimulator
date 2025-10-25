/**
 * Configuration-Driven Game Controller
 * Uses STEPS_CONFIG to drive the game flow
 */

import { GameState } from './managers/GameState.js';
import { UIManager } from './managers/UIManager.js';
import { PhoneManager } from './managers/PhoneManager.js';
import { SceneManager } from './managers/SceneManager.js';
import { GAME_CONFIG } from './config/gameConfig.js';
import { STEPS_CONFIG, ACTIONS_CONFIG } from './config/stepsConfig.js';
import { registerCollisionCheck } from './components/collisionCheck.js';
import { registerGazeTrigger } from './components/gazeTrigger.js';
import { registerGlow } from './components/glow.js';
import { registerPickable } from './components/pickable.js';

export class GameController {
  constructor() {
    this.gameState = new GameState();
    this.uiManager = new UIManager(this.gameState);
    this.phoneManager = new PhoneManager(this.gameState);
    this.sceneManager = new SceneManager(this.gameState);
    this.stepsConfig = STEPS_CONFIG;
    
    this.initializeComponents();
    this.setupEventHandlers();
  }

  initializeComponents() {
    registerCollisionCheck(AFRAME, this.gameState, () => this.handleCrash());
    registerGazeTrigger(AFRAME, this.gameState, () => this.nextStep());
    registerGlow(AFRAME);
    registerPickable(AFRAME, this.gameState, (itemId) => this.handleItemPickup(itemId));
    
    const person = document.getElementById('person');
    if (person) {
      person.addEventListener('click', () => this.handlePersonClick());
    }
  }

  setupEventHandlers() {
    this.uiManager.onReset(() => this.reset());
    this.uiManager.onReadQuestion(() => this.readQuestion());
    this.phoneManager.onComplete(() => this.handlePhoneComplete());
    this.phoneManager.onReset(() => this.reset());
    this.sceneManager.onAmbulanceLeft(() => this.nextStep());
  }

  handleCrash() {
    this.sceneManager.triggerCrashImpact();
    setTimeout(() => this.nextStep(), 1000);
  }

  handleItemPickup(itemId) {
    const itemName = itemId === 'spray' ? 'spraybus' : 'pleister';
    this.uiManager.showFeedback(
      `Je hebt de ${itemName} gepakt. Klik op het slachtoffer om het te gebruiken.`,
      true,
      () => {}
    );
  }

  handlePersonClick() {
    const step = this.gameState.getCurrentStep();
    if (step < 4) return;
    
    const heldItem = this.gameState.getHeldItem();
    if (!heldItem) return;
    
    if (heldItem === 'spray') {
      this.handleSprayUse();
    } else if (heldItem === 'plaster') {
      this.handlePlasterUse();
    }
  }

  handleSprayUse() {
    if (!this.gameState.isWoundDisinfected()) {
      this.sceneManager.disinfectWound();
      this.sceneManager.dropItem('spray', { x: 0.4, y: 0.2, z: 1.4 });
      this.gameState.releaseItem();
      
      this.uiManager.showFeedback('✅ Wond gedesinfecteerd met spray.', true, () => {
        this.sceneManager.updateGlows();
      });
    } else {
      this.uiManager.showFeedback('De wond is al gedesinfecteerd.', true, () => {});
    }
  }

  handlePlasterUse() {
    if (!this.gameState.isWoundDisinfected()) {
      this.uiManager.showFeedback(
        '❌ Eerst desinfecteren! Gebruik eerst de spray.',
        false
      );
      return;
    }
    
    if (!this.gameState.isPlasterApplied()) {
      this.sceneManager.applyPlaster();
      this.sceneManager.dropItem('plaster', { x: 1.2, y: 0.04, z: 1.4 });
      this.gameState.releaseItem();
      
      this.uiManager.showFeedback(
        '✅ Pleister aangebracht. De ambulance zal nu volledig arriveren.',
        true,
        () => {
          const plaster = document.getElementById('plaster');
          if (plaster && plaster.components['glow']) {
            plaster.setAttribute('glow', { active: false });
          }
          
          this.sceneManager.hideEhboBox();
          
          setTimeout(() => {
            this.sceneManager.completeAmbulanceArrival();
            setTimeout(() => this.nextStep(), 50);
          }, 900);
        }
      );
    } else {
      this.uiManager.showFeedback('Pleister al aangebracht.', true, () => {});
    }
  }

  handlePhoneComplete() {
    this.sceneManager.startAmbulanceApproach();
    setTimeout(() => this.nextStep(), 50);
  }

  /**
   * Execute an action based on configuration
   */
  executeAction(actionName) {
    const actions = {
      nextStep: () => this.nextStep(),
      moveBody: () => {
        const body = document.getElementById('body');
        if (body) body.setAttribute('position', '0 0.3 0');
        this.nextStep();
      },
      openPhone: () => this.phoneManager.open(),
      showEhboItems: () => {
        this.uiManager.hidePanel();
        this.sceneManager.showEhboItems();
        this.sceneManager.updateGlows();
      },
      enableTreatment: () => {
        this.uiManager.hidePanel();
        this.sceneManager.updateGlows();
      },
      startInteraction: () => {
        this.uiManager.hidePanel();
        const lookLeft = document.getElementById('lookLeft');
        const lookRight = document.getElementById('lookRight');
        if (lookLeft) lookLeft.setAttribute('visible', true);
        if (lookRight) lookRight.setAttribute('visible', true);
        if (lookLeft) lookLeft.setAttribute('gaze-trigger', { id: 'left' });
        if (lookRight) lookRight.setAttribute('gaze-trigger', { id: 'right' });
      },
      win: () => this.win(),
      gameOver: (message) => this.uiManager.gameOver(message)
    };

    const action = actions[actionName];
    if (action) {
      action();
    } else {
      console.warn(`Action ${actionName} not found`);
    }
  }

  /**
   * Advance to next step using configuration
   */
  nextStep() {
    const stepIndex = this.gameState.nextStep() - 1;
    const stepConfig = this.stepsConfig[stepIndex];
    
    if (!stepConfig) {
      console.warn(`No configuration for step ${stepIndex + 1}`);
      return;
    }
    
    this.showStep(stepConfig);
  }

  /**
   * Show a step based on configuration
   */
  showStep(stepConfig) {
    if (stepConfig.type === 'question') {
      this.showQuestionStep(stepConfig);
    } else if (stepConfig.type === 'instruction') {
      this.showInstructionStep(stepConfig);
    }
  }

  /**
   * Show question-type step
   */
  showQuestionStep(config) {
    const choices = config.choices.map(choice => ({
      text: choice.text,
      correct: choice.correct,
      feedback: choice.feedback,
      next: () => {
        if (choice.action) {
          this.executeAction(choice.action);
        }
      }
    }));
    
    this.uiManager.showQuestion(
      `<strong>${config.title}</strong><br><br>${config.question}`,
      choices
    );
  }

  /**
   * Show instruction-type step
   */
  showInstructionStep(config) {
    const buttons = config.buttons.map(btn => ({
      text: btn.text,
      good: btn.style === 'good',
      action: () => {
        if (btn.action === 'gameOver' && btn.gameOverMessage) {
          this.uiManager.gameOver(btn.gameOverMessage);
        } else if (btn.action) {
          this.executeAction(btn.action);
        }
      }
    }));
    
    this.uiManager.showPanel(
      `<strong>${config.title}</strong><br><br>${config.content}`,
      buttons
    );
  }

  win() {
    this.sceneManager.markPersonSaved();
    this.uiManager.win();
  }

  readQuestion() {
    if (this.uiManager.isPanelVisible()) {
      this.uiManager.hidePanel();
      return;
    }
    
    const currentStepIndex = this.gameState.getCurrentStep();
    const stepConfig = this.stepsConfig[currentStepIndex];
    
    if (stepConfig) {
      const message = `<strong>${stepConfig.title}</strong><br>${stepConfig.content || stepConfig.question || 'Volg de instructies'}`;
      this.uiManager.showPanel(message, [{
        text: 'Sluiten',
        good: true,
        action: () => this.uiManager.hidePanel()
      }]);
    } else {
      this.uiManager.showPanel(
        '<strong>Informatie</strong><br>Volg de instructies op het scherm.',
        [{
          text: 'Sluiten',
          good: true,
          action: () => this.uiManager.hidePanel()
        }]
      );
    }
  }

  reset() {
    this.gameState.reset();
    this.sceneManager.resetScene();
    this.uiManager.hidePanel();
    this.phoneManager.close();
    
    this.uiManager.showPanel(
      '<strong>Klaar?</strong><br><br>Het scenario start. Volg de instructies.',
      [{
        text: 'Start',
        good: true,
        action: () => {
          this.uiManager.hidePanel();
          this.sceneManager.startCrash();
        }
      }]
    );
  }

  start() {
    this.reset();
  }
}

export default GameController;
