
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, ModalType, BuildChoice, TooltipData, FloatingTextData } from './types';
import { useGameState } from './hooks/useGameState';
import { useGameLoop } from './hooks/useGameLoop';
import GameCanvas from './components/GameCanvas';
import Hud from './components/Hud';
import BuildMenu from './components/BuildMenu';
import MapControls from './components/MapControls';
import InstructionsModal from './components/InstructionsModal';
import InfoModal from './components/InfoModal';
import UpgradeModal from './components/UpgradeModal';
import SkillTreeModal from './components/SkillTreeModal';
import FloatingTextContainer from './components/FloatingTextContainer';
import Tooltip from './components/Tooltip';
import DebugPanel from './components/DebugPanel';
import { TILE_WIDTH, TILE_HEIGHT } from './constants';

const App: React.FC = () => {
    const {
        gameState,
        setGameState,
        panCamera,
        zoomCamera,
        setSelectedTile,
        handleBuild,
        handleRemove,
        handleGlobalUpgrade,
        handleSkillUnlock,
        handleBoost,
        setMode,
        setTimeScale,
        toggleAutoMode,
        populateIslandsForDebug,
        handlePopulateFullWorld,
        addFloatingText,
    } = useGameState();

    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    const update = useCallback((delta: number) => {
        setGameState(prev => {
            // This is a placeholder for the more complex update logic inside useGameState
            // The actual game logic update is handled within the useGameState hook's loop.
            return prev;
        });
    }, [setGameState]);

    useGameLoop(update, gameState.timeScale);

    useEffect(() => {
        if (!localStorage.getItem('expactory_instructions_seen')) {
            setActiveModal('instructions');
        }
    }, []);

    const handleCloseInstructions = () => {
        localStorage.setItem('expactory_instructions_seen', 'true');
        setActiveModal(null);
    };

    const handleCanvasClick = (gridPos: { x: number, y: number }) => {
        if (gameState.mode === 'building' && gameState.buildChoice) {
            handleBuild(gridPos.x, gridPos.y);
        } else if (gameState.mode === 'remove') {
            handleRemove(gridPos.x, gridPos.y);
        } else {
            setMode('select');
        }
    };

    const handleMouseMove = (gridPos: { x: number, y: number } | null, mousePos: { x: number, y: number }) => {
        setSelectedTile(gridPos);
        if (gridPos) {
            const tile = gameState.grid[gridPos.y]?.[gridPos.x];
            if (tile && tile.type !== 'water' && tile.initialResources > 0) {
                const resourceEmoji = tile.type === 'grass' ? '🌲' : '⛰️';
                setTooltip({
                    content: `${resourceEmoji} ${Math.floor(tile.currentResources)} / ${tile.initialResources}`,
                    x: mousePos.x + 15,
                    y: mousePos.y,
                });
            } else {
                setTooltip(null);
            }
        } else {
            setTooltip(null);
        }
    };
    
    return (
        <>
            <GameCanvas
                grid={gameState.grid}
                camera={gameState.camera}
                selectedTile={gameState.selectedTile}
                mode={gameState.mode}
                buildChoice={gameState.buildChoice}
                globalMinerLevel={gameState.globalMinerLevel}
                boats={gameState.boats}
                vehicles={gameState.vehicles}
                onPan={panCamera}
                onZoom={zoomCamera}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
            />
            <div id="time-of-day-overlay" className="absolute inset-0 pointer-events-none" style={{ backgroundColor: `rgba(0, 0, 30, ${gameState.dayNightOverlay})`, transition: 'background-color 1s linear' }}></div>

            <Hud
                resources={gameState.resources}
                storage={gameState.storage}
                dayCyclePercent={gameState.dayCyclePercent}
                unlockedSkills={gameState.unlockedSkills}
                isBoostActive={gameState.isBoostActive}
                onInfoClick={() => setActiveModal('info')}
                onResearchClick={() => setActiveModal('skillTree')}
                onBoostClick={handleBoost}
            />

            <MapControls onPan={panCamera} onZoom={zoomCamera} />

            <BuildMenu
                mode={gameState.mode}
                buildChoice={gameState.buildChoice}
                resources={gameState.resources}
                unlockedSkills={gameState.unlockedSkills}
                onSetMode={setMode}
                onUpgradeClick={() => setActiveModal('globalUpgrade')}
            />

            <InstructionsModal isOpen={activeModal === 'instructions'} onClose={handleCloseInstructions} />
            <InfoModal isOpen={activeModal === 'info'} onClose={() => setActiveModal(null)} />
            <UpgradeModal
                isOpen={activeModal === 'globalUpgrade'}
                onClose={() => setActiveModal(null)}
                level={gameState.globalMinerLevel}
                resources={gameState.resources}
                onUpgrade={handleGlobalUpgrade}
            />
            <SkillTreeModal
                isOpen={activeModal === 'skillTree'}
                onClose={() => setActiveModal(null)}
                researchPoints={gameState.resources.research}
                unlockedSkills={gameState.unlockedSkills}
                onUnlock={handleSkillUnlock}
            />
            
            <FloatingTextContainer texts={gameState.floatingTexts} />
            <Tooltip tooltip={tooltip} />

            <DebugPanel 
                timeScale={gameState.timeScale}
                autoMode={gameState.autoMode}
                onTimeScaleChange={setTimeScale}
                onAutoModeToggle={toggleAutoMode}
                onPopulateIslands={populateIslandsForDebug}
                onPopulateFull={handlePopulateFullWorld}
            />
        </>
    );
};

export default App;
