
import { CalculatorInputs, InputRanges } from './types.ts';

export const DEFAULT_INPUTS: CalculatorInputs = {
  flightMode: 'multicopter',
  cruiseMotorCount: 1,
  wingArea: 30, // dm^2
  cruiseSpeed: 60, // km/h
  batteryCells: 4,
  batteryCapacity: 5000,
  batteryCrating: 50,
  motorKV: 920,
  motorResistance: 80, // in mOhms
  motorNoLoadCurrent: 0.9,
  motorCurrentLimit: 30,
  propDiameter: 10,
  propPitch: 4.5,
  propBlades: 2,
  weight: 1500,
  motorCount: 4,
};

export const DEFAULT_RANGES: InputRanges = {
  cruiseMotorCount: { min: 0, max: 8, step: 1 },
  wingArea: { min: 10, max: 150, step: 1 },
  cruiseSpeed: { min: 20, max: 200, step: 1 },
  batteryCells: { min: 1, max: 12, step: 1 },
  batteryCapacity: { min: 100, max: 10000, step: 50 },
  batteryCrating: { min: 10, max: 150, step: 5 },
  motorKV: { min: 100, max: 4000, step: 10 },
  motorResistance: { min: 1, max: 200, step: 1 },
  motorNoLoadCurrent: { min: 0.1, max: 5, step: 0.1 },
  motorCurrentLimit: { min: 5, max: 100, step: 1 },
  propDiameter: { min: 2, max: 20, step: 0.5 },
  propPitch: { min: 2, max: 12, step: 0.1 },
  propBlades: { min: 2, max: 4, step: 1 },
  weight: { min: 50, max: 5000, step: 10 },
  motorCount: { min: 1, max: 8, step: 1 },
};
