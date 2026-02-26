import React, { createContext, useContext, useState, useRef } from 'react';

const MetricsContext = createContext();

export const SystemMetricsProvider = ({ children }) => {
    const [metrics, setMetrics] = useState({
        searchExecutionTimes: [],
        pathfindingTimes: [],
        cacheHits: 0,
        cacheMisses: 0,
        fraudChecks: 0,
        conflictsPrevented: 0
    });

    const cache = useRef(new Map());

    const trackExecution = (type, duration) => {
        setMetrics(prev => ({
            ...prev,
            [type]: [...prev[type].slice(-19), duration] // Keep last 20
        }));
    };

    const trackCache = (hit) => {
        setMetrics(prev => ({
            ...prev,
            [hit ? 'cacheHits' : 'cacheMisses']: prev[hit ? 'cacheHits' : 'cacheMisses'] + 1
        }));
    };

    const logSystemEvent = (type) => {
        setMetrics(prev => ({ ...prev, [type]: prev[type] + 1 }));
    };

    return (
        <MetricsContext.Provider value={{ metrics, trackExecution, trackCache, logSystemEvent, cache: cache.current }}>
            {children}
        </MetricsContext.Provider>
    );
};

export const useMetrics = () => useContext(MetricsContext);
