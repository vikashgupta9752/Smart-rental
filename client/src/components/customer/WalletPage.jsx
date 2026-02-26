import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Wallet, Plus, ArrowUpRight, ArrowDownLeft,
    History, CreditCard, Loader2, TrendingUp, ShieldCheck,
    Zap, RefreshCw, X, CheckCircle2, Share2, IndianRupee,
    ArrowRight, Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WalletPage = ({ user }) => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [addAmount, setAddAmount] = useState('');
    const [addingFunds, setAddingFunds] = useState(false);
    const [txFilter, setTxFilter] = useState('all');
    const [stats, setStats] = useState({ totalSpent: 0, totalBookings: 0 });

    const fetchWallet = useCallback(async (showRefreshAnimation = false) => {
        if (showRefreshAnimation) setRefreshing(true);
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/stats/customer', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBalance(res.data.wallet);
            setStats({ totalSpent: res.data.totalSpent || 0, totalBookings: res.data.totalBookings || 0 });
            const bookingTx = (res.data.bookings || []).map(b => ({
                id: b._id, type: 'debit', amount: b.price, desc: b.property, date: b.date, status: b.status === 'cancelled' ? 'refunded' : 'completed'
            }));
            setTransactions(bookingTx);
        } catch (err) { console.error(err); }
        finally { setLoading(false); if (showRefreshAnimation) setTimeout(() => setRefreshing(false), 600); }
    }, [user.token]);

    useEffect(() => { fetchWallet(); }, [fetchWallet]);

    const handleAddFunds = async () => {
        const amount = parseFloat(addAmount);
        if (!amount || amount <= 0) return;
        setAddingFunds(true);
        try {
            const res = await axios.post('http://127.0.0.1:5000/api/wallet/add', { amount }, { headers: { Authorization: `Bearer ${user.token}` } });
            setBalance(res.data.wallet);
            setAddAmount(''); setShowAddFunds(false);
        } catch (err) { console.error(err); }
        finally { setAddingFunds(false); }
    };

    const handleShare = () => {
        const text = `Check out SpaceRent for property rentals! ${window.location.origin}`;
        if (navigator.share) navigator.share({ title: 'SpaceRent', text });
        else navigator.clipboard.writeText(text);
    };

    const filteredTx = transactions.filter(t => {
        if (txFilter === 'all') return true;
        if (txFilter === 'payments') return t.type === 'debit';
        if (txFilter === 'topups') return t.type === 'credit';
        return true;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-dim animate-pulse">Loading wallet...</p>
        </div>
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '8px' }}>Payments & payouts</h1>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Secure wallet managed by the SmartRental platform</p>
                </div>
                <button
                    onClick={() => fetchWallet(true)}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem',
                        fontWeight: 600, color: 'var(--text-main)', padding: '8px 12px',
                        borderRadius: '8px', transition: 'background 0.2s'
                    }}
                    className="hover:bg-surface"
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    Refresh balance
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '64px', alignItems: 'start' }}>
                {/* Left Side: Balance & Add Money */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Balance Card */}
                    <div style={{
                        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                        borderRadius: '24px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Available Balance</p>
                                <motion.p
                                    key={balance}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}
                                >
                                    ₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </motion.p>
                            </div>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                <Wallet size={28} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button
                                onClick={() => setShowAddFunds(true)}
                                style={{
                                    background: 'var(--primary)', color: '#fff', border: 'none',
                                    padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
                                    cursor: 'pointer', transition: 'transform 0.2s'
                                }}
                                className="hover:scale-[1.02]"
                            >
                                <Plus size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Add funds
                            </button>
                            <button
                                style={{
                                    background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--card-border)',
                                    padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <CreditCard size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Methods
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Strip */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ padding: '24px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Total Spent</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{stats.totalSpent.toLocaleString()}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Across {stats.totalBookings} bookings</p>
                        </div>
                        <div style={{ padding: '24px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--card-border)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Security</p>
                            <p style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)' }}>
                                <ShieldCheck size={16} /> Encrypted
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Level 3 verification</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Transactions */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent activity</h2>
                        <select
                            style={{
                                background: 'transparent', border: '1px solid var(--card-border)',
                                padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem',
                                fontWeight: 600, outline: 'none', cursor: 'pointer'
                            }}
                            value={txFilter} onChange={e => setTxFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="payments">Payments</option>
                            <option value="topups">Top-ups</option>
                        </select>
                    </div>

                    {filteredTx.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--card-border)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                            {filteredTx.map((t, i) => (
                                <div key={t.id} style={{ background: 'var(--card-bg)', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: t.type === 'debit' ? '#fff1f2' : '#f0fdf4',
                                        color: t.type === 'debit' ? '#e11d48' : '#16a34a',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {t.type === 'debit' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.85rem' }} className="truncate">{t.desc}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.date}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 800, fontSize: '0.9rem', color: t.type === 'debit' ? 'var(--text-main)' : 'var(--accent)' }}>
                                            {t.type === 'debit' ? '-' : '+'}₹{t.amount?.toFixed(2)}
                                        </p>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: '60px', textAlign: 'center', background: 'var(--surface)',
                            borderRadius: '16px', border: '1px dashed var(--card-border)'
                        }}>
                            <Receipt size={32} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>No transactions yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Funds Modal */}
            <AnimatePresence>
                {showAddFunds && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowAddFunds(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            style={{
                                background: '#fff', width: '100%', maxWidth: '400px',
                                position: 'relative', zIndex: 10, borderRadius: '24px',
                                padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>Add money</h3>
                                <button onClick={() => setShowAddFunds(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#666', display: 'block', marginBottom: '12px' }}>Amount to add</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, fontSize: '1.5rem', color: '#111' }}>₹</span>
                                    <input
                                        type="number"
                                        style={{
                                            width: '100%', padding: '16px 16px 16px 40px', borderRadius: '12px',
                                            border: '1px solid #ddd', fontSize: '1.5rem', fontWeight: 800, color: '#111',
                                            outline: 'none', background: '#f9f9f9'
                                        }}
                                        placeholder="0" value={addAmount}
                                        onChange={e => setAddAmount(e.target.value)} min="1" autoFocus
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '32px' }}>
                                {[500, 1000, 2000, 5000].map(amt => (
                                    <button
                                        key={amt}
                                        style={{
                                            padding: '10px 0', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800,
                                            border: addAmount === String(amt) ? '2px solid #111' : '1px solid #ddd',
                                            background: addAmount === String(amt) ? '#111' : '#fff',
                                            color: addAmount === String(amt) ? '#fff' : '#111',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setAddAmount(String(amt))}
                                    >₹{amt >= 1000 ? `${amt / 1000}k` : amt}</button>
                                ))}
                            </div>

                            <button
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '12px', background: '#e11d48',
                                    color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                                disabled={!addAmount || parseFloat(addAmount) <= 0 || addingFunds}
                                onClick={handleAddFunds}
                            >
                                {addingFunds ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={18} /> Confirm deposit</>}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalletPage;
