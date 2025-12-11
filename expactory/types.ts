
export type ResourceType = 'wood' | 'stone' | 'research' | 'iron' | 'iron_ingot' | 'fish' | 'lithium' | 'motor';

export type StructureType = 'miner' | 'storage' | 'research' | 'smelter' | 'fishing_boat' | 'assembler' | 'vehicle_bay';

export type BuildChoice = StructureType | 'remove';

export type TileType = 'water' | 'grass' | 'rock';

export interface Tile {
    type: TileType;
    structure: { type: StructureType } | null;
    x: number;
    y: number;
    initialResources: number;
    currentResources: number;
}

export interface Camera {
    x: number;
    y: number;
    zoom: number;
}

export interface Boat {
    id: number;
    x: number;
    y: number;
    target: { x: number, y: number } | null;
    timer: number;
}

export interface Vehicle {
    id: number;
    x: number;
    y: number;
    currentTile: { x: number; y: number };
    targetTile: { x: number; y: number } | null;
}

export interface FloatingTextData {
    id: number;
    text: string;
    x: number;
    y: number;
    color: string;
}

export interface GameState {
    grid: Tile[][];
    resources: Record<ResourceType, number>;
    storage: Record<ResourceType, number>;
    camera: Camera;
    selectedTile: { x: number, y: number } | null;
    mode: 'select' | 'building' | 'remove';
    buildChoice: StructureType | null;
    lastUpdate: number;
    productionTimers: Record<string, number>;
    globalMinerLevel: number;
    timeScale: number;
    autoMode: boolean;
    autoModeTimer: number;
    dayCycleTimer: number;
    dayCyclePercent: number;
    dayNightOverlay: number;
    boats: Boat[];
    vehicles: Vehicle[];
    isBoostActive: boolean;
    boostTimer: number;
    unlockedSkills: Set<string>;
    floatingTexts: FloatingTextData[];
}

export type ModalType = 'instructions' | 'info' | 'globalUpgrade' | 'skillTree' | null;

export interface TooltipData {
    content: string;
    x: number;
    y: number;
}

export interface Skill {
    id: string;
    name: string;
    description: string;
    cost: number;
    dependencies: string[];
}

export interface GlobalMinerUpgrade {
    level: number;
    cost: { wood: number; stone: number; };
    speedMultiplier: number;
    aoe?: number;
    description: string;
}
