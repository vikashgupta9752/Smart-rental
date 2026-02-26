import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Search, Wallet, Calendar, Heart,
    Star, MapPin, TrendingUp, Sparkles,
    ArrowRight, Home, ChevronRight, Eye, Clock, CreditCard, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const CustomerPanel = ({ user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/stats/customer', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStats(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [user.token]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const quickLinks = [
        { icon: Heart, label: 'Wishlists', desc: 'Your saved places', path: '/customer/saved', color: '#f59e0b' },
        { icon: Calendar, label: 'Bookings', desc: 'Trips & reservations', path: '/customer/bookings', color: '#6366f1' },
        {
            icon: CreditCard, label: 'Payments', desc: 'UPI & Card methods',
            onClick: () => setShowPaymentModal(true), color: '#10b981'
        },
        { icon: Home, label: 'Browse', desc: 'Explore all listings', path: '/browse', color: '#8b5cf6' },
    ];

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Welcome back, {(user.name || 'Guest').split(' ')[0]}</h1>
                    <p className="admin-subtitle">Your personal dashboard overview</p>
                </div>
                <div className="admin-header-actions">
                    <button className="admin-refresh-btn" onClick={fetchStats}>
                        <Clock size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="admin-stats">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.08)', color: '#6366f1' }}>
                        <Calendar size={20} />
                    </div>
                    <div className="admin-stat-content">
                        <p className="admin-stat-label">Active trips</p>
                        <p className="admin-stat-value">{stats?.activeRentals || 0}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
                        <Heart size={20} />
                    </div>
                    <div className="admin-stat-content">
                        <p className="admin-stat-label">Saved places</p>
                        <p className="admin-stat-value">{stats?.wishlistCount || 0}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}>
                        <TrendingUp size={20} />
                    </div>
                    <div className="admin-stat-content">
                        <p className="admin-stat-label">Total spent</p>
                        <p className="admin-stat-value">₹{stats?.totalSpent?.toLocaleString() || '0'}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap" style={{ background: 'rgba(230, 30, 77, 0.08)', color: '#E61E4D' }}>
                        <Star size={20} />
                    </div>
                    <div className="admin-stat-content">
                        <p className="admin-stat-label">Reviews given</p>
                        <p className="admin-stat-value">{stats?.reviewsGiven || 0}</p>
                    </div>
                </div>
            </div>

            {/* Quick Access Grid */}
            <div className="admin-card" style={{ marginBottom: '24px' }}>
                <h3 className="admin-card-title">Quick Actions</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                }}>
                    {quickLinks.map((q, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -2 }}
                            onClick={() => q.onClick ? q.onClick() : navigate(q.path)}
                            style={{
                                cursor: 'pointer',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'var(--background-alt)',
                                border: '1px solid var(--card-border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                background: `${q.color}15`, color: q.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <q.icon size={20} />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{q.label}</p>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{q.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Grid */}
            <div className="admin-overview-grid">
                {/* Recent Bookings */}
                <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Recent Bookings</h3>
                        <Link to="/customer/bookings" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>See all</Link>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {stats?.bookings?.length > 0 ? (
                            stats.bookings.slice(0, 4).map((b, i) => (
                                <div key={i} className="admin-activity-row" style={{ padding: '10px 0' }}>
                                    <div className="admin-activity-icon" style={{ background: 'var(--surface)' }}>
                                        <MapPin size={14} />
                                    </div>
                                    <div className="admin-activity-info">
                                        <p className="admin-activity-text">
                                            <span style={{ fontWeight: 700 }}>{b.property}</span>
                                            <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>₹{b.price?.toFixed(0)}</span>
                                        </p>
                                        <p className="admin-activity-time">{b.location}</p>
                                    </div>
                                    <span className={`admin-status-pill ${b.status === 'completed' ? 'verified' : 'pending'}`} style={{ fontSize: '0.65rem' }}>
                                        {b.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                                <Calendar size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                <p style={{ fontSize: '0.85rem' }}>No recent bookings</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Travel Tips */}
                <div className="admin-card">
                    <h3 className="admin-card-title">Travel Smart</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { title: 'Save on weekdays', desc: 'Book Monday–Thursday to save up to 18% on your stay.', icon: TrendingUp, color: '#10b981' },
                            { title: 'Explore neighborhoods', desc: 'Properties slightly outside city centers offer great value.', icon: MapPin, color: '#6366f1' },
                            { title: 'Early bird deals', desc: 'Book 2+ weeks ahead for the best rates and availability.', icon: Sparkles, color: '#f59e0b' },
                        ].map((tip, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '8px', background: 'var(--background-alt)' }}>
                                <div style={{ color: tip.color }}><tip.icon size={18} /></div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{tip.title}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{tip.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment Methods Modal Placeholder */}
            {showPaymentModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 100,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        style={{
                            background: 'var(--card-bg)', padding: '32px', borderRadius: '24px',
                            width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                            border: '1px solid var(--card-border)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Payment methods</h3>
                            <button onClick={() => setShowPaymentModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                                <CreditCard size={20} />
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>Credit/Debit Card</p>
                                    <p style={{ fontSize: '0.7rem' }}>Enable direct card payments</p>
                                </div>
                            </div>
                            <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>UPI</span>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.85rem' }}>Google Pay / PhonePe</p>
                                    <p style={{ fontSize: '0.7rem' }}>Pay directly via UPI ID</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', padding: '12px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <Sparkles size={16} style={{ marginTop: '2px', shrink: 0 }} />
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.4 }}>These methods are currently being integrated for live transactions.</p>
                        </div>

                        <button
                            onClick={() => setShowPaymentModal(false)}
                            style={{ width: '100%', marginTop: '24px', padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                        >
                            Got it
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default CustomerPanel;
