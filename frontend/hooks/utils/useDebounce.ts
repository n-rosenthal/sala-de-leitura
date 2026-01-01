/**
 * `frontend/hooks/utils/useDebounce.ts`, hook de debounce
 * 
 *  Hook para debounce (retornar um valor depois de um certo delay)
 */

import { useState, useEffect } from 'react';

/**
 * Hook that debounces a value after a given delay.
 * 
 * @template T
 * @param {T} value - The value to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {T} - The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
}