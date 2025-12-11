
import React, { useState, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { CalculatorInputs, CalculatorOutputs, InputRanges } from './types.ts';
import { DEFAULT_INPUTS, DEFAULT_RANGES } from './constants.ts';
import { calculatePerformance } from './utils/calculator.ts';
import Header from './components/Header.tsx';
import InputSection from './components/InputSection.tsx';
// Fix: Corrected the import path for the SliderField component. The file is named InputField.tsx.
import SliderField from './components/InputField.tsx';
import ResultsSection from './components/ResultsSection.tsx';
import RangeSettingsModal from './components/RangeSettingsModal.tsx';
import { BatteryIcon, CogIcon, FanIcon, PlaneIcon, SparklesIcon, WingIcon } from './components/Icons.tsx';

// Ensure the API key is available from environment variables
const API_KEY = process.env.API_KEY;

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [ranges, setRanges] = useState<InputRanges>(DEFAULT_RANGES);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargets, setModalTargets] = useState<string[]>([]);

  const results: CalculatorOutputs = useMemo(() => calculatePerformance(inputs), [inputs]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);
    
    setInputs(prev => {
      const newInputs = {
        ...prev,
        [name]: isNaN(parsedValue) ? value : parsedValue,
      };
      // Ensure cruiseMotorCount does not exceed motorCount
      if (name === 'motorCount' && newInputs.cruiseMotorCount > newInputs.motorCount) {
        newInputs.cruiseMotorCount = newInputs.motorCount;
      }
      return newInputs;
    });
  }, []);

  const handleModeChange = (mode: 'multicopter' | 'fixedWing') => {
    setInputs(prev => ({ ...prev, flightMode: mode }));
  };

  const handleRangeSave = useCallback((newRanges: Partial<InputRanges>) => {
    setRanges(prev => ({ ...prev, ...newRanges }));
  }, []);

  const openRangeModal = useCallback((targets: string[]) => {
    setModalTargets(targets);
    setIsModalOpen(true);
  }, []);

  const handleAISuggestion = async () => {
    if (!API_KEY) {
      setAiError("API key is not configured. Cannot use AI features.");
      return;
    }
    setIsSuggesting(true);
    setAiError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY, vertexai: true });
      const prompt = `I am building a model aircraft with a total weight of ${inputs.weight}g. I am using a ${inputs.batteryCells}S LiPo battery. I want a balance of good flight time and performance. Suggest a suitable motor KV rating, propeller diameter (in inches), and propeller pitch (in inches).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [{ text: prompt }] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              motorKV: { type: Type.INTEGER, description: 'Motor KV rating (e.g., 900)' },
              propDiameter: { type: Type.NUMBER, description: 'Propeller diameter in inches (e.g., 10)' },
              propPitch: { type: Type.NUMBER, description: 'Propeller pitch in inches (e.g., 4.5)' },
            },
            required: ['motorKV', 'propDiameter', 'propPitch'],
          },
        },
      });

      const suggestedConfig = JSON.parse(response.text);
      
      setInputs(prev => ({
        ...prev,
        motorKV: suggestedConfig.motorKV,
        propDiameter: suggestedConfig.propDiameter,
        propPitch: suggestedConfig.propPitch,
      }));

    } catch (error) {
      console.error("AI Suggestion Error:", error);
      setAiError("Failed to get AI suggestion. Please try again.");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Header />
          <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* MODE SWITCHER */}
              <div className="bg-slate-800 rounded-lg p-1 flex space-x-1">
                <button onClick={() => handleModeChange('multicopter')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${inputs.flightMode === 'multicopter' ? 'bg-sky-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-700'}`}>Multicopter</button>
                <button onClick={() => handleModeChange('fixedWing')} className={`w-full py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${inputs.flightMode === 'fixedWing' ? 'bg-sky-600 text-white' : 'bg-transparent text-slate-300 hover:bg-slate-700'}`}>Fixed Wing VTOL</button>
              </div>

              {/* INPUTS */}
              {inputs.flightMode === 'fixedWing' && (
                <InputSection 
                  title="Wing & Cruise" 
                  icon={<WingIcon />}
                  onSettingsClick={() => openRangeModal(['wingArea', 'cruiseSpeed', 'cruiseMotorCount'])}
                >
                  <SliderField label="Wing Area" name="wingArea" value={inputs.wingArea} onChange={handleInputChange} {...ranges.wingArea} unit="dm²" />
                  <SliderField label="Cruise Speed" name="cruiseSpeed" value={inputs.cruiseSpeed} onChange={handleInputChange} {...ranges.cruiseSpeed} unit="km/h" />
                  <SliderField label="Number of Cruise Motors" name="cruiseMotorCount" value={inputs.cruiseMotorCount} onChange={handleInputChange} {...ranges.cruiseMotorCount} max={inputs.motorCount} />
                </InputSection>
              )}

              <InputSection 
                title="Power System" 
                icon={<BatteryIcon />}
                onSettingsClick={() => openRangeModal(['batteryCells', 'batteryCapacity', 'batteryCrating'])}
              >
                <SliderField label="Battery Cells" name="batteryCells" value={inputs.batteryCells} onChange={handleInputChange} {...ranges.batteryCells} unit="S" />
                <SliderField label="Capacity" name="batteryCapacity" value={inputs.batteryCapacity} onChange={handleInputChange} {...ranges.batteryCapacity} unit="mAh" />
                <SliderField label="Discharge" name="batteryCrating" value={inputs.batteryCrating} onChange={handleInputChange} {...ranges.batteryCrating} unit="C" />
              </InputSection>

              <InputSection 
                title="Motor" 
                icon={<CogIcon />}
                onSettingsClick={() => openRangeModal(['motorKV', 'motorResistance', 'motorNoLoadCurrent', 'motorCurrentLimit'])}
              >
                <SliderField label="Motor KV" name="motorKV" value={inputs.motorKV} onChange={handleInputChange} {...ranges.motorKV} unit="rpm/V" />
                <SliderField label="Resistance" name="motorResistance" value={inputs.motorResistance} onChange={handleInputChange} {...ranges.motorResistance} unit="mΩ" />
                <SliderField label="No-Load Current" name="motorNoLoadCurrent" value={inputs.motorNoLoadCurrent} onChange={handleInputChange} {...ranges.motorNoLoadCurrent} unit="A" />
                <SliderField label="Current Limit" name="motorCurrentLimit" value={inputs.motorCurrentLimit} onChange={handleInputChange} {...ranges.motorCurrentLimit} unit="A" />
              </InputSection>

              <InputSection 
                title="Propeller" 
                icon={<FanIcon />}
                onSettingsClick={() => openRangeModal(['propDiameter', 'propPitch', 'propBlades'])}
              >
                <SliderField label="Diameter" name="propDiameter" value={inputs.propDiameter} onChange={handleInputChange} {...ranges.propDiameter} unit="inch" />
                <SliderField label="Pitch" name="propPitch" value={inputs.propPitch} onChange={handleInputChange} {...ranges.propPitch} unit="inch" />
                <SliderField label="Number of Blades" name="propBlades" value={inputs.propBlades} onChange={handleInputChange} {...ranges.propBlades} />
              </InputSection>

              <InputSection 
                title="Airframe" 
                icon={<PlaneIcon />}
                onSettingsClick={() => openRangeModal(['weight', 'motorCount'])}
              >
                <SliderField label="Total Weight" name="weight" value={inputs.weight} onChange={handleInputChange} {...ranges.weight} unit="g" />
                <SliderField label="Number of Motors" name="motorCount" value={inputs.motorCount} onChange={handleInputChange} {...ranges.motorCount} />
              </InputSection>
              
              <div className="bg-slate-800 rounded-lg p-4 shadow-lg">
                <h3 className="text-lg font-semibold text-sky-400 flex items-center gap-2 mb-3">
                  <SparklesIcon />
                  AI Component Suggester
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Fill in your aircraft weight and battery, then let AI suggest a motor & prop combo.
                </p>
                <button
                  onClick={handleAISuggestion}
                  disabled={isSuggesting || inputs.flightMode === 'fixedWing'}
                  className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2"
                  aria-label="Get AI component suggestions"
                >
                  {isSuggesting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    "Suggest Components"
                  )}
                </button>
                {aiError && <p className="text-red-400 text-sm mt-3 text-center">{aiError}</p>}
                {inputs.flightMode === 'fixedWing' && <p className="text-xs text-slate-500 mt-2 text-center">AI Suggester is for multicopter mode only.</p>}
              </div>
            </div>

            <div className="lg:col-span-2">
              {/* RESULTS */}
              <ResultsSection results={results} inputs={inputs} />
            </div>
          </main>
        </div>
      </div>
      <RangeSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleRangeSave}
        targets={modalTargets}
        currentRanges={ranges}
      />
    </>
  );
};

export default App;
