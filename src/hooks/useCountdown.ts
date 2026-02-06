import { useState, useEffect, useRef } from 'react';

export function useCountdown(initialSeconds: number | undefined, onComplete?: () => void) {
    const [timeLeft, setTimeLeft] = useState(initialSeconds || 0);
    const callbackRef = useRef(onComplete);

    // Update callback ref to avoid dependency cycle
    useEffect(() => {
        callbackRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (!initialSeconds) {
            setTimeLeft(0);
            return;
        }

        setTimeLeft(initialSeconds);
        const startTime = Date.now();
        const endTime = startTime + initialSeconds * 1000;

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.ceil((endTime - now) / 1000);

            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
                if (callbackRef.current) callbackRef.current();
            } else {
                setTimeLeft(remaining);
            }
        }, 500); // Check every 500ms for more precision

        return () => clearInterval(interval);
    }, [initialSeconds]);

    return {
        timeLeft,
        isTimeOver: timeLeft === 0 && !!initialSeconds
    };
}
