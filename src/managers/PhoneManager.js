/**
 * PhoneManager
 * Handles the phone interface for calling 112
 */

export class PhoneManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.phone = document.getElementById('phone');
    this.phoneScreen = document.getElementById('phoneScreen');
    this.phoneChoices = document.getElementById('phoneChoices');
    this.onCompleteCallback = null;
  }

  /**
   * Open the phone interface
   */
  open() {
    this.phone.style.display = 'flex';
    this.showKeypad();
  }

  /**
   * Close the phone interface
   */
  close() {
    this.phone.style.display = 'none';
  }

  /**
   * Show the keypad for dialing
   */
  showKeypad() {
    this.phoneScreen.textContent = "Toets noodnummer:";
    this.phoneChoices.innerHTML = '';

    // Display number line
    const numLine = document.createElement('div');
    numLine.id = 'phoneNumber';
    numLine.style.fontSize = '28px';
    numLine.style.textAlign = 'center';
    numLine.style.padding = '6px 0 12px 0';
    numLine.textContent = '';
    this.phoneChoices.appendChild(numLine);

    // Keypad
    const keypad = document.createElement('div');
    keypad.style.display = 'grid';
    keypad.style.gridTemplateColumns = 'repeat(3, 1fr)';
    keypad.style.gap = '8px';
    keypad.style.marginBottom = '10px';
    
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    digits.forEach(d => {
      const btn = document.createElement('button');
      btn.textContent = d;
      btn.className = 'phone-btn phone-good';
      btn.style.padding = '12px 6px';
      btn.setAttribute('aria-label', `Digit ${d}`);
      btn.onclick = () => {
        numLine.textContent = (numLine.textContent + d).slice(0, 6); // max length
      };
      keypad.appendChild(btn);
    });
    this.phoneChoices.appendChild(keypad);

    // Controls row: clear, call, close
    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '8px';
    
    const clearBtn = this.createButton('Clear', 'phone-btn phone-bad', () => {
      numLine.textContent = '';
    });
    
    const callBtn = this.createButton('Bellen', 'phone-btn phone-good', () => {
      const number = numLine.textContent;
      if (number === '112') {
        this.showEmergencyResponse();
      } else {
        this.phoneScreen.textContent = '112 centrale: Ongeldig nummer. Probeer opnieuw.';
        setTimeout(() => {
          this.phoneScreen.textContent = "Toets noodnummer:";
          numLine.textContent = '';
        }, 1200);
      }
    });
    
    const closeBtn = this.createButton('Sluiten', 'phone-btn', () => {
      this.close();
    });
    
    controls.appendChild(clearBtn);
    controls.appendChild(callBtn);
    controls.appendChild(closeBtn);
    this.phoneChoices.appendChild(controls);
  }

  /**
   * Show emergency response question
   */
  showEmergencyResponse() {
    this.phoneScreen.textContent = "112 centrale: Verbonden. Wat is uw noodmelding?";
    this.phoneChoices.innerHTML = '';
    
    setTimeout(() => {
      this.phoneScreen.textContent = "112 centrale: Zijn er gewonden?";
      this.phoneChoices.innerHTML = '';
      
      const yesBtn = this.createButton(
        "Ja, een persoon is aangereden",
        'phone-btn phone-good',
        () => this.handleEmergencyConfirmed()
      );
      
      const noBtn = this.createButton(
        "Nee, alleen blikschade",
        'phone-btn phone-bad',
        () => this.handleEmergencyDenied()
      );
      
      this.phoneChoices.appendChild(yesBtn);
      this.phoneChoices.appendChild(noBtn);
    }, 600);
  }

  /**
   * Handle correct emergency response
   */
  handleEmergencyConfirmed() {
    this.phoneScreen.textContent = "112 centrale: Een ambulance wordt gestuurd.";
    this.phoneChoices.innerHTML = '';
    
    setTimeout(() => {
      this.close();
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    }, 800);
  }

  /**
   * Handle incorrect emergency response
   */
  handleEmergencyDenied() {
    this.phoneScreen.textContent = "112 centrale: De centralist stuurt geen ambulance.";
    this.phoneChoices.innerHTML = '';
    
    const retryBtn = this.createButton(
      "Opnieuw proberen",
      'phone-btn phone-good',
      () => {
        this.close();
        if (this.resetCallback) {
          this.resetCallback();
        }
      }
    );
    
    this.phoneChoices.appendChild(retryBtn);
  }

  /**
   * Create a phone button
   * @param {string} text - Button text
   * @param {string} className - Button class
   * @param {Function} onClick - Click handler
   * @returns {HTMLButtonElement}
   */
  createButton(text, className, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = className;
    btn.onclick = onClick;
    btn.setAttribute('aria-label', text);
    return btn;
  }

  /**
   * Set callback for when call is complete
   * @param {Function} callback
   */
  onComplete(callback) {
    this.onCompleteCallback = callback;
  }

  /**
   * Set reset callback
   * @param {Function} callback
   */
  onReset(callback) {
    this.resetCallback = callback;
  }
}

export default PhoneManager;
