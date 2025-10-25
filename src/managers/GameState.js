/**
 * GameState Manager
 * Manages the current state of the simulation
 */

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.step = 0;
    this.crashed = false;
    this.carMoving = false;
    this.ehboPicked = false;
    this.woundDisinfected = false;
    this.plasterApplied = false;
    this.lookedLeft = false;
    this.lookedRight = false;
    this.gazeCheckCompleted = false;
    this.heldItem = null; // 'spray' or 'plaster'
    this.ambulanceEnRoute = false;
    this.ambulanceArriving = false;
  }

  nextStep() {
    this.step++;
    return this.step;
  }

  getCurrentStep() {
    return this.step;
  }

  setCarMoving(moving) {
    this.carMoving = moving;
  }

  setCrashed(crashed) {
    this.crashed = crashed;
  }

  setLookedLeft(looked) {
    this.lookedLeft = looked;
  }

  setLookedRight(looked) {
    this.lookedRight = looked;
  }

  hasLookedBothWays() {
    return this.lookedLeft && this.lookedRight && !this.gazeCheckCompleted;
  }
  
  completeGazeCheck() {
    this.gazeCheckCompleted = true;
  }

  pickupEhbo() {
    this.ehboPicked = true;
  }

  disinfectWound() {
    this.woundDisinfected = true;
  }

  applyPlaster() {
    this.plasterApplied = true;
  }

  holdItem(item) {
    this.heldItem = item;
  }

  releaseItem() {
    this.heldItem = null;
  }

  getHeldItem() {
    return this.heldItem;
  }

  isWoundDisinfected() {
    return this.woundDisinfected;
  }

  isPlasterApplied() {
    return this.plasterApplied;
  }

  startAmbulanceRoute() {
    this.ambulanceEnRoute = true;
  }

  startAmbulanceArrival() {
    this.ambulanceArriving = true;
  }

  isAmbulanceEnRoute() {
    return this.ambulanceEnRoute;
  }

  isAmbulanceArriving() {
    return this.ambulanceArriving;
  }
}

export default GameState;
