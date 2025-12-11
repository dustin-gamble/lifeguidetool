
import React from 'react';
import { CalculatorInputs, CalculatorOutputs } from '../types.ts';
import Gauge from './Gauge.tsx';
import ResultCard from './ResultCard.tsx';
import { AlertTriangleIcon, ClockIcon, ZapIcon, ChevronsUpIcon, WingIcon, ThrottleIcon } from './Icons.tsx';

interface ResultsSectionProps {
  results: CalculatorOutputs;
  inputs: CalculatorInputs;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ results, inputs }) => {
  const hoverData = results.performanceData.find(p => p.thrust >= results.hoverThrust);
  const maxData = results.performanceData[results.performanceData.length - 1];

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-3">Performance Analysis</h2>

      {/* Key Metrics Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Gauge 
          value={hoverData?.throttle || 0} 
          label="Hover/VTOL Throttle" 
          unit="%" 
          max={100}
          colorStops={[
            { stop: 40, color: 'text-green-400' },
            { stop: 60, color: 'text-yellow-400' },
            { stop: 100, color: 'text-red-400' },
          ]}
        />
        <Gauge 
          value={results.thrustToWeight} 
          label="Vertical T/W Ratio" 
          unit="" 
          max={Math.max(5, Math.ceil(results.thrustToWeight))}
          colorStops={[
            { stop: 1.8, color: 'text-red-400' },
            { stop: 2.5, color: 'text-yellow-400' },
            { stop: 10, color: 'text-green-400' },
          ]}
        />
        <Gauge 
          value={results.flightTime} 
          label="Est. Flight Time" 
          unit="min" 
          max={Math.max(30, Math.ceil(results.flightTime))}
          colorStops={[
            { stop: 5, color: 'text-red-400' },
            { stop: 10, color: 'text-yellow-400' },
            { stop: 30, color: 'text-green-400' },
          ]}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {inputs.flightMode === 'fixedWing' ? (
          <>
            <ResultCard icon={<WingIcon />} label="Cruise Time" value={`${results.cruiseTime.toFixed(1)} min`} />
            <ResultCard icon={<ThrottleIcon />} label="Cruise Throttle" value={`${results.cruiseThrottle.toFixed(0)} %`} />
            <ResultCard icon={<ZapIcon />} label="Cruise Power" value={`${results.cruisePower.toFixed(0)} W`} />
            <ResultCard icon={<ZapIcon className="text-yellow-400"/>} label="Cruise Current" value={`${results.cruiseCurrent.toFixed(1)} A`} />
          </>
        ) : (
          <>
            <ResultCard icon={<ZapIcon />} label="Total Max Power" value={`${((maxData?.power || 0) * inputs.motorCount).toFixed(0)} W`} />
            <ResultCard icon={<ChevronsUpIcon />} label="Total Max Thrust" value={`${((maxData?.thrust || 0) * inputs.motorCount).toFixed(0)} g`} />
            <ResultCard icon={<ZapIcon className="text-yellow-400"/>} label="Hover Current" value={`${((hoverData?.current || 0) * inputs.motorCount).toFixed(1)} A`} />
            <ResultCard icon={<ClockIcon />} label="Battery Voltage" value={`${results.batteryVoltage.toFixed(1)} V`} />
          </>
        )}
      </div>

      {/* Warnings */}
      {results.warnings.length > 0 && (
        <div className="mb-6 bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg" role="alert">
          <div className="flex">
            <div className="py-1"><AlertTriangleIcon className="h-6 w-6 text-yellow-400 mr-4"/></div>
            <div>
              <p className="font-bold">System Warnings</p>
              <ul className="mt-1 list-disc list-inside text-sm">
                {results.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Performance Table */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">
          {inputs.flightMode === 'fixedWing' ? 'Vertical Take-off/Landing Performance' : 'Throttle Performance Data'}
        </h3>
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-sm text-left text-slate-400">
            <thead className="text-xs text-slate-300 uppercase bg-slate-700/50">
              <tr>
                <th scope="col" className="px-4 py-3">Throttle</th>
                <th scope="col" className="px-4 py-3">Amps/Motor</th>
                <th scope="col" className="px-4 py-3">RPM</th>
                <th scope="col" className="px-4 py-3">Thrust/Motor (g)</th>
                <th scope="col" className="px-4 py-3">Total Thrust (g)</th>
                <th scope="col" className="px-4 py-3">Efficiency (g/W)</th>
              </tr>
            </thead>
            <tbody>
              {results.performanceData.map((p) => {
                const isOverCurrent = p.current > inputs.motorCurrentLimit;
                const isHover = p.throttle === hoverData?.throttle;
                
                let rowClass = 'border-b border-slate-700 transition-colors';
                if (isOverCurrent) {
                  rowClass += ' bg-red-900/50 hover:bg-red-800/50 text-red-300';
                } else if (isHover) {
                  rowClass += ' bg-sky-900/50';
                } else {
                  rowClass += ' hover:bg-slate-700/30';
                }

                return (
                  <tr key={p.throttle} className={rowClass}>
                    <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">
                      {p.throttle}% 
                      {isHover && <span className="text-sky-400 text-xs ml-1">(Hover)</span>}
                      {isOverCurrent && <span className="text-red-400 text-xs ml-1">(Over Limit)</span>}
                    </th>
                    <td className="px-4 py-3">{p.current.toFixed(1)}</td>
                    <td className="px-4 py-3">{Math.round(p.rpm).toLocaleString()}</td>
                    <td className="px-4 py-3">{Math.round(p.thrust)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">{Math.round(p.thrust * inputs.motorCount).toLocaleString()}</td>
                    <td className="px-4 py-3">{p.efficiency.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
