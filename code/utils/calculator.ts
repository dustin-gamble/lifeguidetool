
import { CalculatorInputs, CalculatorOutputs, PerformanceDataPoint } from '../types.ts';

const AIR_DENSITY = 1.225; // kg/m^3
const LI_PO_NOMINAL_VOLTAGE = 3.7;
const LIFT_TO_DRAG_RATIO = 10; // Assumed L/D for a typical model
const VTOL_DURATION_MIN = 1; // 30s takeoff, 30s landing
const DRIVETRAIN_EFFICIENCY_CRUISE = 0.65; // Overall efficiency from battery to propulsive power in cruise

function calculateThrust(rpm: number, diameter: number, pitch: number, blades: number): number {
  const propConst = 1.2;
  const thrustN = propConst * AIR_DENSITY * Math.pow(rpm / 60, 2) * Math.pow(diameter * 0.0254, 4);
  const thrustG = thrustN * 101.97;
  return thrustG * (pitch / 6) * (blades / 2);
}

function calculatePowerForRpm(rpm: number, diameter: number, pitch: number): number {
    const k = 5.3e-15;
    return k * Math.pow(rpm, 3) * Math.pow(diameter, 4) * (pitch / 6);
}

export function calculatePerformance(inputs: CalculatorInputs): CalculatorOutputs {
  const warnings: string[] = [];
  const batteryVoltage = inputs.batteryCells * LI_PO_NOMINAL_VOLTAGE;
  const maxDischargeCurrent = (inputs.batteryCapacity / 1000) * inputs.batteryCrating;
  const hoverThrust = inputs.weight > 0 && inputs.motorCount > 0 ? inputs.weight / inputs.motorCount : 0;

  const performanceData: PerformanceDataPoint[] = [];
  let hoverThrottle = 0;
  let hoverCurrent = 0;

  for (let throttle = 5; throttle <= 100; throttle += 5) {
    const throttleRatio = throttle / 100;
    const appliedVoltage = batteryVoltage * throttleRatio;
    const estimatedPower = calculatePowerForRpm(inputs.motorKV * appliedVoltage * 0.8, inputs.propDiameter, inputs.propPitch);
    const estimatedCurrent = (appliedVoltage > 0 ? estimatedPower / appliedVoltage : 0) + inputs.motorNoLoadCurrent;
    const totalResistance = (inputs.motorResistance / 1000);
    const voltageDrop = estimatedCurrent * totalResistance;
    const effectiveVoltage = appliedVoltage - voltageDrop;
    const rpm = inputs.motorKV * effectiveVoltage;
    const thrust = calculateThrust(rpm, inputs.propDiameter, inputs.propPitch, inputs.propBlades);
    const power = effectiveVoltage * estimatedCurrent;
    const efficiency = power > 0 ? thrust / power : 0;

    if (rpm > 0) {
        performanceData.push({ throttle, voltage: effectiveVoltage, current: estimatedCurrent, rpm, thrust, power, efficiency });
    }
    if (hoverThrottle === 0 && thrust >= hoverThrust) {
        hoverThrottle = throttle;
        hoverCurrent = estimatedCurrent;
    }
  }

  if (hoverThrottle === 0 && performanceData.length > 0 && hoverThrust > 0) {
    hoverThrottle = 100;
    hoverCurrent = performanceData[performanceData.length - 1].current;
    warnings.push("Hover throttle is over 100%. The aircraft may not be able to lift off.");
  } else if (hoverThrottle < 20 && hoverThrust > 0) {
    warnings.push("Hover throttle is very low. The aircraft might be overpowered and twitchy.");
  } else if (hoverThrottle > 80 && hoverThrust > 0) {
    warnings.push("Hover throttle is high. The aircraft might be underpowered.");
  }

  const totalHoverCurrent = hoverCurrent * inputs.motorCount;
  const maxThrust = performanceData.length > 0 ? performanceData[performanceData.length - 1].thrust : 0;
  const totalMaxThrust = maxThrust * inputs.motorCount;
  const thrustToWeight = inputs.weight > 0 ? totalMaxThrust / inputs.weight : 0;
  const maxCurrentPerMotor = performanceData.length > 0 ? performanceData[performanceData.length - 1].current : 0;
  
  if (maxCurrentPerMotor > inputs.motorCurrentLimit) {
    warnings.push(`Max current per motor (${maxCurrentPerMotor.toFixed(1)}A) exceeds motor's limit (${inputs.motorCurrentLimit}A). Risk of overheating.`);
  }
  if (maxCurrentPerMotor * inputs.motorCount > maxDischargeCurrent) {
    warnings.push(`Total max current (${(maxCurrentPerMotor * inputs.motorCount).toFixed(1)}A) exceeds battery's max discharge rate (${maxDischargeCurrent.toFixed(1)}A).`);
  }

  let flightTime = 0;
  let cruiseTime = 0;
  let cruisePower = 0;
  let cruiseCurrent = 0;
  let cruiseThrottle = 0;

  if (inputs.flightMode === 'multicopter') {
    flightTime = totalHoverCurrent > 0 ? (inputs.batteryCapacity / 1000 / totalHoverCurrent) * 60 * 0.85 : 0;
  } else { // Fixed Wing VTOL
    const weight_N = (inputs.weight / 1000) * 9.81;
    const drag_N = weight_N / LIFT_TO_DRAG_RATIO;
    const cruiseSpeed_ms = inputs.cruiseSpeed / 3.6;
    const cruisePowerAero_W = drag_N * cruiseSpeed_ms;
    cruisePower = cruisePowerAero_W / DRIVETRAIN_EFFICIENCY_CRUISE;

    if (inputs.cruiseMotorCount > 0 && performanceData.length > 0) {
        const powerPerCruiseMotor = cruisePower / inputs.cruiseMotorCount;
        const foundCruisePoint = performanceData.reduce((prev, curr) => 
            Math.abs(curr.power - powerPerCruiseMotor) < Math.abs(prev.power - powerPerCruiseMotor) ? curr : prev
        );
        
        if (foundCruisePoint) {
            cruiseThrottle = foundCruisePoint.throttle;
            cruiseCurrent = foundCruisePoint.current * inputs.cruiseMotorCount;
            if (foundCruisePoint.current > inputs.motorCurrentLimit) {
                warnings.push(`Cruise current/motor (${foundCruisePoint.current.toFixed(1)}A) exceeds limit (${inputs.motorCurrentLimit}A). Sustained cruise will cause overheating.`);
            }
        }
        if (cruiseThrottle > 95) {
            warnings.push("Cruise throttle is near maximum. The aircraft may struggle to maintain cruise speed.");
        }
        if (cruiseThrottle < 10 && cruiseThrottle > 0) {
            warnings.push("Cruise throttle is very low. The system may be oversized for cruise flight.");
        }
    }

    const usableCapacity_Ah = (inputs.batteryCapacity / 1000) * 0.85;
    const vtolEnergy_Ah = totalHoverCurrent * (VTOL_DURATION_MIN / 60);
    
    if (totalHoverCurrent <= 0) {
        warnings.push("Could not determine hover current for VTOL phase.");
    } else if (vtolEnergy_Ah >= usableCapacity_Ah) {
        warnings.push("Not enough battery for 1 min of VTOL. Increase capacity or reduce weight.");
        flightTime = (usableCapacity_Ah / totalHoverCurrent) * 60;
    } else {
        if (inputs.cruiseMotorCount > 0 && cruiseCurrent > 0) {
            const cruiseEnergy_Ah = usableCapacity_Ah - vtolEnergy_Ah;
            const cruiseTime_h = cruiseEnergy_Ah / cruiseCurrent;
            cruiseTime = cruiseTime_h * 60;
            flightTime = cruiseTime + VTOL_DURATION_MIN;
        } else {
            flightTime = (usableCapacity_Ah / totalHoverCurrent) * 60;
            if (inputs.cruiseMotorCount === 0) {
                warnings.push("No cruise motors defined. Total flight time is calculated as pure hover time.");
            }
        }
    }
  }

  return {
    batteryVoltage,
    maxDischargeCurrent,
    hoverThrust,
    performanceData,
    flightTime,
    thrustToWeight,
    warnings,
    cruiseTime,
    cruisePower,
    cruiseCurrent,
    cruiseThrottle,
  };
}
