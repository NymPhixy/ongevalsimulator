#bfc9cf" rotation="0 0 0"></a-box> <!-- curb left -->
<a-box position="2 0.06 -10" width="8" depth="0.3" height="0.12" color="#bfc9cf" rotation="0 0 0"></a-box> <!-- curb right -->
<a-plane rotation="-90 0 0" width="40" height="40" color="#7ec850" position="0 0 -18"></a-plane> <!-- grass background -->
<a-entity position="0 0.01 -1">
<a-text value="STOP" color="white" align="center" position="0 0.1 0" scale="2 2 2"></a-text> <!-- road marking -->
</a-entity>

Make sure to replace `path/to/road_texture.jpg` and `path/to/sidewalk_texture.jpg` with the actual paths to your texture images. You can find free textures online or create your own to enhance the visual appeal of your simulation.

# Ongeval Simulatie — Installatie

Korte stappen om het project lokaal te draaien (Windows).

Vereisten

- Node.js (LTS) en npm geïnstalleerd (controle: `node -v` en `npm -v`).

Installatie

1. Open PowerShell en ga naar de gewenste map:
   cd /d d:\aframe-ongeval-simulatie

2. Installeer dependencies:
   npm install

Development server starten

- Start dev-server:
  npm run dev

- Open in browser:
  start http://localhost:5173

Alternatief (indien geen dev-script)

- Gebruik een eenvoudige static server:
  npx http-server ./public -p 5173
  start http://localhost:5173

Gebruiksaanwijzing

- Na laden: klik op "Start" in de overlay om het scenario te starten.
- Gebruik WASD of je VR-controller/teleport om naar het slachtoffer te lopen.
- Gebruik de Reset-knop om opnieuw te beginnen.

Assets

- Voeg extra afbeeldingen/textures toe in `public/assets` en pas paden in `public/index.html` aan.

Troubleshooting

- Als `npm install` faalt: verwijder `node_modules` en `package-lock.json`, run `npm install` opnieuw.
- Poort in gebruik? Kies een andere poort in het http-server commando of stop het proces dat de poort gebruikt.
- Als de pagina niet ververst: refresh browser of stop en herstart de dev-server (Ctrl+C).

Build (optioneel)

- Als er een build-script aanwezig is, gebruik:
  npm run build
  Controleer `package.json` voor beschikbare scripts.

Contact

- Bij vragen: open een issue in je repository of plak hier de foutmelding uit de terminal.
