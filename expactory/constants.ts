
import { StructureType, ResourceType, Skill, GlobalMinerUpgrade } from './types';

export const TILE_WIDTH = 100;
export const TILE_HEIGHT = TILE_WIDTH / 2;
export const GRID_SIZE = 40;
export const TILE_INITIAL_RESOURCES = 100;
export const DAY_CYCLE_DURATION = 30; // seconds

export const TILE_COLORS = {
    water: '#60a5fa',
    grass: '#4ade80',
    rock: '#94a3b8',
    highlight: 'rgba(255, 255, 0, 0.5)',
    placement: 'rgba(0, 255, 0, 0.4)',
    invalidPlacement: 'rgba(255, 0, 0, 0.4)',
    removePlacement: 'rgba(255, 100, 100, 0.5)',
    aoe: 'rgba(22, 163, 74, 0.3)'
};

export const STRUCTURE_COSTS: Record<StructureType, Partial<Record<ResourceType, number>>> = {
    miner: { wood: 10 },
    storage: { wood: 30, stone: 10 },
    research: { wood: 50, stone: 25 },
    smelter: { stone: 25, iron: 10 },
    fishing_boat: { iron_ingot: 15 },
    assembler: { iron_ingot: 20, lithium: 10 },
    vehicle_bay: { iron_ingot: 50, motor: 5 },
};

export const GLOBAL_MINER_UPGRADES: GlobalMinerUpgrade[] = [
    { level: 1, cost: { wood: 50, stone: 50 }, speedMultiplier: 1.5, description: "All miners work <b>1.5x</b> faster." },
    { level: 2, cost: { wood: 150, stone: 150 }, speedMultiplier: 2, aoe: 1, description: "All miners now work <b>2x</b> faster and can mine adjacent tiles." },
    { level: 3, cost: { wood: 400, stone: 400 }, speedMultiplier: 3, aoe: 1, description: "Mining speed increased to <b>3x</b>. Area of effect remains." }
];

export const SKILL_TREE: Record<string, Skill> = {
    unlock_iron: { id: 'unlock_iron', name: 'Geology', description: 'Allows miners on rocky tiles to also find Iron Ore. (20% chance)', cost: 25, dependencies: [] },
    iron_smelting: { id: 'iron_smelting', name: 'Iron Smelting', description: 'Unlocks the Smelter to process raw Iron ore into Iron Ingots.', cost: 100, dependencies: ['unlock_iron'] },
    unlock_fishing: { id: 'unlock_fishing', name: 'Aquaculture', description: 'Unlocks the Fishing Boat to catch fish in the ocean.', cost: 75, dependencies: ['iron_smelting'] },
    advanced_geology: { id: 'advanced_geology', name: 'Advanced Geology', description: 'Miners on rocky tiles can now find Lithium.', cost: 150, dependencies: ['iron_smelting'] },
    electrical_engineering: { id: 'electrical_engineering', name: 'Electrical Engineering', description: 'Unlocks the Assembler to create Electric Motors.', cost: 200, dependencies: ['advanced_geology'] },
    automation: { id: 'automation', name: 'Automation', description: 'Unlocks the Vehicle Bay to produce Cars.', cost: 300, dependencies: ['electrical_engineering'] },
    faster_research: { id: 'faster_research', name: 'Efficient Methods', description: 'Research Stations produce points 50% faster.', cost: 50, dependencies: ['unlock_iron'] },
};
