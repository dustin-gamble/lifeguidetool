
import { TILE_WIDTH, TILE_HEIGHT } from '../constants';

export const isoToScreen = (x: number, y: number): { x: number, y: number } => {
    return {
        x: (x - y) * TILE_WIDTH / 2,
        y: (x + y) * TILE_HEIGHT / 2
    };
};

export const screenToIso = (mouseX: number, mouseY: number, camera: { x: number, y: number, zoom: number }, canvasSize: { width: number, height: number }): { x: number, y: number } => {
    const worldX = (mouseX - canvasSize.width / 2) / camera.zoom + camera.x;
    const worldY = (mouseY - canvasSize.height / 2) / camera.zoom + camera.y;
    
    const isoX = Math.round((worldX / (TILE_WIDTH / 2) + worldY / (TILE_HEIGHT / 2)) / 2);
    const isoY = Math.round((worldY / (TILE_HEIGHT / 2) - (worldX / (TILE_WIDTH / 2))) / 2);
    
    return { x: isoX, y: isoY };
};

export const getNeighbors = (x: number, y: number, range: number, gridWidth: number, gridHeight: number): { x: number, y: number }[] => {
    const results = [];
    for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                results.push({ x: nx, y: ny });
            }
        }
    }
    return results;
};
