
import React from 'react';
import { FloatingTextData } from '../types';

interface FloatingTextContainerProps {
    texts: FloatingTextData[];
}

const FloatingText: React.FC<{ data: FloatingTextData }> = ({ data }) => {
    return (
        <div
            className="absolute font-bold text-xl transition-all duration-1000 ease-out"
            style={{
                left: `${data.x}px`,
                top: `${data.y}px`,
                color: data.color,
                transform: 'translate(-50%, -50px)',
                opacity: 0,
                textShadow: '1px 1px 2px black',
                animation: 'float-up 1s ease-out forwards',
            }}
        >
            {data.text}
            <style>{`
                @keyframes float-up {
                    0% { transform: translate(-50%, 0); opacity: 1; }
                    100% { transform: translate(-50%, -50px); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

const FloatingTextContainer: React.FC<FloatingTextContainerProps> = ({ texts }) => {
    return (
        <div className="absolute inset-0 pointer-events-none z-40">
            {texts.map(text => (
                <FloatingText key={text.id} data={text} />
            ))}
        </div>
    );
};

export default FloatingTextContainer;
