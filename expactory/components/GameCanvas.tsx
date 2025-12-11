import React, { useRef, useEffect, useCallback } from 'react';
import { Tile, Camera, BuildChoice, Boat, Vehicle, StructureType } from '../types';
import { isoToScreen, screenToIso } from '../utils/grid';
import { TILE_COLORS, TILE_WIDTH, TILE_HEIGHT, GLOBAL_MINER_UPGRADES } from '../constants';
import { getNeighbors } from '../utils/grid';

interface GameCanvasProps {
    grid: Tile[][];
    camera: Camera;
    selectedTile: { x: number; y: number } | null;
    mode: 'select' | 'building' | 'remove';
    buildChoice: BuildChoice | null;
    globalMinerLevel: number;
    boats: Boat[];
    vehicles: Vehicle[];
    onPan: (dx: number, dy: number) => void;
    onZoom: (amount: number, mouseX: number, mouseY: number) => void;
    onClick: (gridPos: { x: number, y: number }) => void;
    onMouseMove: (gridPos: { x: number, y: number } | null, mousePos: { x: number, y: number }) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
    grid, camera, selectedTile, mode, buildChoice, globalMinerLevel, boats, vehicles,
    onPan, onZoom, onClick, onMouseMove
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const panState = useRef({ isPanning: false, lastMousePos: { x: 0, y: 0 } }).current;
    
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = TILE_COLORS.water;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(camera.zoom, camera.zoom);
        ctx.translate(-camera.x, -camera.y);

        const aoeRange = (GLOBAL_MINER_UPGRADES[globalMinerLevel - 1] || {}).aoe || 0;

        grid.forEach(row => row.forEach(tile => {
            drawTile(ctx, tile.x, tile.y, TILE_COLORS[tile.type]);
            if(tile.type !== 'water') drawResourceBar(ctx, tile);
            if(tile.structure) {
                drawStructure(ctx, tile.x, tile.y, tile.structure.type, globalMinerLevel);
                if (tile.structure.type === 'miner' && aoeRange > 0) {
                    getNeighbors(tile.x, tile.y, aoeRange, grid.length, grid[0].length).forEach(n => {
                        if (grid[n.y][n.x].type !== 'water') drawTileHighlight(ctx, n.x, n.y, TILE_COLORS.aoe);
                    });
                }
            }
        }));

        boats.forEach(boat => {
            ctx.font = '24px sans-serif';
            ctx.fillText('⛵', boat.x - 12, boat.y);
        });

        vehicles.forEach(vehicle => {
            ctx.font = '24px sans-serif';
            ctx.fillText('🚗', vehicle.x - 12, vehicle.y - 15);
        });

        if (selectedTile) {
            let color = TILE_COLORS.highlight;
            if (mode === 'building' && buildChoice) {
                 const tile = grid[selectedTile.y]?.[selectedTile.x];
                 let isValid = false;
                 if (buildChoice === 'fishing_boat') {
                     if (tile && tile.type === 'water') {
                         isValid = getNeighbors(selectedTile.x, selectedTile.y, 1, grid.length, grid[0].length).some(n => grid[n.y][n.x].type !== 'water');
                     }
                 } else {
                     isValid = tile ? tile.type !== 'water' && !tile.structure : false;
                 }
                color = isValid ? TILE_COLORS.placement : TILE_COLORS.invalidPlacement;
            } else if (mode === 'remove') {
                const tile = grid[selectedTile.y]?.[selectedTile.x];
                if (tile && tile.structure) color = TILE_COLORS.removePlacement;
            }
            drawTileHighlight(ctx, selectedTile.x, selectedTile.y, color);
        }

        ctx.restore();
    }, [grid, camera, selectedTile, mode, buildChoice, globalMinerLevel, boats, vehicles]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            draw();
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        let animationFrameId: number;
        const render = () => {
            draw();
            animationFrameId = window.requestAnimationFrame(render);
        }
        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.cancelAnimationFrame(animationFrameId);
        };
    }, [draw]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button !== 0) { // Right or middle click
            panState.isPanning = true;
            panState.lastMousePos = { x: e.clientX, y: e.clientY };
            e.currentTarget.style.cursor = 'grabbing';
        } else {
             if (selectedTile) onClick(selectedTile);
        }
    };
    
    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        panState.isPanning = false;
        e.currentTarget.style.cursor = 'pointer';
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (panState.isPanning) {
            const dx = e.clientX - panState.lastMousePos.x;
            const dy = e.clientY - panState.lastMousePos.y;
            onPan(dx, dy);
            panState.lastMousePos = { x: e.clientX, y: e.clientY };
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            const mousePos = { x: e.clientX, y: e.clientY };
            const gridPos = screenToIso(e.clientX - rect.left, e.clientY - rect.top, camera, {width: rect.width, height: rect.height});
            if (gridPos.x >= 0 && gridPos.x < grid[0].length && gridPos.y >= 0 && gridPos.y < grid.length) {
                onMouseMove(gridPos, mousePos);
            } else {
                onMouseMove(null, mousePos);
            }
        }
    };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const amount = e.deltaY < 0 ? 0.1 : -0.1;
        onZoom(amount, e.clientX, e.clientY);
    };

    return <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} onMouseLeave={() => panState.isPanning=false} onWheel={handleWheel} className="cursor-pointer" />;
};

// Drawing helper functions (defined outside component to avoid recreation on render)
const drawTile = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    const screenPos = isoToScreen(x, y);
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(screenPos.x + TILE_WIDTH / 2, screenPos.y + TILE_HEIGHT / 2);
    ctx.lineTo(screenPos.x, screenPos.y + TILE_HEIGHT);
    ctx.lineTo(screenPos.x - TILE_WIDTH / 2, screenPos.y + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};

const drawTileHighlight = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    const screenPos = isoToScreen(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y);
    ctx.lineTo(screenPos.x + TILE_WIDTH / 2, screenPos.y + TILE_HEIGHT / 2);
    ctx.lineTo(screenPos.x, screenPos.y + TILE_HEIGHT);
    ctx.lineTo(screenPos.x - TILE_WIDTH / 2, screenPos.y + TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.fill();
};

const drawResourceBar = (ctx: CanvasRenderingContext2D, tile: Tile) => {
    if (tile.initialResources === 0) return;
    const screenPos = isoToScreen(tile.x, tile.y);
    const barWidth = TILE_WIDTH * 0.6;
    const barHeight = 8;
    const barX = screenPos.x - barWidth / 2;
    const barY = screenPos.y + TILE_HEIGHT - barHeight - 5;
    const percent = tile.currentResources / tile.initialResources;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = tile.type === 'grass' ? '#22c55e' : '#64748b';
    ctx.fillRect(barX, barY, barWidth * percent, barHeight);
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
};

const drawStructure = (ctx: CanvasRenderingContext2D, x: number, y: number, type: StructureType, globalMinerLevel: number) => {
    const screenPos = isoToScreen(x, y);
    const topY = screenPos.y + TILE_HEIGHT / 2;
    switch(type) {
        case 'miner': {
            const colors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa'];
            ctx.fillStyle = colors[globalMinerLevel] || colors[0];
            const height = 20 + globalMinerLevel * 10;
            const width = 30 + globalMinerLevel * 5;
            ctx.fillRect(screenPos.x - width / 2, topY - height, width, height);
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.moveTo(screenPos.x, topY - height - 15);
            ctx.lineTo(screenPos.x + width / 2, topY - height);
            ctx.lineTo(screenPos.x - width / 2, topY - height);
            ctx.closePath();
            ctx.fill();
            break;
        }
        case 'storage':
            ctx.fillStyle = '#a16207';
            ctx.fillRect(screenPos.x - 15, topY - 30, 30, 30);
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(screenPos.x - 12, topY - 27, 24, 24);
            break;
        case 'research':
            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(screenPos.x - 18, topY - 36, 36, 36);
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(screenPos.x, topY - 18, 12, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'smelter':
             ctx.fillStyle = '#4b5563';
             ctx.fillRect(screenPos.x - 20, topY - 50, 40, 50);
             ctx.fillStyle = '#f59e0b';
             ctx.fillRect(screenPos.x - 5, topY - 10, 10, 10);
            break;
        case 'assembler':
            ctx.fillStyle = '#581c87';
            ctx.fillRect(screenPos.x - 25, topY - 40, 50, 40);
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(screenPos.x - 10, topY - 45, 20, 10);
            break;
        case 'vehicle_bay':
            ctx.fillStyle = '#450a0a';
            ctx.fillRect(screenPos.x - 30, topY - 20, 60, 20);
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(screenPos.x - 30, topY - 25, 60, 5);
            break;
    }
};


export default GameCanvas;