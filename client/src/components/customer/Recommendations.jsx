import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import {
    Sparkles, MapPin, Loader2, Zap,
    TrendingUp, ChevronRight,
    Star, Building, Clock, Heart, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Recommendations = ({ user }) => {
    const navigate = useNavigate();
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalProperties, setTotalProperties] = useState(0);
    const [hoveredId, setHoveredId] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await api.get('/api/properties');
                const allProps = res.data;
                setTotalProperties(allProps.length);

                // BFS Similarity Graph
                const adjList = {};
                allProps.forEach(p => {
                    adjList[p._id] = allProps.filter(o =>
                        o._id !== p._id && (o.type === p.type || o.location.id === p.location.id)
                    ).map(o => o._id);
                });

                const seedId = allProps[0]?._id;
                const queue = [seedId];
                const visited = new Set([seedId]);
                const results = [];

                while (queue.length > 0 && results.length < 6) {
                    const currentId = queue.shift();
                    for (const nId of (adjList[currentId] || [])) {
                        if (!visited.has(nId)) {
                            visited.add(nId);
                            queue.push(nId);
                            const found = allProps.find(p => p._id === nId);
                            if (found) {
                                const connections = (adjList[nId] || []).length;
                                const maxConns = Math.max(...Object.values(adjList).map(a => a.length), 1);
                                results.push({ ...found, matchScore: Math.round(70 + (connections / maxConns) * 28) });
                            }
                            if (results.length >= 6) break;
                        }
                    }
                }

                setRecommended(results.length > 0 ? results : allProps.slice(0, 6).map(p => ({ ...p, matchScore: 75 })));
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchRecommendations();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-dim animate-pulse">Finding matches...</p>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight mb-1">Recommended for You</h1>
                    <p className="text-xs text-dim">Based on your preferences and booking history</p>
                </div>
                <button className="btn btn-secondary text-[10px] px-3 py-2" onClick={() => navigate('/customer/analytics')}>
                    <TrendingUp size={12} /> View Insights
                </button>
            </div>

            {/* Smart Match Banner */}
            <div className="glass-card bg-secondary/5 border-secondary/10 p-5 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-2.5 rounded-xl bg-secondary text-white shrink-0">
                        <Sparkles size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-secondary flex items-center gap-1.5">
                            <Zap size={12} /> Smart Matching Active
                        </h3>
                        <p className="text-[10px] text-dim mt-0.5 leading-relaxed">
                            Analyzing {totalProperties} properties to find the best spaces for you.
                        </p>
                    </div>
                    <div className="flex gap-6 shrink-0 hidden md:flex">
                        <div className="text-center">
                            <p className="text-[8px] font-bold text-dim uppercase tracking-widest">Analyzed</p>
                            <p className="text-lg font-extrabold">{totalProperties}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] font-bold text-dim uppercase tracking-widest">Matches</p>
                            <p className="text-lg font-extrabold text-accent">{recommended.length}</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-[0.04] text-secondary">
                    <TrendingUp size={64} />
                </div>
            </div>

            {/* Property Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommended.map((p, i) => (
                    <motion.div
                        key={p._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -3 }}
                        className="glass-card bg-slate-900/40 border-none p-0 overflow-hidden group cursor-pointer"
                        onMouseEnter={() => setHoveredId(p._id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => navigate(`/customer/booking/${p._id}`)}
                    >
                        {/* Color Top Bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-secondary/40 to-accent/30" />

                        <div className="p-5">
                            {/* Match Badge + Type */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[8px] font-bold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary uppercase tracking-wider">
                                    {p.matchScore}% match
                                </span>
                                <span className="text-[8px] font-bold text-dim uppercase tracking-wider">{p.type}</span>
                            </div>

                            {/* Title + Location */}
                            <h3 className="text-base font-bold mb-1.5 group-hover:text-primary transition-colors leading-tight line-clamp-1">{p.title}</h3>
                            <div className="flex items-center gap-1.5 text-[9px] text-dim mb-3">
                                <MapPin size={10} className="text-secondary" /> {p.location.id}
                            </div>

                            {/* Description */}
                            <p className="text-[10px] text-dim leading-relaxed line-clamp-2 mb-4">{p.description}</p>

                            {/* Price Row */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                                <div className="flex items-center gap-1.5">
                                    <Star size={10} className="text-warning fill-warning" />
                                    <span className="text-[9px] font-bold text-dim">{p.rating || '4.5'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-extrabold text-primary">₹{p.price}</span>
                                    <span className="text-[8px] text-dim font-bold ml-0.5">/hr</span>
                                </div>
                            </div>

                            {/* Hover CTA */}
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={hoveredId === p._id ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <button
                                    className="btn btn-primary w-full text-[9px] font-bold uppercase tracking-widest py-2 mt-3"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/customer/booking/${p._id}`); }}
                                >
                                    Book Now <ChevronRight size={10} />
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Explore More */}
            <div className="glass-card bg-primary/5 border-dashed p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h4 className="text-base font-bold mb-1">Explore more spaces</h4>
                    <p className="text-[10px] text-dim">
                        Browse all <span className="text-primary font-bold">{totalProperties}</span> available properties
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary text-[10px] px-4 py-2" onClick={() => window.location.reload()}>Refresh</button>
                    <button className="btn btn-primary text-[10px] px-4 py-2" onClick={() => navigate('/customer/search-results')}>Browse All</button>
                </div>
            </div>
        </motion.div>
    );
};

export default Recommendations;
