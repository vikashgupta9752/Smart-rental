import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const WishlistContext = createContext();

export const WishlistProvider = ({ user, children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = useCallback(async () => {
        if (!user?.token) { setWishlist([]); return; }
        try {
            setLoading(true);
            const { data } = await axios.get('http://127.0.0.1:5000/api/wishlist', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setWishlist(data);
        } catch (err) { console.error('Wishlist fetch error:', err); }
        finally { setLoading(false); }
    }, [user?.token]);

    useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

    const toggleWishlist = async (propertyId) => {
        if (!user?.token) return;
        try {
            const { data } = await axios.post(`http://127.0.0.1:5000/api/wishlist/${propertyId}`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
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
