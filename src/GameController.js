/**
 * Main Game Controller
 * Orchestrates all game components and manages the game flow
 */

import { GameState } from './managers/GameState.js';
import { UIManager } from './managers/UIManager.js';
import { PhoneManager } from './managers/PhoneManager.js';
import { SceneManager } from './managers/SceneManager.js';
import { GAME_CONFIG } from './config/gameConfig.js';
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
    
    this.initializeComponents();
    this.setupEventHandlers();
  }

  /**
   * Initialize A-Frame components
   */
  initializeComponents() {
    console.log('🔧 Initializing A-Frame components...');
    // Register custom A-Frame components
    registerCollisionCheck(this.gameState, () => this.handleCrash());
    registerGazeTrigger(this.gameState, () => this.nextStep());
    registerGlow();
    registerPickable(this.gameState, (itemId) => this.handleItemPickup(itemId));
    console.log('✅ All components registered');
    
    // Setup person click handler for applying items
    const person = document.getElementById('person');
    if (person) {
      person.addEventListener('click', () => this.handlePersonClick());
    }
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.uiManager.onReset(() => this.reset());
    this.uiManager.onReadQuestion(() => this.readQuestion());
    this.phoneManager.onComplete(() => this.handlePhoneComplete());
    this.phoneManager.onReset(() => this.reset());
    this.sceneManager.onAmbulanceLeft(() => this.nextStep());
  }

  /**
   * Handle crash event
   */
  handleCrash() {
    console.log('💥 Crash detected!');
    this.sceneManager.triggerCrashImpact();
    setTimeout(() => {
      console.log('⏭️ Moving to next step after crash...');
      this.nextStep();
    }, 1000);
  }

  /**
   * Handle item pickup
   * @param {string} itemId - ID of picked up item
   */
  handleItemPickup(itemId) {
    const itemName = itemId === 'spray' ? 'spraybus' : 'pleister';
    this.uiManager.showFeedback(
      `Je hebt de ${itemName} gepakt. Klik op het slachtoffer om het te gebruiken.`,
      true,
      () => {}
    );
  }

  /**
   * Handle clicking on person to apply held item
   */
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

  /**
   * Handle spray usage
   */
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

  /**
   * Handle plaster usage
   */
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

  /**
   * Handle phone call completion
   */
  handlePhoneComplete() {
    this.sceneManager.startAmbulanceApproach();
    setTimeout(() => this.nextStep(), 50);
  }

  /**
   * Advance to next step
   */
  nextStep() {
    const step = this.gameState.nextStep();
    console.log(`📍 Next step: ${step}`);
    
    switch(step) {
      case 1:
        console.log('🎯 Showing step 1 - Safety check');
        this.showStep1();
        break;
      case 2:
        console.log('🎯 Showing step 2 - Check responsiveness');
        this.showStep2();
        break;
      case 3:
        console.log('🎯 Showing step 3 - Call 112');
        this.showStep3();
        break;
      case 4:
        console.log('🎯 Showing step 4 - First aid');
        this.showStep4();
        break;
      case 5:
        console.log('🎯 Showing step 5 - Ambulance');
        this.showStep5();
        break;
      case 6:
        console.log('🎯 Showing step 6 - Stay with victim');
        this.showStep6();
        break;
      default:
        console.log('⚠️ Unknown step:', step);
        break;
    }
  }

  /**
   * Show step 1: Safety check
   */
  showStep1() {
    console.log('🎯 Showing step 1: Safety check');
    const msg = GAME_CONFIG.messages.step1;
    this.uiManager.showPanel(
      `<strong>${msg.title}</strong><br><br>${msg.content}`,
      [{
        text: 'Ik begrijp het',
        good: true,
        action: () => {
          console.log('📍 User clicked "Ik begrijp het", setting up gaze markers...');
          this.uiManager.hidePanel();
          const lookLeft = document.getElementById('lookLeft');
          const lookRight = document.getElementById('lookRight');
          const lookHint = document.getElementById('lookHint');
          console.log('🔍 Found markers:', { lookLeft: !!lookLeft, lookRight: !!lookRight, lookHint: !!lookHint });
          lookLeft.setAttribute('visible', true);
          lookRight.setAttribute('visible', true);
          if (lookHint) lookHint.setAttribute('visible', true);
          lookLeft.setAttribute('gaze-trigger', { id: 'left' });
          lookRight.setAttribute('gaze-trigger', { id: 'right' });
          console.log('✅ Gaze markers setup complete');
        }
      }]
    );
  }

  /**
   * Show step 2: Check responsiveness
   */
  showStep2() {
    const msg = GAME_CONFIG.messages.step2;
    this.uiManager.showQuestion(
      `<strong>${msg.title}</strong><br><br>${msg.question}`,
      [
        {
          text: 'A. Je vraagt rustig: "Gaat het met u?"',
          correct: true,
          feedback: 'Juist — rustig spreken is de juiste eerste stap.',
          next: () => {
            const body = document.getElementById('body');
            if (body) body.setAttribute('position', '0 0.3 0');
            this.nextStep();
          }
        },
        {
          text: 'B. Je schudt de persoon stevig aan de schouders',
          correct: false,
          feedback: 'Schudden kan gevaarlijk zijn; probeer eerst verbaal contact.'
        },
        {
          text: 'C. Je roept in paniek om hulp',
          correct: false,
          feedback: 'Paniek helpt niet; blijf rustig en controleer aanspreekbaarheid.'
        }
      ]
    );
  }

  /**
   * Show step 3: Call 112
   */
  showStep3() {
    const msg = GAME_CONFIG.messages.step3;
    this.uiManager.showQuestion(
      `<strong>${msg.title}</strong><br><br>${msg.question}`,
      [
        {
          text: 'A. Je belt 112 en vertelt wat er is gebeurd',
          correct: true,
          feedback: 'Juist — bel 112 en geef locatie en aantal gewonden door.',
          next: () => this.phoneManager.open()
        },
        {
          text: 'B. Je wacht even of hij zelf opstaat',
          correct: false,
          feedback: 'Wachten kost waardevolle tijd; bel altijd bij mogelijk ernstig letsel.'
        },
        {
          text: 'C. Je zoekt iemand anders die misschien wil bellen',
          correct: false,
          feedback: 'Je kunt iemand vragen, maar jij bent aanwezig — bel direct.'
        }
      ]
    );
  }

  /**
   * Show step 4: First aid
   */
  showStep4() {
    const msg = GAME_CONFIG.messages.step4;
    this.uiManager.showPanel(
      `<strong>${msg.title}</strong><br><br>${msg.content}`,
      [
        {
          text: 'Ga naar de EHBO spullen',
          good: true,
          action: () => {
            this.uiManager.hidePanel();
            this.sceneManager.showEhboItems();
            this.sceneManager.updateGlows();
          }
        },
        {
          text: 'Wachten op ambulance',
          good: false,
          action: () => {
            this.uiManager.gameOver(
              'Wachten kost tijd. Kleine handelingen zoals desinfecteren kunnen wél levensreddend zijn.'
            );
          }
        }
      ]
    );
  }

  /**
   * Show step 5: Ambulance en route
   */
  showStep5() {
    const msg = GAME_CONFIG.messages.step5;
    this.uiManager.showPanel(
      `<strong>${msg.title}</strong><br><br>${msg.content}`,
      [
        {
          text: 'Ik ga behandelen',
          good: true,
          action: () => {
            this.uiManager.hidePanel();
            this.sceneManager.updateGlows();
          }
        },
        {
          text: 'Ik blijf alleen bij slachtoffer',
          good: false,
          action: () => {
            this.uiManager.showFeedback(
              '❌ Niet optimaal. Gebruik beschikbare middelen om tijdelijke zorg te bieden terwijl je wacht.',
              false
            );
          }
        }
      ]
    );
  }

  /**
   * Show step 6: Stay with victim
   */
  showStep6() {
    const msg = GAME_CONFIG.messages.step6;
    this.uiManager.showPanel(
      `<strong>${msg.title}</strong><br><br>${msg.content}`,
      [
        {
          text: 'A. Je blijft erbij en praat rustig tot de hulpdiensten er zijn',
          good: true,
          action: () => {
            this.uiManager.showFeedback(
              '✅ Goed!<br>Blijf bij het slachtoffer, stel hem gerust en wacht op de hulpdiensten.',
              true,
              () => this.win()
            );
          }
        },
        {
          text: 'B. Je loopt de ambulance tegemoet en laat hem even alleen',
          good: false,
          action: () => {
            this.uiManager.gameOver(
              'Laat iemand nooit alleen of bewegen als hij gewond is.'
            );
          }
        }
      ]
    );
  }

  /**
   * Handle win condition
   */
  win() {
    this.sceneManager.markPersonSaved();
    this.uiManager.win();
  }

  /**
   * Read current question/info
   */
  readQuestion() {
    if (this.uiManager.isPanelVisible()) {
      this.uiManager.hidePanel();
      return;
    }
    
    const step = this.gameState.getCurrentStep();
    
    const messages = {
      0: '<strong>Stap 1</strong><br>Kijk links en rechts naar de markers om te checken of het veilig is.',
      1: '<strong>Stap 1 (gaze)</strong><br>Kijk naar de balletjes links en rechts voordat je naar het slachtoffer gaat.',
      2: '<strong>Stap 2</strong><br>Kijk of het slachtoffer aanspreekbaar is.',
      3: '<strong>Stap 3</strong><br>Bel 112 en geef locatie en aantal gewonden door.',
      4: '<strong>EHBO</strong><br>Pak beschikbare items (spray en pleister) van de EHBO-doos naast het slachtoffer. Gebruik spray eerst, daarna pleister.',
      5: '<strong>EHBO</strong><br>Pak beschikbare items (spray en pleister) van de EHBO-doos naast het slachtoffer. Gebruik spray eerst, daarna pleister.',
      default: '<strong>Informatie</strong><br>Volg de instructies op het scherm.'
    };
    
    const message = messages[step] || messages.default;
    
    this.uiManager.showPanel(message, [{
      text: 'Sluiten',
      good: true,
      action: () => this.uiManager.hidePanel()
    }]);
  }

  /**
   * Reset the game
   */
  reset() {
    console.log('🔄 Resetting game...');
    console.log('UIManager exists?', !!this.uiManager);
    console.log('UIManager.showPanel exists?', !!this.uiManager?.showPanel);
    
    this.gameState.reset();
    this.sceneManager.resetScene();
    this.uiManager.hidePanel();
    this.phoneManager.close();
    
    console.log('🎯 Showing start panel...');
    try {
      this.uiManager.showPanel(
        '<strong>Klaar?</strong><br><br>Het scenario start. Volg de instructies.',
        [{
          text: 'Start',
          good: true,
          action: () => {
            console.log('▶️ Starting crash sequence...');
            this.uiManager.hidePanel();
            this.sceneManager.startCrash();
          }
        }]
      );
      console.log('✅ showPanel called successfully');
    } catch (error) {
      console.error('❌ Error calling showPanel:', error);
    }
  }

  /**
   * Initialize and start the game
   */
  start() {
    // Give DOM a moment to be ready
    setTimeout(() => {
      console.log('🎬 Starting game sequence...');
      this.reset();
    }, 100);
  }
}

export default GameController;
