
import React, { useRef } from 'react';

interface MapControlsProps {
    onPan: (dx: number, dy: number, isContinuous?: boolean) => void;
    onZoom: (amount: number, mouseX: number, mouseY: number) => void;
}

// FIX: Removed the unused 'id' property from props to fix missing property errors.
const ControlButton: React.FC<{ onPan: (panDir: { x: number, y: number }) => void, panDir: { x: number, y: number }, children: React.ReactNode }> = ({ onPan, panDir, children }) => {
    // FIX: Changed NodeJS.Timeout to number, which is the correct type for setInterval return value in browsers.
    const intervalRef = useRef<number | null>(null);

    const startPanning = () => {
        stopPanning(); // Clear any existing interval
        onPan(panDir); // Initial pan
        intervalRef.current = window.setInterval(() => onPan(panDir), 50);
    };

    const stopPanning = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };
    
    return (
        <button
            onMouseDown={startPanning}
            onMouseUp={stopPanning}
            onMouseLeave={stopPanning}
            onTouchStart={(e) => { e.preventDefault(); startPanning(); }}
            onTouchEnd={stopPanning}
            className="map-control-btn hud-item rounded-full shadow-md w-[50px] h-[50px] flex items-center justify-center text-2xl select-none"
        >
            {children}
        </button>
    );
};

const MapControls: React.FC<MapControlsProps> = ({ onPan, onZoom }) => {

    const handlePan = (dir: { x: number, y: number }) => {
        onPan(dir.x * -10, dir.y * -10);
    };
    
    return (
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-1 w-40">
                <div></div>
                <ControlButton onPan={handlePan} panDir={{ x: 0, y: -1 }}>▲</ControlButton>
                <div></div>
                <ControlButton onPan={handlePan} panDir={{ x: -1, y: 0 }}>◀</ControlButton>
                <div></div>
                <ControlButton onPan={handlePan} panDir={{ x: 1, y: 0 }}>▶</ControlButton>
                <div></div>
                <ControlButton onPan={handlePan} panDir={{ x: 0, y: 1 }}>▼</ControlButton>
                <div></div>
            </div>
            <div className="flex gap-2 justify-center w-40">
                <button onClick={() => onZoom(0.2, window.innerWidth / 2, window.innerHeight / 2)} className="map-control-btn hud-item rounded-full shadow-md flex-1 w-[50px] h-[50px] flex items-center justify-center text-2xl select-none">+</button>
                <button onClick={() => onZoom(-0.2, window.innerWidth / 2, window.innerHeight / 2)} className="map-control-btn hud-item rounded-full shadow-md flex-1 w-[50px] h-[50px] flex items-center justify-center text-2xl select-none">-</button>
            </div>
        </div>
    );
};

export default MapControls;
