/**
 * Game Configuration
 * Centralized configuration for the accident simulation
 */

export const GAME_CONFIG = {
  // Animation durations (in milliseconds)
  animations: {
    carDriveDuration: 3800,
    fallDuration: 700,
    ambulanceTowardDuration: 9000,
    ambulanceArriveDuration: 7000,
    medicWalkDuration: 1600,
    personLiftDuration: 600,
    carryDuration: 2000,
    ambulanceLeaveDuration: 4000,
  },

  // Positions
  positions: {
    carStart: { x: 0, y: 0, z: -25 },
    carEnd: { x: 0, y: 0, z: -0.6 },
    ambulanceStart: { x: 0, y: 0, z: 25 },
    ambulanceMiddle: { x: 0, y: 0, z: 12 },
    ambulanceFinal: { x: 0, y: 0, z: 3 },
    ambulanceExit: { x: 0, y: 0, z: 40 },
    personStart: { x: 0, y: 0, z: 0 },
    personFall: { x: 0, y: 0.15, z: -0.4 },
    cameraSpawn: { x: 0, y: 0, z: 6 },
  },

  // Colors
  colors: {
    personNormal: '#e0a66f',
    personInjured: '#7f8c8d',
    personSaved: '#2ecc71',
    woundInitial: '#c0392b',
    woundDisinfected: '#e67e22',
    gazeNormal: '#ffd166',
    gazeCompleted: '#9ae6b4',
  },

  // Collision detection
  collision: {
    detectionDistance: 1.2,
  },

  // UI text content
  messages: {
    step1: {
      title: '🩺 Stap 1 – Let op je eigen veiligheid',
      content: 'Situatie:\nJe ziet een voetganger op de grond liggen. Er rijden nog auto\'s voorbij.\n\nInteractief: Kijk eerst naar de linker en rechter marker (kijk naar de balletjes) om de weg te checken.',
    },
    step2: {
      title: '🗣️ Stap 2 – Kijk of de persoon aanspreekbaar is',
      question: 'Wat is de eerste en beste actie om te controleren of iemand aanspreekbaar is?',
    },
    step3: {
      title: '☎️ Stap 3 – Bel 112',
      question: 'Wat moet je doen zodra je vaststelt dat er mogelijk gewonden zijn?',
    },
    step4: {
      title: '🧰 Stap 4 – EHBO: pak spray en pleister',
      content: 'Situatie:\nEr ligt een EHBO-doos naast het slachtoffer met een spraybus en pleister. Klik op de spullen om ze te pakken en behandel de wond terwijl de hulp onderweg is.',
    },
    step5: {
      title: '🚑 Ambulance onderweg',
      content: 'De ambulance is onderweg. Je hebt nu tijd om de wond te behandelen: pak de spray en daarna de pleister.',
    },
    step6: {
      title: '❤️ Stap 6 – Blijf bij het slachtoffer',
      content: 'De hulpverleners zijn ter plaatse. Blijf bij het slachtoffer en geef duidelijk informatie aan hulpdiensten bij aankomst.',
    },
  },
};

export default GAME_CONFIG;
