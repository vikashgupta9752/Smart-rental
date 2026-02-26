import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Calendar, CheckCircle2, XCircle, Clock, FileText,
    Download, Filter, Loader2, Star, Search,
    ArrowRight, MapPin, Hash, Activity, TrendingUp,
    Building, Timer, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BookingHistory = ({ user }) => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ totalHours: 0, uniqueProperties: 0, totalBookings: 0 });

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/stats/customer', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setBookings(res.data.bookings || []);
                setStats({
                    totalHours: res.data.totalHours || 0,
                    uniqueProperties: res.data.uniqueProperties || 0,
                    totalBookings: res.data.totalBookings || 0
                });
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchBookings();
    }, [user.token]);

    const statusConfig = {
        confirmed: { icon: Clock, color: 'text-primary', bg: 'bg-primary/10', label: 'ACTIVE', dot: 'bg-primary' },
        completed: { icon: CheckCircle2, color: 'text-accent', bg: 'bg-accent/10', label: 'COMPLETED', dot: 'bg-accent' },
        cancelled: { icon: XCircle, color: 'text-danger', bg: 'bg-danger/10', label: 'CANCELLED', dot: 'bg-danger' },
        pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'PENDING', dot: 'bg-warning' }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-dim animate-pulse">Loading bookings...</p>
        </div>
    );

    const filteredBookings = bookings.filter(b =>
        (filter === 'all' || b.status === filter) &&
        (b.property.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">My Bookings</h1>
                    <p className="admin-subtitle">
                        {bookings.length > 0 ? `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found` : 'No bookings yet'}
                    </p>
                </div>
                <div className="admin-header-actions">
                    <div className="admin-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                        {['all', 'confirmed', 'completed', 'cancelled'].map(s => (
                            <button
                                key={s}
                                className={`admin-tab ${filter === s ? 'active' : ''}`}
                                onClick={() => setFilter(s)}
                            >
                                {s === 'all' ? 'All' : s === 'confirmed' ? 'Active' : s === 'completed' ? 'Past' : 'Cancelled'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Strip */}
            <div className="admin-stats">
                {[
                    { label: 'Total Hours', value: stats.totalHours.toFixed(1), icon: Timer, color: '#6366f1' },
                    { label: 'Properties Visited', value: stats.uniqueProperties, icon: Building, color: '#10b981' },
                    { label: 'Total Bookings', value: stats.totalBookings, icon: BarChart3, color: '#f59e0b' }
                ].map(s => (
                    <div key={s.label} className="admin-stat-card">
                        <div className="admin-stat-icon-wrap" style={{ background: `${s.color}15`, color: s.color }}>
                            <s.icon size={18} />
                        </div>
                        <div className="admin-stat-content">
                            <p className="admin-stat-label">{s.label}</p>
                            <p className="admin-stat-value">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="admin-card" style={{ marginBottom: '24px', padding: '12px 20px' }}>
                <div style={{ position: 'relative' }}>
                    <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                        type="text"
                        className="glass-input w-full pl-8"
                        style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                        placeholder="Search by booking ID or property name..."
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Booking Cards */}
            {filteredBookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredBookings.map((booking, i) => {
                        const cfg = statusConfig[booking.status] || statusConfig.pending;
                        const StatusIcon = cfg.icon;
                        return (
                            <motion.div
                                key={booking._id || i}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="admin-card"
                                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '20px' }}
                            >
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px',
                                    background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-main)', border: '1px solid var(--card-border)'
                                }}>
                                    <StatusIcon size={20} />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px' }} className="truncate">{booking.property}</p>
                                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {booking.location}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Hash size={12} /> {booking.id}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Date</p>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>{booking.date}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Amount</p>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>₹{booking.price}</p>
                                    </div>
                                    <span className={`admin-status-pill ${booking.status === 'completed' ? 'verified' : booking.status === 'cancelled' ? 'failed' : 'pending'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="admin-card" style={{ padding: '60px', textCenter: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Calendar size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No bookings found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                        {search ? 'No results match your search term.' : 'You haven\'t made any bookings yet.'}
                    </p>
                    {!search && (
                        <button className="admin-refresh-btn" onClick={() => navigate('/customer/search-results')}>
                            Browse Properties
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingHistory;
