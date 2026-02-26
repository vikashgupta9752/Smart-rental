import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Home, User, Shield, Store, LogOut,
    LogIn, Bell, Menu, X, LayoutDashboard,
    Activity, History, Wallet, Sparkles, TrendingUp,
    Settings, Globe, Database, Search, ChevronRight,
    Map, Grid, Layers, PlusCircle, Sun, Moon, Heart, BarChart3
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

const Sidebar = ({ user, logout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { notifications } = useNotifications();
    const { theme, toggleTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [announcements, setAnnouncements] = useState([]);

    React.useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/announcements/active');
                setAnnouncements(res.data || []);
            } catch (err) { console.error(err); }
        };
        fetchAnnouncements();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { label: 'Home', icon: Home, path: '/', roles: ['public'] },
        { label: 'Browse', icon: Globe, path: '/browse', roles: ['public'] },
    ];

    const customerItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/customer', roles: ['customer', 'admin'] },
        { label: 'Wishlists', icon: Heart, path: '/customer/saved', roles: ['customer', 'admin'] },
        { label: 'Trips', icon: History, path: '/customer/bookings', roles: ['customer', 'admin'] },
        { label: 'Analytics', icon: BarChart3, path: '/customer/analytics', roles: ['customer', 'admin'] },
    ];

    const sellerItems = [
        { label: 'My Listings', icon: Layers, path: '/seller', roles: ['seller', 'admin'] },
        { label: 'Add Listing', icon: PlusCircle, path: '/seller/listing/new', roles: ['seller', 'admin'] },
    ];

    const adminItems = [
        { label: 'Admin Panel', icon: Shield, path: '/admin', roles: ['admin'] },
    ];

    const renderLinks = (items) => {
        return items
            .filter(item => item.roles.includes('public') || (user && (item.roles.includes(user.role) || user.role === 'admin')))
            .map(item => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-link-v2 ${isActive(item.path) ? 'active' : ''}`}
                >
                    <item.icon size={14} />
                    {!isCollapsed && <span>{item.label}</span>}
                    {isActive(item.path) && !isCollapsed && (
                        <motion.div
                            layoutId="active-pill"
                            className="absolute left-0 w-[2px] h-4 rounded-r-full"
                            style={{ background: 'var(--primary)' }}
                        />
                    )}
                </Link>
            ));
    };

    return (
        <aside className={`sidebar-v2 ${isCollapsed ? 'collapsed' : ''}`}>
            {announcements.map(ann => (
                <div key={ann._id} className={`announcement-banner ${ann.type}`} style={{ padding: '8px 12px', fontSize: '0.7rem' }}>
                    <div className="banner-content" style={{ flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 700 }}>{ann.title}</span>
                        <span style={{ opacity: 0.9 }}>{ann.content}</span>
                    </div>
                </div>
            ))}
            {/* Brand */}
            <div className="sidebar-brand" onClick={() => navigate('/')}>
                <div className="brand-logo" style={{ background: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.15)', width: 30, height: 30, borderRadius: 8 }}>
                    <Layers size={14} style={{ color: 'var(--primary)' }} />
                </div>
                {!isCollapsed && (
                    <div className="brand-text">
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>SmartRental</span>
                        <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: 500 }}>Property Platform</span>
                    </div>
                )}
            </div>

            {/* User Profile (when logged in) */}
            {user && !isCollapsed && (
                <div className="sidebar-user-v2">
                    <div className="user-avatar-v2">
                        {(user.name?.[0] || user.username?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="user-info-v2">
                        <p className="user-name-v2">{user.name || user.username || 'User'}</p>
                        <p className="user-role-v2">{user.role}</p>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="sidebar-scrollable custom-scrollbar">
                <div className="nav-group">
                    {renderLinks(navItems)}
                </div>

                {user && (
                    <>
                        <div className="nav-group-divider" />
                        {user.role === 'customer' && (
                            <div className="nav-group">
                                {renderLinks(customerItems)}
                            </div>
                        )}

                        {user.role === 'seller' && (
                            <div className="nav-group">
                                {renderLinks(sellerItems)}
                            </div>
                        )}

                        {user.role === 'admin' && (
                            <div className="nav-group">
                                {renderLinks(adminItems)}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="sidebar-bottom">
                <button
                    onClick={toggleTheme}
                    className={`theme-toggle-v3 ${theme}`}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    <div className="toggle-track">
                        <motion.div
                            className="toggle-thumb"
                            animate={{ x: theme === 'dark' ? 0 : 26 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                        </motion.div>
                        <div className="toggle-icons">
                            <Moon size={10} className="icon-moon" />
                            <Sun size={10} className="icon-sun" />
                        </div>
                    </div>
                    {!isCollapsed && <span className="toggle-label">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>}
                </button>

                {user ? (
                    <button onClick={handleLogout} className="logout-btn-v2">
                        <LogOut size={16} /> {!isCollapsed && 'Sign Out'}
                    </button>
                ) : (
                    <Link to="/login" className="login-link-v2">
                        <LogIn size={16} /> {!isCollapsed && 'Login'}
                    </Link>
                )}
            </div>

            <button className="sidebar-toggle-v2" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <ChevronRight size={14} /> : <Menu size={14} />}
            </button>
        </aside>
    );
};

export default Sidebar;
