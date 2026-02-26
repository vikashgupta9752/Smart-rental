import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Home, IndianRupee, Calendar, Star, Users,
    TrendingUp, MapPin, Clock, MessageCircle,
    CheckCircle, Bell, ChevronRight, Search,
    Eye, Trash2, MoreHorizontal, ArrowUpRight,
    BarChart2, Bookmark, Shield, Settings,
    BedDouble, Bath, UserCheck, AlertCircle,
    Edit3, X, Save, Loader2, Image, Plus,
    ShieldAlert, UserX, Flag, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminPanel = ({ user }) => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('today');
    const [properties, setProperties] = useState([]);
    const [adminStats, setAdminStats] = useState({ metrics: {}, bookings: [], reviews: [] });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals & Actions
    const [editingProperty, setEditingProperty] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // New Data State
    const [pendingProperties, setPendingProperties] = useState([]);
    const [reports, setReports] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'info' });
    const [resolvingReport, setResolvingReport] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${user.token}` };
            const [propRes, statsRes, reportsRes, announceRes] = await Promise.all([
                axios.get('http://127.0.0.1:5000/api/properties', { headers }),
                axios.get('http://127.0.0.1:5000/api/stats/admin', { headers }),
                axios.get('http://127.0.0.1:5000/api/reports', { headers }),
                axios.get('http://127.0.0.1:5000/api/announcements', { headers })
            ]);

            const allProps = propRes.data || [];
            setProperties(allProps);
            setPendingProperties(allProps.filter(p => p.verificationStatus === 'pending'));
            setAdminStats(statsRes.data || { metrics: {}, bookings: [], reviews: [] });
            setReports(reportsRes.data || []);
            setAnnouncements(announceRes.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleUpdateBookingStatus = async (bookingId, status) => {
        setStatusUpdating(bookingId);
        try {
            await axios.put(`http://127.0.0.1:5000/api/bookings/${bookingId}/status`, { status }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to update status: ' + (err.response?.data?.error || err.message));
        }
        finally { setStatusUpdating(null); }
    };

    const handleEdit = (property) => {
        setEditingProperty(property);
        setEditForm({
            title: property.title || '',
            description: property.description || '',
            type: property.type || 'apartment',
            price: property.price || 0,
            bedrooms: property.bedrooms || 1,
            bathrooms: property.bathrooms || 1,
            maxGuests: property.maxGuests || 2,
            images: property.images || [],
            amenities: property.amenities || [],
            city: property.location?.city || '',
            address: property.location?.address || '',
            status: property.status || 'available',
        });
    };

    const handleSave = async () => {
        if (!editingProperty) return;
        setSaving(true);
        try {
            const updateData = {
                title: editForm.title,
                description: editForm.description,
                type: editForm.type,
                price: Number(editForm.price),
                bedrooms: Number(editForm.bedrooms),
                bathrooms: Number(editForm.bathrooms),
                maxGuests: Number(editForm.maxGuests),
                images: editForm.images,
                amenities: editForm.amenities,
                status: editForm.status,
                location: {
                    ...editingProperty.location,
                    city: editForm.city,
                    address: editForm.address,
                },
            };
            await axios.put(`http://127.0.0.1:5000/api/properties/${editingProperty._id}`, updateData, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEditingProperty(null);
            fetchData();
        } catch (err) { console.error(err); alert('Failed to save changes'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this property permanently?')) return;
        try {
            await axios.delete(`http://127.0.0.1:5000/api/properties/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setDeleteConfirm(null);
            fetchData();
        } catch (err) { console.error(err); alert('Failed to delete property'); }
    };

    const handleVerifyProperty = async (id, status) => {
        try {
            await axios.put(`http://127.0.0.1:5000/api/properties/${id}/verify`, { status }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchData();
        } catch (err) { console.error(err); alert('Failed to verify property'); }
    };

    const handleResolveReport = async (reportId, status, notes = '') => {
        try {
            await axios.put(`http://127.0.0.1:5000/api/reports/${reportId}/resolve`, {
                status,
                resolutionNotes: notes
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchData();
            setResolvingReport(null);
        } catch (err) { console.error(err); alert('Failed to resolve report'); }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:5000/api/announcements', newAnnouncement, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNewAnnouncement({ title: '', content: '', type: 'info' });
            fetchData();
        } catch (err) { console.error(err); alert('Failed to create announcement'); }
    };

    const handleDeleteAnnouncement = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/api/announcements/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchData();
        } catch (err) { console.error(err); alert('Failed to delete announcement'); }
    };

    const handleToggleAnnouncement = async (id, isActive) => {
        try {
            await axios.put(`http://127.0.0.1:5000/api/announcements/${id}`, { isActive }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchData();
        } catch (err) { console.error(err); alert('Toggle failed'); }
    };

    const handleImageAdd = () => {
        const url = prompt('Enter image URL:');
        if (url) setEditForm(prev => ({ ...prev, images: [...prev.images, url] }));
    };

    const handleImageRemove = (index) => {
        setEditForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleAmenityAdd = () => {
        const amenity = prompt('Enter amenity name:');
        if (amenity) setEditForm(prev => ({ ...prev, amenities: [...prev.amenities, amenity] }));
    };

    const handleAmenityRemove = (index) => {
        setEditForm(prev => ({ ...prev, amenities: prev.amenities.filter((_, i) => i !== index) }));
    };

    const totalListings = adminStats.metrics.totalSpaces || properties.length;
    const totalRevenue = adminStats.metrics.revenue || 0;
    const avgRating = totalListings > 0
        ? (properties.reduce((s, p) => s + (p.rating || 0), 0) / properties.length).toFixed(2)
        : '0.00';
    const totalReviews = adminStats.metrics.totalReviews || properties.reduce((s, p) => s + (p.reviewCount || 0), 0);

    const upcomingReservations = (adminStats.bookings || []).slice(0, 10).map(b => ({
        id: b._id,
        propertyId: b.property?._id,
        property: b.property?.title || 'Unknown space',
        guest: b.customer?.name || 'Guest',
        avatar: b.customer?.avatar || '',
        customer: b.customer,
        checkIn: new Date(b.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        checkOut: new Date(b.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        guests: b.guests || 1,
        total: b.totalPrice || 0,
        status: b.status,
    }));

    const todayTasks = [
        { icon: UserCheck, label: 'Confirm check-in', desc: upcomingReservations.find(r => r.status === 'pending')?.guest || 'No pending check-ins', badge: upcomingReservations.filter(r => r.status === 'pending').length || '', color: '#E61E4D' },
        { icon: BedDouble, label: 'Manage listings', desc: `${totalListings} active spaces currently live`, badge: '', color: '#6366f1' },
        { icon: TrendingUp, label: 'Growth', desc: `${adminStats.metrics.totalUsers || 0} registered users`, badge: '', color: '#10b981' },
    ];

    const topListings = [...properties].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

    const earningsData = [
        { month: 'Estimated Revenue', amount: totalRevenue, change: 'Lifetime' },
    ];

    const sections = [
        { id: 'today', label: 'Today' },
        { id: 'listings', label: 'Listings' },
        { id: 'approvals', label: 'Approvals' },
        { id: 'reports', label: 'Reports' },
        { id: 'announcements', label: 'Announcements' },
        { id: 'security', label: 'Security' },
        { id: 'reviews', label: 'Reviews' },
    ];

    const [users, setUsers] = useState([]);
    const [userLoading, setUserLoading] = useState(false);

    const fetchUsers = async () => {
        setUserLoading(true);
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/users', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setUsers(res.data);
        } catch (err) { console.error(err); }
        finally { setUserLoading(false); }
    };

    useEffect(() => {
        if (activeSection === 'security') fetchUsers();
    }, [activeSection]);

    const handleUserAction = async (userId, action, data = {}) => {
        try {
            const headers = { Authorization: `Bearer ${user.token}` };
            if (action === 'verify') {
                await axios.put(`http://127.0.0.1:5000/api/users/${userId}/verify`, data, { headers });
            } else if (action === 'block') {
                await axios.put(`http://127.0.0.1:5000/api/users/${userId}/block`, {}, { headers });
            } else if (action === 'flag') {
                await axios.put(`http://127.0.0.1:5000/api/users/${userId}/flag`, {}, { headers });
            }
            fetchUsers();
        } catch (err) { console.error(err); alert('Action failed'); }
    };

    useEffect(() => {
        if (activeSection === 'security') fetchUsers();
    }, [activeSection]);

    const filteredProperties = properties.filter(p =>
        !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const recentReviews = (adminStats.reviews || []).slice(0, 10).map(r => ({
        guest: r.user?.name || 'Anonymous',
        property: r.property?.title || 'Unknown space',
        rating: r.rating || 5,
        comment: r.comment,
        date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    }));

    const propertyTypes = ['room', 'shop', 'parking', 'land', 'apartment', 'house', 'studio'];

    return (
        <div className="admin-page">
            {/* Welcome */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Welcome back, {user?.name || 'Admin'}</h1>
                    <p className="admin-subtitle">Here's what's happening with your properties today</p>
                </div>
                <div className="admin-header-actions">
                    <button className="admin-notif-btn" title="Notifications" onClick={() => alert('No new notifications 🔔')}>
                        <Bell size={18} />
                        <span className="admin-notif-dot" />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="admin-stats">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap" style={{ background: 'rgba(230,30,77,0.08)', color: '#E61E4D' }}>
                        <Home size={20} />
                    </div>
                    <div className="admin-stat-content">
                        <p className="admin-stat-label">Active listings</p>
                        <p className="admin-stat-value">{totalListings}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981' }}>
                        <IndianRupee size={20} />
                    </div>
                    <div className="admin-stat-content">
                        <p className="admin-stat-label">Total earnings</p>
                        <p className="admin-stat-value">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <span className="admin-stat-trend up"><TrendingUp size={12} /> +18%</span>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap" style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b' }}>
                        <Star size={20} />
                    </div>
                    <div className="admin-stat-content">
                        <p className="admin-stat-label">Overall rating</p>
                        <p className="admin-stat-value">{avgRating} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({totalReviews})</span></p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap" style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>
                        <Calendar size={20} />
                    </div>
                    <div className="admin-stat-content">
                        <p className="admin-stat-label">Upcoming bookings</p>
                        <p className="admin-stat-value">{upcomingReservations.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
                {sections.map(s => (
                    <button
                        key={s.id}
                        className={`admin-tab ${activeSection === s.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(s.id)}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* === TODAY === */}
            {activeSection === 'today' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
                    <div className="admin-two-col">
                        <div className="admin-card">
                            <h3 className="admin-card-title">Your to-do list</h3>
                            <p className="admin-card-desc">Tasks that need your attention</p>
                            <div className="admin-todo-list">
                                {todayTasks.map((t, i) => (
                                    <div key={i} className="admin-todo-item" onClick={() => {
                                        if (t.label === 'Confirm check-in') setActiveSection('reservations');
                                        if (t.label === 'Manage listings') setActiveSection('listings');
                                        if (t.label === 'Growth') setActiveSection('earnings');
                                    }} style={{ cursor: 'pointer' }}>
                                        <div className="admin-todo-icon" style={{ background: `${t.color}12`, color: t.color }}>
                                            <t.icon size={16} />
                                        </div>
                                        <div className="admin-todo-info">
                                            <p className="admin-todo-label">{t.label}</p>
                                            <p className="admin-todo-desc">{t.desc}</p>
                                        </div>
                                        {t.badge && <span className="admin-todo-badge">{t.badge}</span>}
                                        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="admin-card">
                            <h3 className="admin-card-title">Next check-in</h3>
                            <p className="admin-card-desc">Arriving soon</p>
                            {upcomingReservations.length > 0 ? (
                                <div className="admin-checkin-card">
                                    <div className="admin-checkin-guest">
                                        <div className="admin-checkin-avatar">{upcomingReservations[0].guest.charAt(0)}</div>
                                        <div>
                                            <p className="admin-checkin-name">{upcomingReservations[0].guest}</p>
                                            <p className="admin-checkin-dates">{upcomingReservations[0].checkIn} – {upcomingReservations[0].checkOut}</p>
                                        </div>
                                        <span className={`admin-status-pill ${upcomingReservations[0].status}`}>{upcomingReservations[0].status}</span>
                                    </div>
                                    <div className="admin-checkin-prop"><Home size={14} /><span>{upcomingReservations[0].property}</span></div>
                                    <div className="admin-checkin-details">
                                        <span><Users size={12} /> {upcomingReservations[0].guests} guest{upcomingReservations[0].guests > 1 ? 's' : ''}</span>
                                        <span><IndianRupee size={12} /> ₹{upcomingReservations[0].total?.toLocaleString()}</span>
                                    </div>
                                    <div className="admin-checkin-actions">
                                        <button className="admin-btn-outline" onClick={() => navigate(`/property/${upcomingReservations[0].propertyId}`)}><Eye size={14} /> View</button>
                                        {upcomingReservations[0].status !== 'cancelled' && (
                                            <button
                                                className="admin-btn-outline danger"
                                                onClick={() => handleUpdateBookingStatus(upcomingReservations[0].id, 'cancelled')}
                                                disabled={statusUpdating === upcomingReservations[0].id}
                                            >
                                                {statusUpdating === upcomingReservations[0].id ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                                                Cancel
                                            </button>
                                        )}
                                        {upcomingReservations[0].status === 'pending' && (
                                            <button
                                                className="admin-btn-primary"
                                                onClick={() => handleUpdateBookingStatus(upcomingReservations[0].id, 'confirmed')}
                                                disabled={statusUpdating === upcomingReservations[0].id}
                                            >
                                                {statusUpdating === upcomingReservations[0].id ? <Loader2 size={14} className="spin" /> : <CheckCircle size={14} />}
                                                Confirm
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="admin-empty-state">
                                    <Calendar size={32} />
                                    <p>No upcoming check-ins</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* === RESERVATIONS === */}
            {activeSection === 'reservations' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
                    <div className="admin-card" style={{ padding: 0 }}>
                        <div style={{ padding: '18px 20px 0' }}><h3 className="admin-card-title">Upcoming reservations</h3></div>
                        <div className="admin-res-list">
                            {upcomingReservations.map((r, i) => (
                                <div key={i} className="admin-res-row">
                                    <div className="admin-res-avatar">{r.guest.charAt(0)}</div>
                                    <div className="admin-res-info">
                                        <p className="admin-res-guest">{r.guest}</p>
                                        <p className="admin-res-prop">{r.property}</p>
                                    </div>
                                    <div className="admin-res-dates"><Calendar size={12} /><span>{r.checkIn} – {r.checkOut}</span></div>
                                    <div className="admin-res-guests"><Users size={12} /><span>{r.guests}</span></div>
                                    <div className="admin-res-total">₹{r.total?.toLocaleString()}</div>
                                    <div className="admin-res-actions">
                                        <button
                                            className="admin-action-btn edit"
                                            title="View property"
                                            onClick={() => navigate(`/property/${r.propertyId}`)}
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <span className={`admin-res-status ${r.status}`}>{r.status}</span>
                                        {r.status === 'pending' && (
                                            <button
                                                className="admin-action-btn edit"
                                                title="Confirm"
                                                onClick={() => handleUpdateBookingStatus(r.id, 'confirmed')}
                                                disabled={statusUpdating === r.id}
                                            >
                                                <CheckCircle size={14} />
                                            </button>
                                        )}
                                        {r.status !== 'cancelled' && (
                                            <button
                                                className="admin-action-btn delete"
                                                title="Cancel"
                                                onClick={() => handleUpdateBookingStatus(r.id, 'cancelled')}
                                                disabled={statusUpdating === r.id}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {upcomingReservations.length === 0 && (<div className="admin-table-empty">No bookings found</div>)}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* === EARNINGS === */}
            {activeSection === 'earnings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
                    <div className="admin-two-col">
                        <div className="admin-card">
                            <h3 className="admin-card-title">Earnings summary</h3>
                            <div className="admin-earnings-total">
                                <p className="admin-earnings-amount">₹{totalRevenue.toLocaleString()}</p>
                                <p className="admin-earnings-label">Total estimated earnings</p>
                            </div>
                            <div className="admin-earnings-rows">
                                {earningsData.map((e, i) => (
                                    <div key={i} className="admin-earnings-row">
                                        <span className="admin-earnings-period">{e.month}</span>
                                        <span className="admin-earnings-val">₹{e.amount.toLocaleString()}</span>
                                        <span className="admin-stat-trend up" style={{ position: 'static' }}><TrendingUp size={11} /> {e.change}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="admin-card">
                            <h3 className="admin-card-title">Top performing listings</h3>
                            <div className="admin-top-listings">
                                {topListings.map((p, i) => (
                                    <div key={p._id} className="admin-top-row" onClick={() => navigate(`/property/${p._id}`)}>
                                        <span className="admin-top-rank">{i + 1}</span>
                                        <div className="admin-top-img">
                                            <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=80'} alt="" />
                                        </div>
                                        <div className="admin-top-info">
                                            <p className="admin-top-name">{p.title}</p>
                                            <p className="admin-top-loc"><MapPin size={10} /> {p.location?.city || '—'}</p>
                                        </div>
                                        <div className="admin-top-rating">
                                            <Star size={11} fill="#222" stroke="#222" />
                                            <span>{p.rating?.toFixed(1) || '–'}</span>
                                        </div>
                                        <span className="admin-top-price">₹{p.price?.toLocaleString()}<small>/night</small></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* === LISTINGS (with Edit/Delete) === */}
            {activeSection === 'listings' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
                    <div className="admin-table">
                        <div className="admin-table-head">
                            <span style={{ flex: 2.5 }}>Property</span>
                            <span>Type</span>
                            <span>Price</span>
                            <span>Status</span>
                            <span>Verification</span>
                            <span>Rating</span>
                            <span style={{ width: 100, textAlign: 'right' }}>Actions</span>
                        </div>
                        {loading ? (
                            <div className="admin-table-loading">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="admin-table-row">
                                        <div className="skeleton-shimmer" style={{ width: 60, height: 42, borderRadius: 6 }} />
                                        <div style={{ flex: 1 }}>
                                            <div className="skeleton-shimmer" style={{ height: 12, width: '50%', marginBottom: 4 }} />
                                            <div className="skeleton-shimmer" style={{ height: 8, width: '30%' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            filteredProperties.map(p => (
                                <div key={p._id} className="admin-table-row">
                                    <div className="admin-table-prop" style={{ flex: 2.5 }}>
                                        <div className="admin-table-img">
                                            <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=120'} alt="" />
                                        </div>
                                        <div>
                                            <p className="admin-table-name">{p.title}</p>
                                            <p className="admin-table-id">
                                                {p.bedrooms || 1} bed · {p.bathrooms || 1} bath · {p.maxGuests || 2} guests
                                            </p>
                                        </div>
                                    </div>
                                    <div className="admin-table-cell">
                                        <span className="admin-type-badge">{p.type}</span>
                                    </div>
                                    <div className="admin-table-cell">
                                        <span className="admin-table-price">₹{p.price?.toLocaleString()}</span>
                                        <span className="admin-table-per">/night</span>
                                    </div>
                                    <div className="admin-table-cell">
                                        <span className={`admin-status-pill ${p.status}`}>{p.status}</span>
                                    </div>
                                    <div className="admin-table-cell">
                                        <span className={`admin-status-pill ${p.verificationStatus || 'approved'}`}>
                                            {p.verificationStatus || 'approved'}
                                        </span>
                                    </div>
                                    <div className="admin-table-cell">
                                        <Star size={11} fill="#222" stroke="#222" />
                                        <span>{p.rating?.toFixed(1) || '–'}</span>
                                        <span className="admin-table-reviews">({p.reviewCount || 0})</span>
                                    </div>
                                    <div className="admin-table-cell" style={{ width: 100, justifyContent: 'flex-end', gap: 6 }}>
                                        <button
                                            className="admin-action-btn edit"
                                            title="Edit listing"
                                            onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            className="admin-action-btn delete"
                                            title="Delete listing"
                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p._id); }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                        {!loading && filteredProperties.length === 0 && (
                            <div className="admin-table-empty">No listings found</div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* === REVIEWS === */}
            {activeSection === 'reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
                    <div className="admin-card" style={{ marginBottom: 16 }}>
                        <div className="admin-rating-overview">
                            <div className="admin-rating-big">
                                <Star size={28} fill="#222" stroke="#222" />
                                <span className="admin-rating-num">{avgRating}</span>
                            </div>
                            <div className="admin-rating-meta">
                                <p className="admin-rating-total">{totalReviews} reviews across {totalListings} listings</p>
                                <p className="admin-rating-desc">Overall guest satisfaction score</p>
                            </div>
                        </div>
                    </div>
                    <div className="admin-reviews-list">
                        {recentReviews.map((r, i) => (
                            <div key={i} className="admin-review-card">
                                <div className="admin-review-header">
                                    <div className="admin-review-avatar">{r.guest.charAt(0)}</div>
                                    <div>
                                        <p className="admin-review-guest">{r.guest}</p>
                                        <p className="admin-review-date">{r.date}</p>
                                    </div>
                                    <div className="admin-review-stars">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <Star key={j} size={12} fill={j < Math.round(r.rating) ? '#222' : 'none'} stroke="#222" />
                                        ))}
                                    </div>
                                </div>
                                <p className="admin-review-property"><Home size={12} /> {r.property}</p>
                                <p className="admin-review-comment">"{r.comment}"</p>
                            </div>
                        ))}
                        {recentReviews.length === 0 && (<div className="admin-table-empty">No reviews yet</div>)}
                    </div>
                </motion.div>
            )}

            {/* === APPROVALS === */}
            {activeSection === 'approvals' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
                    <div className="admin-card" style={{ padding: 0 }}>
                        <div style={{ padding: '18px 20px 0' }}><h3 className="admin-card-title">Pending Approvals</h3></div>
                        <div className="admin-table">
                            <div className="admin-table-head">
                                <span style={{ flex: 2 }}>Property</span>
                                <span>Owner</span>
                                <span>Status</span>
                                <span style={{ width: 140, textAlign: 'right' }}>Actions</span>
                            </div>
                            {pendingProperties.map(p => (
                                <div key={p._id} className="admin-table-row">
                                    <div className="admin-table-prop" style={{ flex: 2 }}>
                                        <div className="admin-table-img">
                                            <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=120'} alt="" />
                                        </div>
                                        <div>
                                            <p className="admin-table-name">{p.title}</p>
                                            <p className="admin-table-id">{p.location?.city}</p>
                                        </div>
                                    </div>
                                    <div className="admin-table-cell">{p.owner?.name}</div>
                                    <div className="admin-table-cell">
                                        <span className="admin-status-pill pending">Pending</span>
                                    </div>
                                    <div className="admin-table-cell" style={{ width: 140, justifyContent: 'flex-end', gap: 8 }}>
                                        <button className="admin-action-btn edit" title="Approve" onClick={() => handleVerifyProperty(p._id, 'approved')}>
                                            <Check size={14} />
                                        </button>
                                        <button className="admin-action-btn delete" title="Reject" onClick={() => handleVerifyProperty(p._id, 'rejected')}>
                                            <X size={14} />
                                        </button>
                                        <button className="admin-action-btn edit" title="View" onClick={() => navigate(`/property/${p._id}`)}>
                                            <Eye size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {pendingProperties.length === 0 && <div className="admin-table-empty">No pending approvals</div>}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* === REPORTS === */}
            {activeSection === 'reports' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
                    <div className="admin-card" style={{ padding: 0 }}>
                        <div style={{ padding: '18px 20px 0' }}><h3 className="admin-card-title">User Reports</h3></div>
                        <div className="admin-table">
                            <div className="admin-table-head">
                                <span style={{ flex: 1 }}>Reporter</span>
                                <span style={{ flex: 1.5 }}>Target Type</span>
                                <span style={{ flex: 2 }}>Reason</span>
                                <span>Status</span>
                                <span style={{ width: 100, textAlign: 'right' }}>Manage</span>
                            </div>
                            {reports.map(r => (
                                <div key={r._id} className="admin-table-row">
                                    <div className="admin-table-cell" style={{ flex: 1 }}>{r.reporter?.name}</div>
                                    <div className="admin-table-cell" style={{ flex: 1.5 }}>{r.targetType}</div>
                                    <div className="admin-table-cell" style={{ flex: 2 }}>{r.reason}</div>
                                    <div className="admin-table-cell">
                                        <span className={`admin-status-pill ${r.status}`}>{r.status}</span>
                                    </div>
                                    <div className="admin-table-cell" style={{ width: 100, justifyContent: 'flex-end' }}>
                                        <button className="admin-action-btn edit" onClick={() => setResolvingReport(r)}>
                                            <Shield size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {reports.length === 0 && <div className="admin-table-empty">No reports found</div>}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* === ANNOUNCEMENTS === */}
            {activeSection === 'announcements' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
                    <div className="admin-two-col">
                        <div className="admin-card">
                            <h3 className="admin-card-title">New Announcement</h3>
                            <form onSubmit={handleCreateAnnouncement} className="admin-form">
                                <div className="admin-edit-section">
                                    <label className="admin-edit-label">Title</label>
                                    <input className="admin-edit-input" value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} required />
                                </div>
                                <div className="admin-edit-section">
                                    <label className="admin-edit-label">Content</label>
                                    <textarea className="admin-edit-textarea" rows={4} value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} required />
                                </div>
                                <div className="admin-edit-section">
                                    <label className="admin-edit-label">Type</label>
                                    <select className="admin-edit-input" value={newAnnouncement.type} onChange={e => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}>
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="success">Success</option>
                                        <option value="error">Error</option>
                                    </select>
                                </div>
                                <button type="submit" className="admin-btn-primary" style={{ width: '100%', marginTop: 10 }}>
                                    <Bell size={16} /> Broadcast Announcement
                                </button>
                            </form>
                        </div>
                        <div className="admin-card">
                            <h3 className="admin-card-title">Manage Announcements</h3>
                            <div className="admin-announcement-list">
                                {announcements.map(a => (
                                    <div key={a._id} className={`admin-ann-item ${a.isActive ? 'active' : ''}`}>
                                        <div className="admin-ann-header">
                                            <span className={`admin-status-pill ${a.type}`}>{a.type}</span>
                                            <div className="admin-ann-actions">
                                                <button onClick={() => handleToggleAnnouncement(a._id, !a.isActive)}>
                                                    {a.isActive ? <Eye size={14} /> : <UserX size={14} />}
                                                </button>
                                                <button onClick={() => handleDeleteAnnouncement(a._id)} className="danger">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="admin-ann-title">{a.title}</h4>
                                        <p className="admin-ann-content">{a.content}</p>
                                    </div>
                                ))}
                                {announcements.length === 0 && <div className="admin-table-empty">No announcements</div>}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}



            {/* === SECURITY & VERIFICATION === */}
            {activeSection === 'security' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-section">
                    <div className="admin-card" style={{ padding: 0 }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 className="admin-card-title">User Security & Verification</h3>
                                <p className="admin-card-desc">Review identity verification and manage fraud prevention</p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span className={`badge ${users.filter(u => u.verificationStatus === 'pending').length > 0 ? 'badge-warning' : 'badge-success'}`}>
                                    {users.filter(u => u.verificationStatus === 'pending').length} Pending Requests
                                </span>
                            </div>
                        </div>

                        <div className="admin-table">
                            <div className="admin-table-head">
                                <span style={{ flex: 1.5 }}>User Info</span>
                                <span>Role</span>
                                <span>Status</span>
                                <span>Security</span>
                                <span>Joined</span>
                                <span style={{ width: 140, textAlign: 'right' }}>Management</span>
                            </div>

                            {userLoading ? (
                                <div className="admin-table-loading">
                                    {[1, 2, 3].map(i => <div key={i} className="skeleton-shimmer" style={{ height: 60, margin: '10px 20px', borderRadius: 8 }} />)}
                                </div>
                            ) : (
                                users.map(u => (
                                    <div key={u._id} className={`admin-table-row ${u.isFlagged ? 'flagged-row' : ''}`} style={u.isBlocked ? { opacity: 0.6 } : {}}>
                                        <div className="admin-table-prop" style={{ flex: 1.5 }}>
                                            <div className="admin-res-avatar" style={{ background: u.isFlagged ? 'var(--danger-light)' : 'var(--primary-light)', color: u.isFlagged ? 'var(--danger)' : 'var(--primary)' }}>
                                                {u.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="admin-table-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    {u.name}
                                                    {u.verificationStatus === 'verified' && <Check size={12} className="text-success" />}
                                                </p>
                                                <p className="admin-table-id">{u.email}</p>
                                            </div>
                                        </div>

                                        <div className="admin-table-cell">
                                            <span className={`admin-type-badge ${u.role}`}>{u.role}</span>
                                        </div>

                                        <div className="admin-table-cell">
                                            <span className={`admin-status-pill ${u.verificationStatus}`}>
                                                {u.verificationStatus}
                                            </span>
                                        </div>

                                        <div className="admin-table-cell">
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                {u.isFlagged && <Flag size={14} className="text-danger" title="Flagged for review" />}
                                                {u.isBlocked && <ShieldAlert size={14} className="text-danger" title="User Blocked" />}
                                                {!u.isFlagged && !u.isBlocked && <Check size={14} className="text-success" title="Secure" />}
                                            </div>
                                        </div>

                                        <div className="admin-table-cell">
                                            <span className="admin-table-reviews">{new Date(u.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div className="admin-table-cell" style={{ width: 140, justifyContent: 'flex-end', gap: 8 }}>
                                            {u.verificationStatus === 'pending' && (
                                                <button
                                                    className="admin-action-btn edit"
                                                    title="Verify User"
                                                    onClick={() => handleUserAction(u._id, 'verify', { status: 'verified' })}
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                            <button
                                                className={`admin-action-btn ${u.isFlagged ? 'active' : ''}`}
                                                style={{ color: u.isFlagged ? 'var(--danger)' : 'var(--text-dim)' }}
                                                title={u.isFlagged ? "Unflag User" : "Flag User"}
                                                onClick={() => handleUserAction(u._id, 'flag')}
                                            >
                                                <Flag size={14} />
                                            </button>
                                            <button
                                                className={`admin-action-btn ${u.isBlocked ? 'delete' : ''}`}
                                                style={{ color: u.isBlocked ? 'var(--danger)' : 'var(--text-dim)' }}
                                                title={u.isBlocked ? "Unblock User" : "Block User"}
                                                onClick={() => handleUserAction(u._id, 'block')}
                                            >
                                                {u.isBlocked ? <UserCheck size={14} /> : <UserX size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}

                            {users.length === 0 && !userLoading && (
                                <div className="admin-table-empty">No users found for security audit</div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
            <AnimatePresence>
                {editingProperty && (
                    <div className="admin-modal-overlay" onClick={() => setEditingProperty(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="admin-edit-modal"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="admin-edit-header">
                                <h2 className="admin-edit-title">Edit listing</h2>
                                <button className="admin-edit-close" onClick={() => setEditingProperty(null)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="admin-edit-body">
                                {/* Images */}
                                <div className="admin-edit-section">
                                    <label className="admin-edit-label">Photos</label>
                                    <div className="admin-edit-images">
                                        {editForm.images?.map((img, i) => (
                                            <div key={i} className="admin-edit-img-item">
                                                <img src={img} alt="" />
                                                <button className="admin-edit-img-remove" onClick={() => handleImageRemove(i)}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <button className="admin-edit-img-add" onClick={handleImageAdd}>
                                            <Plus size={20} />
                                            <span>Add photo</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="admin-edit-section">
                                    <label className="admin-edit-label">Title</label>
                                    <input
                                        className="admin-edit-input"
                                        value={editForm.title}
                                        onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Property title"
                                    />
                                </div>

                                {/* Description */}
                                <div className="admin-edit-section">
                                    <label className="admin-edit-label">Description</label>
                                    <textarea
                                        className="admin-edit-textarea"
                                        value={editForm.description}
                                        onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                        placeholder="Property description"
                                    />
                                </div>

                                {/* Type + Status */}
                                <div className="admin-edit-row">
                                    <div className="admin-edit-section" style={{ flex: 1 }}>
                                        <label className="admin-edit-label">Type</label>
                                        <select
                                            className="admin-edit-input"
                                            value={editForm.type}
                                            onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                                        >
                                            {propertyTypes.map(t => (
                                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="admin-edit-section" style={{ flex: 1 }}>
                                        <label className="admin-edit-label">Status</label>
                                        <select
                                            className="admin-edit-input"
                                            value={editForm.status}
                                            onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                        >
                                            <option value="available">Available</option>
                                            <option value="rented">Rented</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="admin-edit-section">
                                    <label className="admin-edit-label">
                                        {editForm.type === 'land' ? 'Price per month (₹)' :
                                            editForm.type === 'parking' ? 'Price per car/bike (₹)' :
                                                'Price per night (₹)'}
                                    </label>
                                    <input
                                        className="admin-edit-input"
                                        type="number"
                                        value={editForm.price}
                                        onChange={e => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                                        min="0"
                                    />
                                </div>

                                {/* Beds / Baths / Guests */}
                                {editForm.type !== 'land' && editForm.type !== 'parking' && (
                                    <div className="admin-edit-row">
                                        <div className="admin-edit-section" style={{ flex: 1 }}>
                                            <label className="admin-edit-label">Bedrooms</label>
                                            <input
                                                className="admin-edit-input"
                                                type="number" min="0"
                                                value={editForm.bedrooms}
                                                onChange={e => setEditForm(prev => ({ ...prev, bedrooms: e.target.value }))}
                                            />
                                        </div>
                                        <div className="admin-edit-section" style={{ flex: 1 }}>
                                            <label className="admin-edit-label">Bathrooms</label>
                                            <input
                                                className="admin-edit-input"
                                                type="number" min="0"
                                                value={editForm.bathrooms}
                                                onChange={e => setEditForm(prev => ({ ...prev, bathrooms: e.target.value }))}
                                            />
                                        </div>
                                        <div className="admin-edit-section" style={{ flex: 1 }}>
                                            <label className="admin-edit-label">Max guests</label>
                                            <input
                                                className="admin-edit-input"
                                                type="number" min="1"
                                                value={editForm.maxGuests}
                                                onChange={e => setEditForm(prev => ({ ...prev, maxGuests: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Location */}
                                <div className="admin-edit-row">
                                    <div className="admin-edit-section" style={{ flex: 1 }}>
                                        <label className="admin-edit-label">City</label>
                                        <input
                                            className="admin-edit-input"
                                            value={editForm.city}
                                            onChange={e => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                            placeholder="City name"
                                        />
                                    </div>
                                    <div className="admin-edit-section" style={{ flex: 2 }}>
                                        <label className="admin-edit-label">Address</label>
                                        <input
                                            className="admin-edit-input"
                                            value={editForm.address}
                                            onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                                            placeholder="Full address"
                                        />
                                    </div>
                                </div>

                                {/* Amenities */}
                                <div className="admin-edit-section">
                                    <label className="admin-edit-label">Amenities</label>
                                    <div className="admin-edit-tags">
                                        {editForm.amenities?.map((a, i) => (
                                            <span key={i} className="admin-edit-tag">
                                                {a}
                                                <button onClick={() => handleAmenityRemove(i)}><X size={10} /></button>
                                            </span>
                                        ))}
                                        <button className="admin-edit-tag-add" onClick={handleAmenityAdd}>
                                            <Plus size={12} /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="admin-edit-footer">
                                <button className="admin-btn-outline" onClick={() => setEditingProperty(null)}>Cancel</button>
                                <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                                    {saving ? 'Saving...' : 'Save changes'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ===== REPORT RESOLUTION MODAL ===== */}
            <AnimatePresence>
                {resolvingReport && (
                    <div className="admin-modal-overlay" onClick={() => setResolvingReport(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="admin-edit-modal"
                            style={{ maxWidth: 500 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="admin-edit-header">
                                <h2 className="admin-edit-title">Resolve Report</h2>
                                <button className="admin-edit-close" onClick={() => setResolvingReport(null)}><X size={18} /></button>
                            </div>
                            <div className="admin-edit-body">
                                <div className="admin-card" style={{ background: 'var(--bg-light)', marginBottom: 20 }}>
                                    <p><strong>Reporter:</strong> {resolvingReport.reporter?.name}</p>
                                    <p><strong>Reason:</strong> {resolvingReport.reason}</p>
                                    {resolvingReport.details && <p><strong>Details:</strong> {resolvingReport.details}</p>}
                                </div>
                                <div className="admin-edit-section">
                                    <label className="admin-edit-label">Resolution Notes</label>
                                    <textarea
                                        className="admin-edit-textarea"
                                        placeholder="Add notes about the action taken..."
                                        id="resNotes"
                                    />
                                </div>
                            </div>
                            <div className="admin-edit-footer">
                                <button className="admin-btn-outline" onClick={() => setResolvingReport(null)}>Cancel</button>
                                <button
                                    className="admin-btn-danger"
                                    style={{ background: 'var(--success)', border: 'none' }}
                                    onClick={() => handleResolveReport(resolvingReport._id, 'resolved', document.getElementById('resNotes').value)}
                                >
                                    Mark Resolved
                                </button>
                                <button
                                    className="admin-btn-outline"
                                    onClick={() => handleResolveReport(resolvingReport._id, 'dismissed', document.getElementById('resNotes').value)}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ===== DELETE CONFIRMATION ===== */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="admin-delete-modal"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="admin-delete-icon">
                                <AlertCircle size={32} />
                            </div>
                            <h3>Delete this listing?</h3>
                            <p>This action cannot be undone. The property and all its data will be permanently removed.</p>
                            <div className="admin-delete-actions">
                                <button className="admin-btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                <button className="admin-btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPanel;
