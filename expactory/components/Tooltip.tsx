
import React from 'react';
import { TooltipData } from '../types';

interface TooltipProps {
    tooltip: TooltipData | null;
}

const Tooltip: React.FC<TooltipProps> = ({ tooltip }) => {
    if (!tooltip) return null;

    return (
        <div
            className="absolute hud-item p-2 rounded-lg shadow-md text-sm pointer-events-none z-50"
            style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
            }}
        >
            {tooltip.content}
        </div>
    );
};

export default Tooltip;
