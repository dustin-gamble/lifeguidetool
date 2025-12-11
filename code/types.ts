
export interface CalculatorInputs {
  flightMode: 'multicopter' | 'fixedWing';
  cruiseMotorCount: number;
  wingArea: number;
  cruiseSpeed: number;
  batteryCells: number;
  batteryCapacity: number;
  batteryCrating: number;
  motorKV: number;
  motorResistance: number;
  motorNoLoadCurrent: number;
  motorCurrentLimit: number;
  propDiameter: number;
  propPitch: number;
  propBlades: number;
  weight: number;
  motorCount: number;
}

export interface PerformanceDataPoint {
  throttle: number; // 0-100
  voltage: number;
  current: number; // Amps per motor
  rpm: number;
  thrust: number; // Grams per motor
  power: number; // Watts per motor
  efficiency: number; // g/W
}

export interface CalculatorOutputs {
  batteryVoltage: number;
  maxDischargeCurrent: number;
  hoverThrust: number;
  performanceData: PerformanceDataPoint[];
  flightTime: number; // minutes
  thrustToWeight: number;
  warnings: string[];
  // Fixed Wing specific outputs
  cruiseTime: number;
  cruiseCurrent: number;
  cruisePower: number;
  cruiseThrottle: number;
}

export interface InputRange {
  min: number;
  max: number;
  step: number;
}

export interface InputRanges {
  [key: string]: InputRange;
}
