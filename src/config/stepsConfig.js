/**
 * Steps Configuration
 * Define all game steps, questions, and interactions here
 * This file can be edited to modify game flow without changing code
 */

export const STEPS_CONFIG = [
  {
    id: 1,
    title: "🩺 Stap 1 – Let op je eigen veiligheid",
    type: "instruction",
    content: "Situatie:\nJe ziet een voetganger op de grond liggen. Er rijden nog auto's voorbij.\n\nInteractief: Kijk eerst naar de linker en rechter marker (kijk naar de balletjes) om de weg te checken.",
    interaction: {
      type: "gaze",
      targets: ["lookLeft", "lookRight"],
      onComplete: "nextStep"
    },
    buttons: [
      {
        text: "Ik begrijp het",
        action: "startInteraction",
        style: "good"
      }
    ]
  },
  {
    id: 2,
    title: "🗣️ Stap 2 – Kijk of de persoon aanspreekbaar is",
    type: "question",
    question: "Wat is de eerste en beste actie om te controleren of iemand aanspreekbaar is?",
    choices: [
      {
        text: "A. Je vraagt rustig: \"Gaat het met u?\"",
        correct: true,
        feedback: "Juist — rustig spreken is de juiste eerste stap.",
        action: "moveBody"
      },
      {
        text: "B. Je schudt de persoon stevig aan de schouders",
        correct: false,
        feedback: "Schudden kan gevaarlijk zijn; probeer eerst verbaal contact."
      },
      {
        text: "C. Je roept in paniek om hulp",
        correct: false,
        feedback: "Paniek helpt niet; blijf rustig en controleer aanspreekbaarheid."
      }
    ]
  },
  {
    id: 3,
    title: "☎️ Stap 3 – Bel 112",
    type: "question",
    question: "Wat moet je doen zodra je vaststelt dat er mogelijk gewonden zijn?",
    choices: [
      {
        text: "A. Je belt 112 en vertelt wat er is gebeurd",
        correct: true,
        feedback: "Juist — bel 112 en geef locatie en aantal gewonden door.",
        action: "openPhone"
      },
      {
        text: "B. Je wacht even of hij zelf opstaat",
        correct: false,
        feedback: "Wachten kost waardevolle tijd; bel altijd bij mogelijk ernstig letsel."
      },
      {
        text: "C. Je zoekt iemand anders die misschien wil bellen",
        correct: false,
        feedback: "Je kunt iemand vragen, maar jij bent aanwezig — bel direct."
      }
    ]
  },
  {
    id: 4,
    title: "🧰 Stap 4 – EHBO: pak spray en pleister",
    type: "instruction",
    content: "Situatie:\nEr ligt een EHBO-doos naast het slachtoffer met een spraybus en pleister. Klik op de spullen om ze te pakken en behandel de wond terwijl de hulp onderweg is.",
    interaction: {
      type: "pickup",
      items: ["spray", "plaster"],
      sequence: true,
      onComplete: "nextStep"
    },
    buttons: [
      {
        text: "Ga naar de EHBO spullen",
        action: "showEhboItems",
        style: "good"
      },
      {
        text: "Wachten op ambulance",
        action: "gameOver",
        style: "bad",
        gameOverMessage: "Wachten kost tijd. Kleine handelingen zoals desinfecteren kunnen wél levensreddend zijn."
      }
    ]
  },
  {
    id: 5,
    title: "🚑 Ambulance onderweg",
    type: "instruction",
    content: "De ambulance is onderweg. Je hebt nu tijd om de wond te behandelen: pak de spray en daarna de pleister.",
    buttons: [
      {
        text: "Ik ga behandelen",
        action: "enableTreatment",
        style: "good"
      },
      {
        text: "Ik blijf alleen bij slachtoffer",
        action: "showFeedback",
        style: "bad",
        feedback: "❌ Niet optimaal. Gebruik beschikbare middelen om tijdelijke zorg te bieden terwijl je wacht."
      }
    ]
  },
  {
    id: 6,
    title: "❤️ Stap 6 – Blijf bij het slachtoffer",
    type: "question",
    question: "De hulpverleners zijn ter plaatse. Blijf bij het slachtoffer en geef duidelijk informatie aan hulpdiensten bij aankomst.",
    choices: [
      {
        text: "A. Je blijft erbij en praat rustig tot de hulpdiensten er zijn",
        correct: true,
        feedback: "✅ Goed!<br>Blijf bij het slachtoffer, stel hem gerust en wacht op de hulpdiensten.",
        action: "win"
      },
      {
        text: "B. Je loopt de ambulance tegemoet en laat hem even alleen",
        correct: false,
        feedback: "Laat iemand nooit alleen of bewegen als hij gewond is.",
        action: "gameOver"
      }
    ]
  }
];

/**
 * Phone Call Configuration
 */
export const PHONE_CONFIG = {
  emergency_number: "112",
  invalid_message: "112 centrale: Ongeldig nummer. Probeer opnieuw.",
  prompts: [
    {
      text: "Toets noodnummer:",
      type: "keypad"
    },
    {
      text: "112 centrale: Verbonden. Wat is uw noodmelding?",
      type: "delay",
      duration: 600
    },
    {
      text: "112 centrale: Zijn er gewonden?",
      type: "choice",
      choices: [
        {
          text: "Ja, een persoon is aangereden",
          correct: true,
          response: "112 centrale: Een ambulance wordt gestuurd.",
          action: "startAmbulance"
        },
        {
          text: "Nee, alleen blikschade",
          correct: false,
          response: "112 centrale: De centralist stuurt geen ambulance.",
          action: "retry"
        }
      ]
    }
  ]
};

/**
 * Scene Actions Configuration
 * Maps action names to scene behaviors
 */
export const ACTIONS_CONFIG = {
  moveBody: {
    target: "body",
    attribute: "position",
    value: "0 0.3 0"
  },
  showEhboItems: {
    elements: ["ehbo", "spray", "plaster", "sprayLabel", "plasterLabel"],
    attribute: "visible",
    value: true,
    additionalSetup: "makeItemsPickable"
  },
  enableTreatment: {
    action: "updateGlows"
  },
  startAmbulance: {
    action: "startAmbulanceApproach"
  }
};

export default { STEPS_CONFIG, PHONE_CONFIG, ACTIONS_CONFIG };
