import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import {
    Search, Navigation, Filter, MapPin, Star,
    ArrowRight, Grid, Map as MapIcon, Info,
    Loader2, Zap, LayoutGrid, SlidersHorizontal,
    TrendingUp, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMetrics } from '../../context/SystemMetrics';
import { calculateRankScore, getHeatmapClustering } from '../../utils/eliteAlgorithms';

const SearchResults = ({ user }) => {
    const navigate = useNavigate();
    const { trackExecution, trackCache, cache } = useMetrics();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('rank');

    // Pathfinding state
    const [selectedStart, setSelectedStart] = useState(null);
    const [selectedEnd, setSelectedEnd] = useState(null);
    const [pathResult, setPathResult] = useState(null);
    const [pathLoading, setPathLoading] = useState(false);
    const [algorithm, setAlgorithm] = useState('astar');

    // DSA: Priority Queue for Top-K Results
    class PriorityQueue {
        constructor(compareFn) {
            this.heap = [];
            this.compareFn = compareFn;
        }
        push(val) {
            this.heap.push(val);
            this.bubbleUp();
        }
        bubbleUp() {
            let idx = this.heap.length - 1;
            while (idx > 0) {
                let pIdx = Math.floor((idx - 1) / 2);
                if (this.compareFn(this.heap[idx], this.heap[pIdx]) >= 0) break;
                [this.heap[idx], this.heap[pIdx]] = [this.heap[pIdx], this.heap[idx]];
                idx = pIdx;
            }
        }
        pop() {
            if (this.heap.length === 1) return this.heap.pop();
            const top = this.heap[0];
            this.heap[0] = this.heap.pop();
            this.bubbleDown();
            return top;
        }
        bubbleDown() {
            let idx = 0;
            while (true) {
                let l = 2 * idx + 1, r = 2 * idx + 2, swap = null;
                if (l < this.heap.length && this.compareFn(this.heap[l], this.heap[idx]) < 0) swap = l;
                if (r < this.heap.length && (swap === null ? this.compareFn(this.heap[r], this.heap[idx]) < 0 : this.compareFn(this.heap[r], this.heap[l]) < 0)) swap = r;
                if (swap === null) break;
                [this.heap[idx], this.heap[swap]] = [this.heap[swap], this.heap[idx]];
                idx = swap;
            }
        }
        sort() {
            const res = [];
            while (this.heap.length > 0) res.push(this.pop());
            return res;
        }
    }

    useEffect(() => {
        const fetchProperties = async () => {
            const start = performance.now();
            try {
                if (cache && cache.has('properties')) {
                    setProperties(cache.get('properties'));
                    trackCache(true);
                } else {
                    const res = await api.get('/api/properties');
                    setProperties(res.data);
                    if (cache) cache.set('properties', res.data);
                    trackCache(false);
                }
            } catch (err) { console.error(err); }
            finally {
                setLoading(false);
                trackExecution('searchExecutionTimes', performance.now() - start);
            }
        };
        fetchProperties();
    }, []);

    const heatmapData = getHeatmapClustering(properties);

    const getOptimalResults = () => {
        const fns = {
            price: (a, b) => a.price - b.price,
            rating: (a, b) => (b.rating || 0) - (a.rating || 0),
            distance: (a, b) => a.location.id.localeCompare(b.location.id),
            rank: (a, b) => calculateRankScore(b) - calculateRankScore(a)
        };
        const pq = new PriorityQueue(fns[sortBy] || fns.rank);
        properties.forEach(p => pq.push(p));
        return pq.sort();
    };

    const handleNodeClick = (property) => {
        if (!selectedStart || (selectedStart && selectedEnd)) {
            setSelectedStart(property);
            setSelectedEnd(null);
            setPathResult(null);
        } else if (selectedStart && !selectedEnd) {
            if (selectedStart._id === property._id) return;
            setSelectedEnd(property);
            calculatePath(selectedStart.location.id, property.location.id);
        }
    };

    const calculatePath = async (startId, endId) => {
        setPathLoading(true);
        try {
            const { data } = await api.post('/api/properties/path', {
                startId,
                endId,
                algorithm
            });
            setPathResult(data);
        } catch (err) {
            console.error('Pathfinding error:', err);
        } finally {
            setPathLoading(false);
        }
    };

    const clearPath = () => {
        setSelectedStart(null);
        setSelectedEnd(null);
        setPathResult(null);
    };

    const sortedProperties = getOptimalResults().filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.id.toLowerCase().includes(search.toLowerCase())
    );

    const MapView = () => {
        // Map property coordinates to SVG space (0-100%)
        const minX = Math.min(...properties.map(p => p.location.x), 0);
        const maxX = Math.max(...properties.map(p => p.location.x), 100);
        const minY = Math.min(...properties.map(p => p.location.y), 0);
        const maxY = Math.max(...properties.map(p => p.location.y), 100);

        const getX = (val) => `${((val - minX) / (maxX - minX || 1)) * 80 + 10}%`;
        const getY = (val) => `${((val - minY) / (maxY - minY || 1)) * 80 + 10}%`;

        const pathPoints = pathResult?.path?.map(nodeId => {
            const prop = properties.find(p => p.location.id === nodeId);
            return prop ? { x: getX(prop.location.x), y: getY(prop.location.y) } : null;
        }).filter(Boolean);

        const pathD = pathPoints?.length > 1
            ? `M ${pathPoints.map(p => `${p.x.replace('%', '')} ${p.y.replace('%', '')}`).join(' L ')}`
            : '';

        return (
            <div className="glass-card min-h-[600px] relative overflow-hidden bg-slate-900/40 p-8 md:p-12">
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <Navigation className="text-primary" /> Distance Map & Pathfinding
                            </h3>
                            <p className="text-xs text-dim mt-1">Select two properties to calculate the shortest distance</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <select
                                className="bg-slate-950/40 border border-glass px-3 py-1.5 rounded-lg text-[10px] font-bold outline-none"
                                value={algorithm}
                                onChange={(e) => setAlgorithm(e.target.value)}
                            >
                                <option value="astar">A* Algorithm</option>
                                <option value="dijkstra">Dijkstra</option>
                            </select>
                            <button
                                onClick={clearPath}
                                className="px-4 py-1.5 rounded-lg bg-white/5 border border-glass text-[10px] font-bold hover:bg-white/10 transition-colors"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3">
                            <div className="relative w-full h-[450px] glass bg-slate-950/20 rounded-2xl overflow-hidden border-dashed">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
                                    {Array.from({ length: 100 }).map((_, i) => (
                                        <div key={i} className="border-[0.5px] border-white/5" />
                                    ))}
                                </div>

                                {/* Property Markers */}
                                {properties.map((p) => {
                                    const data = heatmapData.find(h => h.nodeId === p.location.id) || { intensity: 'low' };
                                    const colorMap = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--accent)' };
                                    const isSelected = selectedStart?._id === p._id || selectedEnd?._id === p._id;
                                    const isInPath = pathResult?.path?.includes(p.location.id);

                                    return (
                                        <motion.div
                                            key={p._id}
                                            className="absolute cursor-pointer group"
                                            style={{ left: getX(p.location.x), top: getY(p.location.y) }}
                                            onClick={() => handleNodeClick(p)}
                                        >
                                            <div className="relative">
                                                <motion.div
                                                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl opacity-20`}
                                                    style={{ width: 60, height: 60, backgroundColor: isSelected ? 'var(--primary)' : colorMap[data.intensity] }}
                                                    animate={isSelected ? { scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] } : {}}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                />
                                                <div
                                                    className={`relative -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-2xl flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125 border-white bg-primary z-30' : 'border-white/40 bg-slate-800'}`}
                                                    style={{ backgroundColor: !isSelected ? colorMap[data.intensity] : undefined }}
                                                >
                                                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                </div>

                                                {/* Tooltip */}
                                                <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-slate-900/95 p-3 rounded-xl border border-glass shadow-2xl whitespace-nowrap z-20 min-w-[140px]">
                                                    <p className="text-[10px] font-black tracking-tighter text-white uppercase mb-1">{p.title}</p>
                                                    <p className="text-[9px] text-dim flex items-center justify-between">
                                                        <span>₹{p.price}/hr</span>
                                                        <span style={{ color: colorMap[data.intensity] }}>{data.intensity.toUpperCase()}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                {/* Path Visualization */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    {pathResult && (
                                        <motion.path
                                            d={pathD.replace(/%/g, '')}
                                            stroke="var(--primary)"
                                            strokeWidth="0.5"
                                            fill="none"
                                            strokeDasharray="1,1"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 2 }}
                                        />
                                    )}
                                </svg>
                            </div>
                        </div>

                        {/* Distances Panel */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="glass p-6 rounded-2xl border-none bg-slate-950/40 h-full flex flex-col">
                                <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-6">Selection Summary</h4>

                                <div className="space-y-6 flex-1">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-dim font-bold uppercase">From (Start):</p>
                                        <div className={`p-3 rounded-xl border transition-all ${selectedStart ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-dashed border-white/10'}`}>
                                            <p className="text-xs font-bold truncate">{selectedStart?.title || 'Select a property'}</p>
                                            <p className="text-[9px] text-dim">{selectedStart ? `Node: ${selectedStart.location.id}` : 'Click on a marker'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] text-dim font-bold uppercase">To (Destination):</p>
                                        <div className={`p-3 rounded-xl border transition-all ${selectedEnd ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-dashed border-white/10'}`}>
                                            <p className="text-xs font-bold truncate">{selectedEnd?.title || 'Select second property'}</p>
                                            <p className="text-[9px] text-dim">{selectedEnd ? `Node: ${selectedEnd.location.id}` : 'Click on another marker'}</p>
                                        </div>
                                    </div>

                                    {pathLoading && (
                                        <div className="flex items-center gap-2 py-4">
                                            <Loader2 size={14} className="animate-spin text-primary" />
                                            <span className="text-[10px] font-bold animate-pulse">CALCULATING ROUTE...</span>
                                        </div>
                                    )}

                                    {pathResult && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-glass">
                                            <div>
                                                <p className="text-[10px] text-dim font-bold uppercase mb-2">Results:</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-slate-900 border border-glass p-3 rounded-xl">
                                                        <p className="text-[9px] text-dim font-black uppercase mb-1">Distance</p>
                                                        <p className="text-lg font-mono font-bold text-accent">{pathResult.distance?.toFixed(2)}<span className="text-[10px] ml-1">km</span></p>
                                                    </div>
                                                    <div className="bg-slate-900 border border-glass p-3 rounded-xl">
                                                        <p className="text-[9px] text-dim font-black uppercase mb-1">Execution</p>
                                                        <p className="text-lg font-mono font-bold text-warning">{pathResult.executionTime}<span className="text-[10px] ml-1">ms</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-primary/5 p-3 rounded-xl border border-primary/20">
                                                <p className="text-[9px] text-primary font-black uppercase mb-1">Optimal Path</p>
                                                <p className="text-[10px] font-bold line-clamp-2">{pathResult.path?.join(' → ')}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {!selectedStart && !selectedEnd && (
                                    <div className="mt-auto pt-6 flex items-center gap-3 text-dim italic">
                                        <Info size={14} />
                                        <p className="text-[9px]">Click markers to start measuring distance.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Find Properties</h1>
                    <p className="admin-subtitle">Showing {properties.length} available properties matching your search</p>
                </div>
                <div className="admin-header-actions">
                    <div className="admin-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                        <button
                            className={`admin-tab ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={16} /> Grid
                        </button>
                        <button
                            className={`admin-tab ${viewMode === 'map' ? 'active' : ''}`}
                            onClick={() => setViewMode('map')}
                        >
                            <MapIcon size={16} /> Map
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="admin-card" style={{ marginBottom: '24px', padding: '16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            className="glass-input w-full pl-12"
                            style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}
                            placeholder="Search by name, location, or type..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-[10px] font-black tracking-widest text-muted uppercase">Sort by</span>
                        <select
                            className="bg-background border border-glass px-4 py-2 rounded-xl text-xs font-bold text-main outline-none hover:border-primary transition-colors cursor-pointer"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                        >
                            <option value="rank">⭐ Best Match</option>
                            <option value="price">💰 Price: Low to High</option>
                            <option value="rating">🛡️ Highest Rated</option>
                            <option value="distance">📍 Nearest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-dim animate-pulse">Loading properties...</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProperties.map((p, i) => (
                        <motion.div
                            key={p._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="admin-card"
                            style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ position: 'relative', height: '160px' }}>
                                <img
                                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400'}
                                    alt={p.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {calculateRankScore(p) > 0.8 && (
                                    <div style={{
                                        position: 'absolute', top: 12, right: 12,
                                        background: 'rgba(245, 158, 11, 0.9)',
                                        color: '#fff', padding: '4px 8px', borderRadius: '4px',
                                        fontSize: '0.65rem', fontWeight: 800
                                    }}>
                                        TOP RATED
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '20px', flex: 1 }}>
                                <div style={{ marginBottom: '12px' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                        {p.title}
                                        <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>₹{p.price}/hr</span>
                                    </h3>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {p.location.id}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={12} className="text-warning fill-warning" /> {p.rating || '4.5'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--card-border)' }}>
                                    <div>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Type</p>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>{p.type || 'Apartment'}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/customer/booking/${p._id}`)}
                                        className="admin-refresh-btn"
                                        style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '6px 16px' }}
                                    >
                                        Details <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <MapView />
                </div>
            )}
        </div>
    );
};

export default SearchResults;
