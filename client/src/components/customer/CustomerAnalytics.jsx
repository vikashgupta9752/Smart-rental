import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, CreditCard, Award, Loader2, MapPin, Clock, BarChart3, ArrowUpRight, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomerAnalytics = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartView, setChartView] = useState('area');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/stats/customer', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, [user.token]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-dim animate-pulse">Loading analytics...</p>
        </div>
    );

    const spendingData = stats?.spendingByDay || [];
    const typeBreakdown = stats?.typeBreakdown || [];
    const hasData = spendingData.some(d => d.spend > 0);

    const avgSpend = stats?.totalBookings > 0 ? Math.round(stats.totalSpent / stats.totalBookings) : 0;
    const peakDay = spendingData.reduce((max, d) => d.spend > max.spend ? d : max, { name: '-', spend: 0 });
    const completionRate = stats?.totalBookings > 0
        ? Math.round(((stats.totalBookings - (stats.activeRentals || 0)) / stats.totalBookings) * 100) : 0;

    const summaryCards = [
        { label: 'Total Spent', value: `₹${(stats?.totalSpent || 0).toLocaleString()}`, icon: TrendingUp, color: 'primary', sub: `${stats?.totalBookings || 0} bookings` },
        { label: 'Avg per Booking', value: `₹${avgSpend.toLocaleString()}`, icon: Award, color: 'accent', sub: 'per transaction' },
        { label: 'Peak Day', value: peakDay.name, icon: Calendar, color: 'secondary', sub: `₹${peakDay.spend} spent` },
        { label: 'Completion', value: `${completionRate}%`, icon: CreditCard, color: 'warning', sub: 'bookings completed' },
    ];

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Analytics</h1>
                    <p className="admin-subtitle">Your booking and spending insights</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="admin-stats">
                {summaryCards.map((c, i) => (
                    <div key={c.label} className="admin-stat-card">
                        <div className="admin-stat-icon-wrap" style={{ background: `var(--${c.color}-light)`, color: `var(--${c.color})` }}>
                            <c.icon size={18} />
                        </div>
                        <div className="admin-stat-content">
                            <p className="admin-stat-label">{c.label}</p>
                            <p className="admin-stat-value">{c.value}</p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>{c.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Spending Chart */}
                <div className="lg:col-span-8 admin-card" style={{ padding: '24px' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={18} className="text-primary" />
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Spending by Day</h3>
                        </div>
                        {hasData && (
                            <div className="admin-tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
                                {[{ v: 'area', label: 'Area' }, { v: 'bar', label: 'Bar' }].map(o => (
                                    <button
                                        key={o.v}
                                        className={`admin-tab ${chartView === o.v ? 'active' : ''}`}
                                        onClick={() => setChartView(o.v)}
                                    >{o.label}</button>
                                ))}
                            </div>
                        )}
                    </div>
                    {hasData ? (
                        <ResponsiveContainer width="100%" height={260}>
                            {chartView === 'area' ? (
                                <AreaChart data={spendingData}>
                                    <defs>
                                        <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', fontSize: '11px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
                                        formatter={(value) => [`₹${value}`, 'Spent']}
                                    />
                                    <Area type="monotone" dataKey="spend" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                                </AreaChart>
                            ) : (
                                <BarChart data={spendingData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', fontSize: '11px' }}
                                        itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
                                        formatter={(value) => [`₹${value}`, 'Spent']}
                                    />
                                    <Bar dataKey="spend" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[260px] text-muted">
                            <BarChart3 size={32} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No spending data yet</p>
                            <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Book properties to see your insights.</p>
                        </div>
                    )}
                </div>

                {/* Booking Type Breakdown */}
                <div className="lg:col-span-4 admin-card" style={{ padding: '24px' }}>
                    <div className="flex items-center gap-2 mb-6">
                        <PieChart size={18} className="text-secondary" />
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Booking Types</h3>
                    </div>
                    {typeBreakdown.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {typeBreakdown.map((item, i) => {
                                const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#ef4444'];
                                const color = colors[i % colors.length];
                                return (
                                    <div key={item.type}>
                                        <div style={{ display: 'flex', justifyContent: 'between', fontSize: '0.75rem', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 700 }}>{item.type}</span>
                                            <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.percentage}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'var(--surface)', borderRadius: '10px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.percentage}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                style={{ height: '100%', background: color, borderRadius: '10px' }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px' }}>{item.count} booking{item.count !== 1 ? 's' : ''}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[240px] text-muted">
                            <Clock size={28} style={{ opacity: 0.1, marginBottom: '16px' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No data yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerAnalytics;
