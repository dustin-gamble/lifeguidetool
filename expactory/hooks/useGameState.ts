import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Tile, ResourceType, StructureType, Boat, Vehicle } from '../types';
import { GRID_SIZE, TILE_WIDTH, TILE_HEIGHT, TILE_INITIAL_RESOURCES, DAY_CYCLE_DURATION, STRUCTURE_COSTS, GLOBAL_MINER_UPGRADES, SKILL_TREE } from '../constants';
import { isoToScreen, getNeighbors } from '../utils/grid';

const createInitialState = (): GameState => {
    const grid: Tile[][] = Array.from({ length: GRID_SIZE }, (_, y) =>
        Array.from({ length: GRID_SIZE }, (_, x) => ({
            type: 'water', structure: null, x, y, initialResources: 0, currentResources: 0
        }))
    );

    const islandTiles: { x: number; y: number; type: 'grass' | 'rock' }[] = [{ x: 0, y: 0, type: 'grass' }, { x: 0, y: -1, type: 'grass' }, { x: 0, y: 1, type: 'rock' }, { x: -1, y: 0, type: 'grass' }, { x: 1, y: 0, type: 'rock' }];
    const centerX = Math.floor(GRID_SIZE / 2);
    const centerY = Math.floor(GRID_SIZE / 2);

    islandTiles.forEach(t => {
        const tile = grid[centerY + t.y][centerX + t.x];
        tile.type = t.type;
        tile.initialResources = TILE_INITIAL_RESOURCES;
        tile.currentResources = TILE_INITIAL_RESOURCES;
    });

    const centerScreenPos = isoToScreen(centerX, centerY);

    return {
        grid,
        resources: { wood: 20, stone: 5, research: 0, iron: 0, iron_ingot: 0, fish: 0, lithium: 0, motor: 0 },
        storage: { wood: 50, stone: 50, research: Infinity, iron: 50, iron_ingot: 50, fish: 50, lithium: 50, motor: 50 },
        camera: { x: centerScreenPos.x, y: centerScreenPos.y + TILE_HEIGHT / 2, zoom: 1 },
        selectedTile: null,
        mode: 'select',
        buildChoice: null,
        lastUpdate: Date.now(),
        productionTimers: {},
        globalMinerLevel: 0,
        timeScale: 1,
        autoMode: false,
        autoModeTimer: 0,
        dayCycleTimer: 0,
        dayCyclePercent: 0,
        dayNightOverlay: 0,
        boats: [],
        vehicles: [],
        isBoostActive: false,
        boostTimer: 0,
        unlockedSkills: new Set<string>(),
        floatingTexts: [],
    };
};


export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState>(createInitialState);
    const gameStateRef = useRef(gameState);
    gameStateRef.current = gameState;

    const addFloatingText = useCallback((text: string, x: number, y: number, color = 'white') => {
        const screenPos = isoToScreen(x, y);
        const newText = {
            id: Date.now() + Math.random(),
            text,
            x: screenPos.x,
            y: screenPos.y,
            color
        };
        setGameState(prev => ({ ...prev, floatingTexts: [...prev.floatingTexts, newText] }));
        setTimeout(() => {
            setGameState(prev => ({...prev, floatingTexts: prev.floatingTexts.filter(ft => ft.id !== newText.id)}));
        }, 1000);
    }, []);

    const gameLogicUpdate = useCallback(() => {
        const now = Date.now();
        const realDelta = (now - gameStateRef.current.lastUpdate) / 1000;
        let delta = realDelta * gameStateRef.current.timeScale;
        if(gameStateRef.current.isBoostActive) delta *= 2;

        setGameState(prev => {
            const newState = { ...prev, lastUpdate: now };
            
            // Boost Timer
            if (newState.isBoostActive) {
                newState.boostTimer -= realDelta;
                if(newState.boostTimer <= 0) {
                    newState.isBoostActive = false;
                }
            }

            // Day Cycle
            newState.dayCycleTimer += delta;
            newState.dayCyclePercent = newState.dayCycleTimer / DAY_CYCLE_DURATION;
            const transitionPeriod = 0.25;
            if (newState.dayCyclePercent < transitionPeriod) newState.dayNightOverlay = (1 - newState.dayCyclePercent / transitionPeriod) * 0.5;
            else if (newState.dayCyclePercent > (1 - transitionPeriod)) newState.dayNightOverlay = ((newState.dayCyclePercent - (1 - transitionPeriod)) / transitionPeriod) * 0.5;
            else newState.dayNightOverlay = 0;

            if (newState.dayCycleTimer >= DAY_CYCLE_DURATION) {
                newState.dayCycleTimer = 0;
                // Auto Expand
                const validSpots: {x:number, y:number}[] = [];
                for (let y = 0; y < GRID_SIZE; y++) {
                    for (let x = 0; x < GRID_SIZE; x++) {
                        if (newState.grid[y][x].type === 'water' && getNeighbors(x,y,1,GRID_SIZE,GRID_SIZE).some(n => newState.grid[n.y][n.x].type !== 'water')) {
                           validSpots.push({x,y});
                        }
                    }
                }
                if (validSpots.length > 0) {
                    const {x, y} = validSpots[Math.floor(Math.random() * validSpots.length)];
                    const tile = newState.grid[y][x];
                    tile.type = Math.random() > 0.5 ? 'grass' : 'rock';
                    tile.initialResources = TILE_INITIAL_RESOURCES;
                    tile.currentResources = TILE_INITIAL_RESOURCES;
                }
            }

            // Production
            const globalSpeedMultiplier = (GLOBAL_MINER_UPGRADES[newState.globalMinerLevel - 1] || {}).speedMultiplier || 1;
            const aoeRange = (GLOBAL_MINER_UPGRADES[newState.globalMinerLevel - 1] || {}).aoe || 0;

            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    const tile = newState.grid[y][x];
                    if (!tile.structure) continue;
                    
                    const timerId = `${tile.structure.type}-${x}-${y}`;
                    newState.productionTimers[timerId] = (newState.productionTimers[timerId] || 0) + delta;

                    switch(tile.structure.type) {
                        case 'miner': {
                             const productionTime = 5 / globalSpeedMultiplier;
                             if(newState.productionTimers[timerId] >= productionTime) {
                                newState.productionTimers[timerId] -= productionTime;
                                const tilesToMine = [{tile, x, y}];
                                if (aoeRange > 0) getNeighbors(x, y, aoeRange, GRID_SIZE, GRID_SIZE).forEach(n => tilesToMine.push({tile: newState.grid[n.y][n.x], x: n.x, y: n.y}));
                                
                                tilesToMine.forEach(target => {
                                    if(target.tile.type === 'water' || target.tile.currentResources <= 0) return;
                                    const resourceType = target.tile.type === 'grass' ? 'wood' : 'stone';
                                    if(newState.resources[resourceType] < newState.storage[resourceType]){
                                        newState.resources[resourceType]++;
                                        target.tile.currentResources--;
                                        addFloatingText(resourceType === 'wood' ? '🌲+1' : '⛰️+1', target.x, target.y);
                                    }

                                    if(target.tile.type === 'rock') {
                                        if (newState.unlockedSkills.has('unlock_iron') && Math.random() < 0.2 && newState.resources.iron < newState.storage.iron) {
                                            newState.resources.iron++;
                                            addFloatingText('🔩+1', target.x, target.y - 0.5);
                                        }
                                         if (newState.unlockedSkills.has('advanced_geology') && Math.random() < 0.1 && newState.resources.lithium < newState.storage.lithium) {
                                            newState.resources.lithium++;
                                            addFloatingText('🔋+1', target.x, target.y - 1);
                                        }
                                    }
                                });
                             }
                            break;
                        }
                        case 'research': {
                            const researchMultiplier = newState.unlockedSkills.has('faster_research') ? 1.5 : 1;
                            newState.resources.research += (0.5 * researchMultiplier) * delta;
                            break;
                        }
                        case 'smelter': {
                            if (newState.resources.iron >= 1 && newState.productionTimers[timerId] >= 10) {
                                newState.productionTimers[timerId] -= 10;
                                if (newState.resources.iron_ingot < newState.storage.iron_ingot) {
                                    newState.resources.iron--;
                                    newState.resources.iron_ingot++;
                                    addFloatingText('🔗+1', x, y);
                                }
                            }
                            break;
                        }
                        case 'assembler': {
                            if (newState.resources.iron_ingot >= 1 && newState.resources.lithium >= 1 && newState.productionTimers[timerId] >= 15) {
                                newState.productionTimers[timerId] -= 15;
                                if (newState.resources.motor < newState.storage.motor) {
                                    newState.resources.iron_ingot--;
                                    newState.resources.lithium--;
                                    newState.resources.motor++;
                                    addFloatingText('⚙️+1', x, y);
                                }
                            }
                            break;
                        }
                        case 'vehicle_bay': {
                             if (newState.resources.iron_ingot >= 50 && newState.resources.motor >= 5 && newState.vehicles.length < 10 && newState.productionTimers[timerId] >= 20) {
                                newState.productionTimers[timerId] -= 20;
                                newState.resources.iron_ingot -= 50;
                                newState.resources.motor -= 5;
                                const screenPos = isoToScreen(x,y);
                                const newVehicle: Vehicle = {id: Date.now(), x: screenPos.x, y: screenPos.y + TILE_HEIGHT / 2, currentTile: {x,y}, targetTile: null };
                                newState.vehicles = [...newState.vehicles, newVehicle];
                             }
                            break;
                        }
                    }
                }
            }

            // Boat Updates
            let fishToAdd = 0;
            newState.boats = newState.boats.map(boat => {
                const newBoat = {...boat};
                newBoat.timer += realDelta;
                if (newBoat.timer >= 15) {
                    newBoat.timer = 0;
                    if(newState.resources.fish < newState.storage.fish) fishToAdd++;
                }

                if(!newBoat.target){
                     const waterTiles = [];
                     for (let y = 0; y < GRID_SIZE; y++) {
                         for (let x = 0; x < GRID_SIZE; x++) {
                              if (newState.grid[y][x].type === 'water' && getNeighbors(x,y,1,GRID_SIZE,GRID_SIZE).some(n => newState.grid[n.y][n.x].type !== 'water')) {
                                 waterTiles.push({x,y});
                              }
                         }
                     }
                    if(waterTiles.length > 0) newBoat.target = isoToScreen(waterTiles[Math.floor(Math.random() * waterTiles.length)].x, waterTiles[Math.floor(Math.random() * waterTiles.length)].y);
                }

                if (newBoat.target) {
                    const dx = newBoat.target.x - newBoat.x, dy = newBoat.target.y - newBoat.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 5) newBoat.target = null;
                    else {
                        newBoat.x += (dx / dist) * 20 * realDelta;
                        newBoat.y += (dy / dist) * 20 * realDelta;
                    }
                }
                return newBoat;
            });
            if(fishToAdd > 0) newState.resources.fish += fishToAdd;

            // Vehicle Updates
            newState.vehicles = newState.vehicles.map(vehicle => {
                const newVehicle = {...vehicle};
                if (!newVehicle.targetTile) {
                    const neighbors = getNeighbors(newVehicle.currentTile.x, newVehicle.currentTile.y, 1, GRID_SIZE, GRID_SIZE).filter(n => newState.grid[n.y][n.x].type !== 'water');
                    if (neighbors.length > 0) newVehicle.targetTile = neighbors[Math.floor(Math.random() * neighbors.length)];
                }
                
                if (newVehicle.targetTile) {
                    const targetPos = isoToScreen(newVehicle.targetTile.x, newVehicle.targetTile.y);
                    targetPos.y += TILE_HEIGHT / 2; // Center on tile
                    const dx = targetPos.x - newVehicle.x, dy = targetPos.y - newVehicle.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < 5) {
                        newVehicle.currentTile = newVehicle.targetTile;
                        newVehicle.targetTile = null;
                    } else {
                         newVehicle.x += (dx / dist) * 40 * realDelta;
                         newVehicle.y += (dy / dist) * 40 * realDelta;
                    }
                }
                return newVehicle;
            });

            // Auto Mode
            if(newState.autoMode) {
                newState.autoModeTimer += delta;
                if(newState.autoModeTimer >= 1) { // Run once per second (affected by time scale)
                    newState.autoModeTimer = 0;

                    // 1. Auto-unlock skills
                    let unlockedSomething = false;
                    for(const skill of Object.values(SKILL_TREE)) {
                        const canUnlock = !newState.unlockedSkills.has(skill.id) && skill.dependencies.every(dep => newState.unlockedSkills.has(dep)) && newState.resources.research >= skill.cost;
                        if(canUnlock) {
                            newState.resources.research -= skill.cost;
                            newState.unlockedSkills.add(skill.id);
                            unlockedSomething = true;
                            break; 
                        }
                    }
                    if(unlockedSomething) return newState;

                    // 2. Auto-upgrade miners
                    const nextUpgrade = GLOBAL_MINER_UPGRADES[newState.globalMinerLevel];
                    if (nextUpgrade && newState.resources.wood >= nextUpgrade.cost.wood && newState.resources.stone >= nextUpgrade.cost.stone) {
                        newState.resources.wood -= nextUpgrade.cost.wood;
                        newState.resources.stone -= nextUpgrade.cost.stone;
                        newState.globalMinerLevel++;
                        return newState;
                    }
                    
                    // 3. Auto-build
                    const tryAutoBuild = (type: StructureType): boolean => {
                        const cost = STRUCTURE_COSTS[type];
                        if (Object.entries(cost).some(([res, amount]) => newState.resources[res as ResourceType] < amount!)) return false;

                        for(let y = 0; y < GRID_SIZE; y++) {
                            for(let x = 0; x < GRID_SIZE; x++) {
                                if (isValidPlacement(x, y, type, newState.grid)) {
                                     Object.entries(cost).forEach(([res, amount]) => {
                                        if (amount) newState.resources[res as ResourceType] -= amount;
                                     });
                                    if (type === 'storage') {
                                        Object.keys(newState.storage).forEach(res => newState.storage[res as ResourceType] += 50);
                                    } else {
                                        newState.grid[y][x].structure = { type };
                                    }
                                    return true;
                                }
                            }
                        }
                        return false;
                    };

                    if (newState.resources.wood > newState.storage.wood * 0.8 || newState.resources.stone > newState.storage.stone * 0.8) {
                        if (tryAutoBuild('storage')) return newState;
                    }
                    if (!newState.grid.flat().some(t => t.structure?.type === 'research')) {
                        if (tryAutoBuild('research')) return newState;
                    }
                    if (tryAutoBuild('miner')) return newState;
                }
            }


            return newState;
        });
    }, [addFloatingText]);

    useEffect(() => {
        const interval = setInterval(gameLogicUpdate, 50); // Run game logic at 20Hz
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isValidPlacement = (x: number, y: number, type: StructureType, grid: Tile[][]): boolean => {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
        const tile = grid[y][x];

        if (type === 'fishing_boat') {
            if (tile.type !== 'water') return false;
            // Must be adjacent to land
            return getNeighbors(x, y, 1, GRID_SIZE, GRID_SIZE).some(n => grid[n.y][n.x].type !== 'water');
        }

        return tile.type !== 'water' && !tile.structure;
    };

    const panCamera = useCallback((dx: number, dy: number) => {
        setGameState(prev => ({ ...prev, camera: { ...prev.camera, x: prev.camera.x - dx / prev.camera.zoom, y: prev.camera.y - dy / prev.camera.zoom }}));
    }, []);

    const zoomCamera = useCallback((amount: number, mouseX: number, mouseY: number) => {
        setGameState(prev => {
            const newZoom = Math.max(0.3, Math.min(2, prev.camera.zoom + amount));
            return {...prev, camera: {...prev.camera, zoom: newZoom }};
        });
    }, []);
    
    const setSelectedTile = useCallback((tile: { x: number, y: number } | null) => {
        setGameState(prev => ({ ...prev, selectedTile: tile }));
    }, []);
    
    const setMode = useCallback((mode: 'select' | 'building' | 'remove', choice: StructureType | null = null) => {
        setGameState(prev => ({ ...prev, mode, buildChoice: mode === 'building' ? choice : null }));
    }, []);

    const handleBuild = useCallback((x: number, y: number) => {
        setGameState(prev => {
            const newState = { ...prev };
            const type = newState.buildChoice;
            if(!type) return prev;
            
            if (!isValidPlacement(x, y, type, newState.grid)) return prev;

            const cost = STRUCTURE_COSTS[type];
            const canAfford = Object.entries(cost).every(([res, amount]) => newState.resources[res as ResourceType] >= amount!);
            
            const tile = newState.grid[y]?.[x];
            if(!tile || !canAfford) return prev;
            
            if (type === 'fishing_boat') {
                 if(tile.type !== 'water') return prev; // Final check
            } else {
                if(tile.structure) return prev; // Final check
            }

            Object.entries(cost).forEach(([res, amount]) => {
                if (amount) newState.resources[res as ResourceType] -= amount;
            });

            if (type === 'fishing_boat') {
                const screenPos = isoToScreen(x, y);
                const newBoat: Boat = { id: Date.now(), x: screenPos.x, y: screenPos.y + TILE_HEIGHT / 2, target: null, timer: 0 };
                newState.boats = [...newState.boats, newBoat];
            } else {
                tile.structure = { type };
                if (type === 'storage') {
                     Object.keys(newState.storage).forEach(res => newState.storage[res as ResourceType] += 50);
                }
            }
            
            return newState;
        });
    }, []);
    
    const handleRemove = useCallback((x: number, y: number) => {
        setGameState(prev => {
            const newState = { ...prev };
            const tile = newState.grid[y]?.[x];
            if(!tile || !tile.structure) return prev;

            const type = tile.structure.type;
            const cost = STRUCTURE_COSTS[type];
            if(cost) {
                Object.entries(cost).forEach(([res, amount]) => {
                    if (amount) newState.resources[res as ResourceType] += Math.floor(amount * 0.5);
                });
            }
            if (type === 'storage') {
                 Object.keys(newState.storage).forEach(res => newState.storage[res as ResourceType] -= 50);
            }
            tile.structure = null;
            return newState;
        });
    }, []);

    const handleGlobalUpgrade = useCallback(() => {
        setGameState(prev => {
            const newState = {...prev};
            const nextUpgrade = GLOBAL_MINER_UPGRADES[newState.globalMinerLevel];
            if(!nextUpgrade) return prev;

            if (newState.resources.wood >= nextUpgrade.cost.wood && newState.resources.stone >= nextUpgrade.cost.stone) {
                newState.resources.wood -= nextUpgrade.cost.wood;
                newState.resources.stone -= nextUpgrade.cost.stone;
                newState.globalMinerLevel++;
            }
            return newState;
        });
    }, []);

    const handleSkillUnlock = useCallback((skillId: string) => {
        setGameState(prev => {
            const newState = {...prev};
            const skill = SKILL_TREE[skillId];
            const dependenciesMet = skill.dependencies.every(depId => newState.unlockedSkills.has(depId));
            if(skill && !newState.unlockedSkills.has(skillId) && dependenciesMet && newState.resources.research >= skill.cost) {
                newState.resources.research -= skill.cost;
                const newSkills = new Set(newState.unlockedSkills);
                newSkills.add(skillId);
                newState.unlockedSkills = newSkills;
            }
            return newState;
        });
    }, []);

    const handleBoost = useCallback(() => {
        setGameState(prev => {
            if (prev.resources.fish >= 20 && !prev.isBoostActive) {
                const newState = {...prev};
                newState.resources.fish -= 20;
                newState.isBoostActive = true;
                newState.boostTimer = 30; // 30 seconds
                return newState;
            }
            return prev;
        });
    }, []);
    
    const setTimeScale = (scale: number) => setGameState(prev => ({...prev, timeScale: scale}));
    const toggleAutoMode = () => setGameState(prev => ({...prev, autoMode: !prev.autoMode}));
    const populateIslandsForDebug = () => {/* Logic for debug */};
    const handlePopulateFullWorld = () => {/* Logic for debug */};

    return {
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
    };
};