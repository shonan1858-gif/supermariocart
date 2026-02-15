export const GAME_CONSTANTS = {
  physics: {
    fixedTimeStep: 1 / 60,
    maxSubSteps: 3,
    gravity: 9.82,
  },
  vehicle: {
    maxSpeed: 38,
    engineForceMax: 2200,
    brakeForce: 30,
    steerLow: 0.6,
    steerHigh: 0.25,
    offroadEngineFactor: 0.7,
    offroadMaxSpeedFactor: 0.8,
  },
  drift: {
    minSpeed: 8,
    minSteer: 0.2,
    chargeK: 0.35,
    stage1: 18,
    stage2: 38,
    stage3: 62,
    boosts: {
      1: { duration: 0.6, power: 1.15 },
      2: { duration: 0.9, power: 1.25 },
      3: { duration: 1.2, power: 1.35 },
    },
  },
  antiGravity: {
    alignSharpness: 12,
    spinBoostDuration: 0.35,
  },
  item: {
    starDuration: 5,
  },
} as const;
