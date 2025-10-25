/**
 * UIManager
 * Handles all UI interactions including panels, messages, and buttons
 */

export class UIManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.initializeElements();
  }

  initializeElements() {
    this.panel = document.getElementById('panel');
    this.ui = document.getElementById('ui');
    this.message = document.getElementById('message');
    this.resetBtn = document.getElementById('reset');
    this.readQuestionBtn = document.getElementById('readQuestion');
    
    // Verify elements exist
    if (!this.panel || !this.ui || !this.message) {
      console.error('❌ UI elements not found!', {
        panel: !!this.panel,
        ui: !!this.ui,
        message: !!this.message
      });
    } else {
      console.log('✅ UI elements initialized');
    }
  }

  /**
   * Show a panel with message and action buttons
   * @param {string} html - HTML content to display
   * @param {Array} options - Array of button options
   */
  showPanel(html, options = []) {
    console.log('📋 Showing panel:', html.substring(0, 50) + '...', 'buttons:', options.length);
    
    if (!this.message || !this.ui || !this.panel) {
      console.error('❌ Cannot show panel - elements missing');
      return;
    }
    
    this.message.innerHTML = html;
    this.ui.innerHTML = '';
    
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt.text;
      btn.className = 'btn ' + (opt.good ? 'btn-ok' : 'btn-bad');
      btn.onclick = opt.action;
      btn.setAttribute('aria-label', opt.text);
      this.ui.appendChild(btn);
    });
    
    this.panel.style.display = 'block';
    console.log('✅ Panel displayed');
    
    // Focus first button for accessibility
    const firstButton = this.ui.querySelector('button');
    if (firstButton) {
      setTimeout(() => firstButton.focus(), 100);
    }
  }

  /**
   * Show feedback message with single action button
   * @param {string} text - Feedback text
   * @param {boolean} isGood - Whether feedback is positive
   * @param {Function} next - Next action callback
   */
  showFeedback(text, isGood, next) {
    this.message.innerHTML = text;
    this.ui.innerHTML = '';
    
    const btn = document.createElement('button');
    btn.textContent = isGood ? 'Verder' : 'Opnieuw proberen';
    btn.className = 'btn ' + (isGood ? 'btn-ok' : 'btn-bad');
    btn.onclick = () => {
      this.hidePanel();
      if (isGood && typeof next === 'function') {
        next();
      }
      if (!isGood && this.resetCallback) {
        this.resetCallback();
      }
    };
    
    this.ui.appendChild(btn);
    this.panel.style.display = 'block';
    
    setTimeout(() => btn.focus(), 100);
  }

  /**
   * Show a question with multiple choice answers
   * @param {string} html - Question HTML
   * @param {Array} choices - Array of choice objects
   */
  showQuestion(html, choices = []) {
    this.message.innerHTML = html;
    this.ui.innerHTML = '';
    
    choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.textContent = choice.text;
      btn.className = 'btn btn-neutral';
      btn.onclick = () => this.evaluateAnswer(choice);
      btn.setAttribute('aria-label', `Option ${index + 1}: ${choice.text}`);
      this.ui.appendChild(btn);
    });
    
    this.panel.style.display = 'block';
    
    const firstButton = this.ui.querySelector('button');
    if (firstButton) {
      setTimeout(() => firstButton.focus(), 100);
    }
  }

  /**
   * Evaluate the selected answer
   * @param {Object} choice - The selected choice object
   */
  evaluateAnswer(choice) {
    this.hidePanel();
    
    if (choice.correct) {
      this.showFeedback('✅ ' + (choice.feedback || 'Goed gedaan.'), true, () => {
        if (typeof choice.next === 'function') {
          choice.next();
        }
      });
    } else {
      this.showFeedback('❌ ' + (choice.feedback || 'Dit is niet de beste keuze.'), false, () => {
        if (choice.retry === true && typeof choice.repeat === 'function') {
          this.hidePanel();
          choice.repeat();
        } else if (typeof choice.next === 'function') {
          choice.next();
        }
      });
    }
  }

  hidePanel() {
    this.panel.style.display = 'none';
  }

  isPanelVisible() {
    return this.panel.style.display === 'block';
  }

  /**
   * Register reset callback
   * @param {Function} callback - Reset function
   */
  onReset(callback) {
    this.resetCallback = callback;
    this.resetBtn.onclick = callback;
  }

  /**
   * Register read question callback
   * @param {Function} callback - Read question function
   */
  onReadQuestion(callback) {
    this.readQuestionBtn.addEventListener('click', callback);
  }

  /**
   * Show game over screen
   * @param {string} text - Game over message
   */
  gameOver(text) {
    this.showPanel(
      '<strong>GAME OVER</strong><br><br>' + text,
      [{
        text: 'Opnieuw proberen',
        good: true,
        action: () => this.resetCallback && this.resetCallback()
      }]
    );
  }

  /**
   * Show win screen
   */
  win() {
    this.showPanel(
      '<strong>Goed gedaan!</strong><br><br>Je hebt de juiste stappen gevolgd en het slachtoffer ondersteund tot de hulpdiensten er waren.',
      [{
        text: 'Opnieuw spelen',
        good: true,
        action: () => this.resetCallback && this.resetCallback()
      }]
    );
  }
}

export default UIManager;
