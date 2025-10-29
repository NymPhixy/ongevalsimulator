/**
 * Project entrypoint for Vite build
 * Moved from public/main.js so Vite processes module imports during build
 */

import "./styles/main.css";
import { GameController } from "./GameController.js";

// The rest of this file is the same as the previous public/main.js logic,
// but imports are relative to src/ so Vite will bundle them correctly.

console.log("📦 src/main.js loaded, waiting for AFRAME...");

function waitForAFrame() {
  return new Promise((resolve) => {
    if (window.AFRAME) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.AFRAME) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    }
  });
}

waitForAFrame().then(() => {
  console.log("✅ AFRAME loaded, initializing game controller early...");

  const game = new GameController();
  window.gameController = game;

  const scene = document.querySelector("a-scene");

  if (scene) {
    scene.addEventListener("loaded", () => {
      console.log("🎮 A-Frame scene loaded successfully");
      game.start();
      console.log("✅ Game started");
    });
  } else {
    console.error("❌ A-Frame scene not found!");
  }

  let toast = null;

  function showVrMessage(message, autoHide = true) {
    try {
      if (
        window.gameController &&
        window.gameController.uiManager &&
        typeof window.gameController.uiManager.showFeedback === "function"
      ) {
        // Prefer using the app's UI manager when available
        try {
          window.gameController.uiManager.showFeedback(message);
        } catch (e) {
          console.warn("UIManager.showFeedback failed", e);
        }
        if (autoHide) {
          setTimeout(() => {
            try {
              if (window.gameController.uiManager.hideFeedback)
                window.gameController.uiManager.hideFeedback();
            } catch (e) {}
          }, 4200);
        }
        return;
      }
    } catch (e) {
      console.warn("showVrMessage ui manager check failed", e);
    }

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "vrToast";
      toast.style.position = "fixed";
      toast.style.left = "50%";
      toast.style.top = "14px";
      toast.style.transform = "translateX(-50%)";
      toast.style.background = "rgba(0,0,0,0.85)";
      toast.style.color = "#fff";
      toast.style.padding = "10px 14px";
      toast.style.borderRadius = "6px";
      toast.style.zIndex = 2000;
      toast.style.fontFamily = "sans-serif";
      toast.style.fontSize = "13px";
      toast.style.maxWidth = "min(90vw,520px)";
      toast.style.textAlign = "center";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.display = "block";
    if (toast._hideTimer) clearTimeout(toast._hideTimer);
    if (autoHide) {
      toast._hideTimer = setTimeout(() => {
        try {
          toast.style.display = "none";
        } catch (e) {}
      }, 4200);
    }
  }

  const vrBtn = document.getElementById("enterVR");

  if (vrBtn) {
    vrBtn.addEventListener("click", async () => {
      console.log("🔘 enterVR button clicked");

      if (window.__xrRequestInProgress) {
        console.log("⏳ XR request already in progress, ignoring click");
        return;
      }

      try {
        const rendererSession =
          scene &&
          scene.renderer &&
          scene.renderer.xr &&
          typeof scene.renderer.xr.getSession === "function"
            ? scene.renderer.xr.getSession()
            : null;
        console.log(
          "main.js: existing renderer.xr.getSession() ->",
          rendererSession
        );
        if (rendererSession) {
          console.log(
            "ℹ️ Renderer already has an active XRSession — skipping request"
          );
          showVrMessage("VR-sessie is al actief.");
          return;
        }
      } catch (e) {
        console.warn("main.js: error checking renderer.xr.getSession()", e);
      }

      try {
        const gps = navigator.getGamepads ? navigator.getGamepads() : [];
        const ids = Array.from(gps || [])
          .map((g) => (g && g.id ? g.id : null))
          .filter(Boolean);
        console.log("main.js: connected gamepad ids ->", ids);
      } catch (e) {
        console.warn("main.js: error reading gamepads", e);
      }

      window.__xrRequestInProgress = true;
      vrBtn.disabled = true;
      try {
        if (
          !navigator.xr ||
          typeof navigator.xr.isSessionSupported !== "function"
        ) {
          console.warn("WebXR not available in this browser");
          showVrMessage("WebXR niet beschikbaar in deze browser.");
          return;
        }

        const supported = await navigator.xr.isSessionSupported("immersive-vr");
        console.log(
          "navigator.xr.isSessionSupported(immersive-vr) ->",
          supported
        );
        if (!supported) {
          showVrMessage(
            "Immersive VR niet ondersteund door dit apparaat/browser."
          );
          return;
        }

        const sessionOptionsList = [
          {
            optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"],
          },
          { optionalFeatures: ["local-floor", "bounded-floor"] },
          {},
        ];

        let session = null;
        for (const opts of sessionOptionsList) {
          try {
            console.log("➡️ Requesting XR session with options:", opts);
            session = await navigator.xr.requestSession("immersive-vr", opts);
            console.log("✅ XR session created with options:", opts);
            break;
          } catch (reqErr) {
            const name = reqErr && reqErr.name;
            const msg = reqErr && reqErr.message;
            console.warn(
              "XR requestSession failed for options",
              opts,
              name,
              msg
            );
            if (msg && /already an existing immersive session/i.test(msg)) {
              console.log(
                "ℹ️ Runtime reports an existing immersive session — attempting to let A-Frame attach via scene.enterVR()"
              );
              if (scene && typeof scene.enterVR === "function") {
                try {
                  scene.enterVR();
                  console.log(
                    "✅ Called scene.enterVR() as fallback to attach to existing session"
                  );
                } catch (e) {
                  console.warn("scene.enterVR() fallback failed", e);
                }
              }
              break;
            }
          }
        }

        if (!session) {
          console.error("❌ All XR session requests failed");
          showVrMessage("Kon geen VR-sessie starten op dit apparaat.");
          return;
        }

        if (
          scene &&
          scene.renderer &&
          scene.renderer.xr &&
          typeof scene.renderer.xr.setSession === "function"
        ) {
          try {
            await scene.renderer.xr.setSession(session);
            console.log("✅ XR session attached to renderer");
          } catch (setErr) {
            console.warn(
              "Could not attach XR session immediately, will attach on renderstart",
              setErr
            );
            scene.addEventListener(
              "renderstart",
              () => {
                try {
                  scene.renderer.xr.setSession(session);
                } catch (e) {
                  console.error("setSession failed on renderstart", e);
                }
              },
              { once: true }
            );
          }
        } else if (scene) {
          scene.addEventListener(
            "renderstart",
            () => {
              try {
                scene.renderer.xr.setSession(session);
              } catch (e) {
                console.error("setSession failed on renderstart", e);
              }
            },
            { once: true }
          );
        }

        try {
          session.addEventListener("end", () => {
            console.log("ℹ️ XR session ended");
            window.__xrRequestInProgress = false;
            vrBtn.disabled = false;
          });
        } catch (e) {
          console.warn("Could not attach end listener to session", e);
          setTimeout(() => {
            window.__xrRequestInProgress = false;
            vrBtn.disabled = false;
          }, 2000);
        }
      } catch (err) {
        console.error("Error while trying to enter VR:", err);
        showVrMessage(
          "Fout bij starten VR: " + (err && err.message ? err.message : err)
        );
      } finally {
        if (window.__xrRequestInProgress) {
          window.__xrRequestInProgress = false;
          vrBtn.disabled = false;
        }
      }
    });
  }

  try {
    const showDebug =
      location.search.indexOf("debug=1") !== -1 ||
      /netlify/i.test(location.hostname);
    if (showDebug) {
      const dbg = document.createElement("div");
      dbg.id = "debugOverlay";
      dbg.style.position = "fixed";
      dbg.style.left = "12px";
      dbg.style.bottom = "12px";
      dbg.style.zIndex = 1000;
      dbg.style.background = "rgba(0,0,0,0.6)";
      dbg.style.color = "#fff";
      dbg.style.padding = "8px 10px";
      dbg.style.fontFamily = "monospace";
      dbg.style.fontSize = "12px";
      dbg.style.borderRadius = "8px";
      dbg.style.maxWidth = "320px";
      dbg.style.whiteSpace = "pre-wrap";
      dbg.textContent = "Debug: initializing...";
      document.body.appendChild(dbg);

      const update = () => {
        const car = document.getElementById("car");
        const person = document.getElementById("person");
        const gs =
          window.gameController && window.gameController.gameState
            ? window.gameController.gameState
            : null;
        let carPos = "?",
          personPos = "?",
          dist = "?";
        if (car) {
          const p = car.getAttribute("position");
          carPos = `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`;
        }
        if (person) {
          const p2 = person.getAttribute("position");
          personPos = `${p2.x.toFixed(2)}, ${p2.y.toFixed(2)}, ${p2.z.toFixed(
            2
          )}`;
        }
        if (car && person) {
          const dx =
            car.getAttribute("position").x - person.getAttribute("position").x;
          const dz =
            car.getAttribute("position").z - person.getAttribute("position").z;
          dist = Math.sqrt(dx * dx + dz * dz).toFixed(3);
        }

        dbg.textContent =
          `car: ${carPos}\nperson: ${personPos}\ndistance: ${dist}\n` +
          `carMoving: ${gs ? !!gs.carMoving : "n/a"}\ncrashed: ${
            gs ? !!gs.crashed : "n/a"
          }`;
      };

      setInterval(update, 350);
      setTimeout(update, 500);
    }
  } catch (err) {
    console.warn("Debug overlay error", err);
  }
});
