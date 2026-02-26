import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Plus, Star, MapPin, Eye, Edit3, Trash2,
    TrendingUp, Home, Users, Calendar, MoreHorizontal,
    IndianRupee, BarChart3, ChevronRight, ExternalLink,
    MessageSquare, Send, Search, Clock, User, ArrowLeft, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SellerPanel = ({ user }) => {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [activeSection, setActiveSection] = useState('listings'); // 'listings' or 'messages'
    const [menuOpen, setMenuOpen] = useState(null);

    // Messaging State
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [convsLoading, setConvsLoading] = useState(false);
    const [msgsLoading, setMsgsLoading] = useState(false);

    useEffect(() => {
        fetchSellerData();
    }, []);

    useEffect(() => {
        if (activeSection === 'messages') {
            fetchConversations();
        }
    }, [activeSection]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat._id);
            const interval = setInterval(() => fetchMessages(selectedChat._id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedChat]);

    const fetchSellerData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/stats/seller', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setListings(res.data.properties || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchConversations = async () => {
        setConvsLoading(true);
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/messages', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setConversations(res.data);
        } catch (err) { console.error(err); }
        finally { setConvsLoading(false); }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await axios.get(`http://127.0.0.1:5000/api/messages/${userId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setMessages(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const res = await axios.post('http://127.0.0.1:5000/api/messages', {
                receiverId: selectedChat._id,
                content: newMessage
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
            fetchConversations(); // Update last message in sidebar
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await axios.delete(`http://127.0.0.1:5000/api/properties/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setListings(prev => prev.filter(p => p._id !== id));
        } catch (err) { console.error(err); }
    };

    const totalRevenue = listings.reduce((sum, p) => sum + (p.price || 0), 0);
    const avgRating = listings.length > 0
        ? (listings.reduce((sum, p) => sum + (p.rating || 0), 0) / listings.length).toFixed(1)
        : '0.0';
    const totalReviews = listings.reduce((sum, p) => sum + (p.reviewCount || 0), 0);

    return (
        <div className="seller-content-layout">
            {/* Seller Sidebar */}
            <div className="seller-sidebar-v2">
                <div className="sidebar-brand">
                    <div className="brand-logo" style={{ background: 'var(--primary)' }}>
                        <Home size={18} color="white" />
                    </div>
                    <div className="brand-text">
                        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Host Panel</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Manage your property</span>
                    </div>
                </div>

                <div className="seller-sidebar-nav">
                    <div
                        className={`seller-nav-item ${activeSection === 'listings' ? 'active' : ''}`}
                        onClick={() => setActiveSection('listings')}
                    >
                        <Home size={18} />
                        <span>Listings</span>
                    </div>
                    <div
                        className={`seller-nav-item ${activeSection === 'messages' ? 'active' : ''}`}
                        onClick={() => setActiveSection('messages')}
                    >
                        <MessageSquare size={18} />
                        <span>Messages</span>
                    </div>
                    <div className="seller-nav-item" onClick={() => navigate('/seller/listing/new')}>
                        <Plus size={18} />
                        <span>Add New</span>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid var(--divider)' }}>
                    <div className="seller-nav-item" onClick={() => navigate('/')}>
                        <ArrowLeft size={18} />
                        <span>Back to Site</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="seller-main-content">
                <AnimatePresence mode="wait">
                    {activeSection === 'listings' ? (
                        <motion.div
                            key="listings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="seller-header">
                                <div>
                                    <h1 className="seller-welcome">Welcome back, {user?.name || 'Host'}</h1>
                                    <p className="seller-subtitle">{listings.length} listing{listings.length !== 1 ? 's' : ''} · {totalReviews} total reviews</p>
                                </div>
                                <button className="seller-new-btn" onClick={() => navigate('/seller/listing/new')}>
                                    <Plus size={16} /> Create listing
                                </button>
                            </div>

                            <div className="seller-stats">
                                <div className="seller-stat-card">
                                    <div className="seller-stat-icon"><IndianRupee size={18} /></div>
                                    <div>
                                        <p className="seller-stat-value">₹{totalRevenue.toLocaleString()}</p>
                                        <p className="seller-stat-label">Total value</p>
                                    </div>
                                </div>
                                <div className="seller-stat-card">
                                    <div className="seller-stat-icon"><Home size={18} /></div>
                                    <div>
                                        <p className="seller-stat-value">{listings.length}</p>
                                        <p className="seller-stat-label">Active listings</p>
                                    </div>
                                </div>
                                <div className="seller-stat-card">
                                    <div className="seller-stat-icon"><Star size={18} /></div>
                                    <div>
                                        <p className="seller-stat-value">{avgRating}</p>
                                        <p className="seller-stat-label">Avg rating</p>
                                    </div>
                                </div>
                                <div className="seller-stat-card">
                                    <div className="seller-stat-icon"><Users size={18} /></div>
                                    <div>
                                        <p className="seller-stat-value">{totalReviews}</p>
                                        <p className="seller-stat-label">Reviews</p>
                                    </div>
                                </div>
                            </div>

                            <div className="seller-listings-header">
                                <h2 className="seller-listings-title">Your listings</h2>
                                <div className="seller-tabs">
                                    {['all', 'apartment', 'land', 'house', 'studio', 'parking'].map(tab => (
                                        <button
                                            key={tab}
                                            className={`seller-tab ${activeTab === tab ? 'active' : ''}`}
                                            onClick={() => setActiveTab(tab)}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div className="seller-loading">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="seller-listing-row">
                                            <div className="skeleton-shimmer" style={{ width: 80, height: 56, borderRadius: 8 }} />
                                            <div style={{ flex: 1 }}>
                                                <div className="skeleton-shimmer" style={{ height: 14, width: '40%', marginBottom: 6 }} />
                                                <div className="skeleton-shimmer" style={{ height: 10, width: '25%' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : listings.length === 0 ? (
                                <div className="seller-empty">
                                    <Home size={48} style={{ opacity: 0.15 }} />
                                    <h3>No listings yet</h3>
                                    <p>Create your first listing and start hosting guests.</p>
                                    <button className="seller-new-btn" onClick={() => navigate('/seller/listing/new')}>
                                        <Plus size={16} /> Create your first listing
                                    </button>
                                </div>
                            ) : (
                                <div className="seller-listings-table">
                                    <div className="seller-table-header">
                                        <span className="seller-th" style={{ flex: 2 }}>Listing</span>
                                        <span className="seller-th">Status</span>
                                        <span className="seller-th">Price</span>
                                        <span className="seller-th">Rating</span>
                                        <span className="seller-th">Location</span>
                                        <span className="seller-th" style={{ width: 48 }}></span>
                                    </div>

                                    {listings
                                        .filter(p => activeTab === 'all' || p.type === activeTab)
                                        .map((p, i) => (
                                            <motion.div
                                                key={p._id}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="seller-listing-row"
                                            >
                                                <div className="seller-listing-info" style={{ flex: 2 }}>
                                                    <div className="seller-listing-img">
                                                        <img
                                                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=200'}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="seller-listing-name">{p.title}</p>
                                                        <p className="seller-listing-type">{p.type}</p>
                                                    </div>
                                                </div>

                                                <div className="seller-listing-cell">
                                                    <span className="seller-status-badge active">Active</span>
                                                </div>

                                                <div className="seller-listing-cell">
                                                    <span className="seller-listing-price">₹{p.price?.toLocaleString()}</span>
                                                    <span className="seller-listing-per">/night</span>
                                                </div>

                                                <div className="seller-listing-cell">
                                                    <Star size={12} fill="#000" stroke="#000" />
                                                    <span>{p.rating?.toFixed(1) || '–'}</span>
                                                    <span className="seller-listing-reviews">({p.reviewCount || 0})</span>
                                                </div>

                                                <div className="seller-listing-cell">
                                                    <MapPin size={12} />
                                                    <span>{p.location?.city || p.location?.id || '—'}</span>
                                                </div>

                                                <div className="seller-listing-cell" style={{ width: 48, position: 'relative' }}>
                                                    <button
                                                        className="seller-more-btn"
                                                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p._id ? null : p._id); }}
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {menuOpen === p._id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className="seller-dropdown"
                                                            >
                                                                <button onClick={() => { navigate(`/property/${p._id}`); setMenuOpen(null); }}>
                                                                    <Eye size={14} /> View listing
                                                                </button>
                                                                <button onClick={() => { navigate(`/seller/listing/edit/${p._id}`); setMenuOpen(null); }}>
                                                                    <Edit3 size={14} /> Edit
                                                                </button>
                                                                <button onClick={() => { handleDelete(p._id); setMenuOpen(null); }} className="danger">
                                                                    <Trash2 size={14} /> Delete
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="messages"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <h1 className="seller-listings-title" style={{ marginBottom: '24px' }}>Messages</h1>

                            <div className="messaging-hub">
                                {/* Conversations List */}
                                <div className="conversations-sidebar">
                                    <div className="conversations-header">
                                        <div style={{ position: 'relative' }}>
                                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                            <input
                                                type="text"
                                                placeholder="Search messages..."
                                                className="glass-input"
                                                style={{ width: '100%', paddingLeft: '36px', fontSize: '0.8rem' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="conversations-list">
                                        {convsLoading ? (
                                            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                                                <Loader2 size={24} className="spin" style={{ color: 'var(--primary)' }} />
                                            </div>
                                        ) : conversations.length === 0 ? (
                                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                                                <p>No conversations found</p>
                                            </div>
                                        ) : (
                                            conversations.map(conv => {
                                                const otherUser = conv.participant;
                                                return (
                                                    <div
                                                        key={conv._id}
                                                        className={`conversation-item ${selectedChat?._id === otherUser?._id ? 'active' : ''}`}
                                                        onClick={() => setSelectedChat(otherUser)}
                                                    >
                                                        <div className="conversation-avatar">
                                                            {otherUser?.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div className="conversation-info">
                                                            <div className="conversation-name">{otherUser?.name}</div>
                                                            <div className="conversation-last-msg">{conv.lastMessage?.content}</div>
                                                        </div>
                                                        <div className="conversation-meta">
                                                            <div className="conversation-time">
                                                                {new Date(conv.lastMessage?.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' }) === new Date().toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })
                                                                    ? new Date(conv.lastMessage?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                    : new Date(conv.lastMessage?.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            </div>
                                                            {conv.unreadCount > 0 && <div className="unread-badge"></div>}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Chat View */}
                                <div className="chat-container">
                                    {selectedChat ? (
                                        <>
                                            <div className="chat-header">
                                                <div className="conversation-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                                                    {selectedChat.name?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="conversation-name">{selectedChat.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Online</div>
                                                </div>
                                            </div>

                                            <div className="chat-messages">
                                                {messages.map((msg, i) => (
                                                    <div key={msg._id || i} className={`message-bubble ${msg.sender === user._id || msg.sender?._id === user._id ? 'sent' : 'received'}`}>
                                                        {msg.content}
                                                        <span className="message-time">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="chat-input-area">
                                                <form onSubmit={handleSendMessage} className="chat-input-wrapper">
                                                    <input
                                                        type="text"
                                                        className="chat-input"
                                                        placeholder="Type your message..."
                                                        value={newMessage}
                                                        onChange={e => setNewMessage(e.target.value)}
                                                    />
                                                    <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                                                        <Send size={18} />
                                                    </button>
                                                </form>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="chat-empty">
                                            <div className="chat-empty-content">
                                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
                                                    <MessageSquare size={32} />
                                                </div>
                                                <h3>Select a conversation</h3>
                                                <p>Pick a chat from the left to start messaging your customers.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SellerPanel;
