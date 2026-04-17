import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { Heart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import PropertyCard from '../property/PropertyCard';

const SavedProperties = ({ user }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWishlist = useCallback(async () => {
        if (!user?.token) return;
        try {
            setLoading(true);
            const { data } = await api.get('/api/wishlist');
            setWishlist(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [user?.token]);

    useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

    const toggleWishlist = async (propertyId) => {
        try {
            await api.post(`/api/wishlist/${propertyId}`);
            setWishlist(prev => prev.filter(p => p._id !== propertyId));
        } catch (err) { console.error(err); }
    };

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1 className="admin-title">Wishlists</h1>
                    <p className="admin-subtitle">Items you've saved for later</p>
                </div>
            </div>

            {loading ? (
                <div className="property-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="pcard">
                            <div className="pcard-img-wrap skeleton-shimmer" style={{ background: 'var(--surface)' }} />
                            <div className="pcard-info"><div className="skeleton-line w-3/4" /><div className="skeleton-line w-1/2" /></div>
                        </div>
                    ))}
                </div>
            ) : wishlist.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '100px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Heart size={48} style={{ color: 'var(--text-muted)', opacity: 0.1, marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>No saved properties yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tap the heart icon on any listing to save it here.</p>
                </div>
            ) : (
                <div className="property-grid">
                    {wishlist.map((property, i) => (
                        <PropertyCard
                            key={property._id}
                            property={property}
                            index={i}
                            isWishlisted={true}
                            onToggleWishlist={toggleWishlist}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedProperties;
