import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ user, children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = useCallback(async () => {
        if (!user?.token) { setWishlist([]); return; }
        try {
            setLoading(true);
            const { data } = await api.get('/api/wishlist');
            setWishlist(data);
        } catch (err) { console.error('Wishlist fetch error:', err); }
        finally { setLoading(false); }
    }, [user?.token]);

    useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

    const toggleWishlist = async (propertyId) => {
        if (!user?.token) return;
        try {
            const { data } = await api.post(`/api/wishlist/${propertyId}`);
            if (data.wishlisted) {
                fetchWishlist();
            } else {
                setWishlist(prev => prev.filter(p => p._id !== propertyId));
            }
            return data.wishlisted;
        } catch (err) { console.error('Wishlist toggle error:', err); }
    };

    const isWishlisted = (propertyId) => wishlist.some(p => p._id === propertyId);

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isWishlisted, fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be inside WishlistProvider');
    return ctx;
};
