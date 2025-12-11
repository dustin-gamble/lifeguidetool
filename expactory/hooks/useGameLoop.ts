
import { useRef, useEffect } from 'react';

export const useGameLoop = (callback: (delta: number) => void, timeScale: number) => {
    // FIX: Explicitly initialize useRef with `undefined` to resolve TypeScript error about missing arguments.
    const requestRef = useRef<number | undefined>(undefined);
    const previousTimeRef = useRef<number | undefined>(undefined);

    const animate = (time: number) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = (time - previousTimeRef.current) / 1000;
            callback(deltaTime * timeScale);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeScale]); // Rerun effect if timeScale changes
};
