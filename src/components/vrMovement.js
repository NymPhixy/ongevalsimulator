/**
 * vrMovement A-Frame component
 * - When in WebXR, reads controller/gamepad thumbstick axes and moves #cameraRig
 * - Applies device tuning (deadzone and max speed) for Oculus Quest 1 and a default for others
 *
 * Simple, self-contained: during init it will attach itself to #cameraRig if used as a scene-level
 * registration (we also allow adding the component directly to the rig via markup).
 */

AFRAME.registerComponent("vr-movement", {
  schema: {
    // max speed in meters per second (default for non-Quest)
    maxSpeed: { type: "number", default: 1.0 },
    // deadzone for thumbstick
    deadzone: { type: "number", default: 0.15 },
  },

  init() {
    // target rig (cameraRig by convention)
    this.rig = document.getElementById("cameraRig") || this.el;

    // ensure we have an object3D to move
    if (!this.rig) {
      console.warn(
        "vr-movement: #cameraRig not found; component will try to attach to element it is on."
      );
      this.rig = this.el;
    }

    // device tuning state
    this.tuning = {
      deadzone: this.data.deadzone,
      maxSpeed: this.data.maxSpeed,
    };

    this.lastTime = null;
    this.tempVec = new THREE.Vector3();
    this.forward = new THREE.Vector3();
    this.right = new THREE.Vector3();
  },

  tick(time, delta) {
    // Only run when in VR presenting
    const scene = this.el.sceneEl;
    if (!scene || !scene.is("vr-mode")) return;

    // delta in seconds
    const dt = (delta || 16) / 1000;

    // read gamepads and find the first that looks like a controller with axes
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gps) return;

    let found = false;
    for (let i = 0; i < gps.length; i++) {
      const gp = gps[i];
      if (!gp || !gp.axes || gp.axes.length === 0) continue;

      // set tuning based on id if not yet tuned or if id contains Oculus
      if (gp.id && /oculus/i.test(gp.id)) {
        // Oculus Quest 1 tuning: slightly larger deadzone and lower max speed for comfort
        this.tuning.deadzone = Math.max(this.tuning.deadzone, 0.2);
        this.tuning.maxSpeed = Math.min(this.tuning.maxSpeed, 0.9);
      } else {
        // defaults for other controllers
        this.tuning.deadzone = this.data.deadzone;
        this.tuning.maxSpeed = this.data.maxSpeed;
      }

      // axes mapping may vary; try to pick the common forward axis
      // Many controllers put x,y on axes[0],axes[1] for left stick and axes[2],axes[3] for right.
      // We'll try to prefer axes[2/3] but fallback to 0/1 when necessary.
      const axes = gp.axes;
      let strafe = 0,
        forward = 0;
      if (
        axes.length >= 4 &&
        (Math.abs(axes[2]) > 0.001 || Math.abs(axes[3]) > 0.001)
      ) {
        // use right-hand stick mapping
        strafe = axes[2];
        forward = axes[3];
      } else if (axes.length >= 2) {
        // use primary stick
        strafe = axes[0];
        forward = axes[1];
      }

      // apply deadzone
      if (Math.abs(forward) < this.tuning.deadzone) forward = 0;
      if (Math.abs(strafe) < this.tuning.deadzone) strafe = 0;

      // if nothing to do, continue to next gamepad
      if (forward === 0 && strafe === 0) continue;

      // movement magnitude
      const speedForward = -forward * this.tuning.maxSpeed; // invert if stick forward is negative
      const speedRight = strafe * this.tuning.maxSpeed;

      // get camera world direction (where the HMD is facing)
      const camera =
        this.rig.querySelector("[camera]") ||
        this.rig.querySelector("a-camera");
      const camObj = camera ? camera.object3D : null;
      if (!camObj) continue;

      camObj.getWorldDirection(this.forward);
      // forward is pointing out of camera; keep only XZ plane
      this.forward.y = 0;
      this.forward.normalize();

      // right vector
      this.right
        .crossVectors(this.forward, new THREE.Vector3(0, 1, 0))
        .normalize();

      // compute delta movement
      this.tempVec.set(0, 0, 0);
      this.tempVec.addScaledVector(this.forward, speedForward * dt);
      this.tempVec.addScaledVector(this.right, speedRight * dt);

      // apply to rig position
      const pos = this.rig.object3D.position;
      pos.add(this.tempVec);

      found = true;
      // break after handling first relevant controller
      break;
    }

    if (!found) {
      // no controller input detected — nothing to do
    }
  },
});
