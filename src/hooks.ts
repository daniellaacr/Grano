import { useCallback, useEffect, useRef, useState } from 'react';
export function usePolling<T>(load: () => Promise<T>, interval = 3500) {
    const [data, setData] = useState<T | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
    const seq = useRef(0);
    const active = useRef(false);
    const refresh = useCallback(async () => { const n = ++seq.current; try {
        const next = await load();
        if (active.current && n === seq.current) {
            setData(next);
            setError('');
        }
    }
    catch (e) {
        if (active.current && n === seq.current)
            setError(e instanceof Error ? e.message : 'Intenta de nuevo.');
    }
    finally {
        if (active.current && n === seq.current)
            setLoading(false);
    } }, [load]);
    useEffect(() => { active.current = true; void refresh(); const timer = window.setInterval(() => void refresh(), interval); return () => { active.current = false; seq.current++; clearInterval(timer); }; }, [refresh, interval]);
    const update = useCallback((fn: (old: T | null) => T | null) => { seq.current++; setData(fn); }, []);
    return { data, error, loading, refresh, update };
}
export function readStored<T>(key: string, fallback: T): T { try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback;
}
catch {
    return fallback;
} }
