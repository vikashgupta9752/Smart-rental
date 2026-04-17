import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Star, ChevronLeft, ChevronRight, ArrowRight, Sparkles, Shield, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SearchBar from './search/SearchBar';
import PropertyCard from './property/PropertyCard';

const CATEGORIES = [
    { label: 'All', value: '' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'Land', value: 'land' },
    { label: 'House', value: 'house' },
    { label: 'Studio', value: 'studio' },
    { label: 'Parking', value: 'parking' },
    { label: 'Room', value: 'room' },
];

// Horizontal scroll row component
const ScrollRow = ({ title, properties, onToggleWishlist, isWishlisted }) => {
    const scrollRef = React.useRef(null);
    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
        }
    };

    if (!properties?.length) return null;

    return (
        <div className="home-scroll-section">
            <div className="home-scroll-header">
                <h2 className="home-scroll-title">{title} <ArrowRight size={18} /></h2>
                <div className="home-scroll-arrows">
                    <button onClick={() => scroll(-1)} className="home-scroll-arrow"><ChevronLeft size={16} /></button>
                    <button onClick={() => scroll(1)} className="home-scroll-arrow"><ChevronRight size={16} /></button>
                </div>
            </div>
            <div className="home-scroll-track" ref={scrollRef}>
                {properties.map((p, i) => (
                    <div key={p._id} className="home-scroll-card">
                        <PropertyCard
                            property={p}
                            index={i}
                            isWishlisted={isWishlisted?.(p._id)}
                            onToggleWishlist={onToggleWishlist}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlistIds, setWishlistIds] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/api/properties');
                setProperties(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };

        const fetchWL = async () => {
            const saved = localStorage.getItem('user');
            if (!saved) return;
            const user = JSON.parse(saved);
            if (!user.token) return;
            try {
                const { data } = await api.get('/api/wishlist');
                setWishlistIds(data.map(p => p._id));
            } catch (e) { }
        };
        fetch();
        fetchWL();
    }, []);

    const toggleWishlist = async (propertyId) => {
        const saved = localStorage.getItem('user');
        if (!saved) return;
        const user = JSON.parse(saved);
        try {
            const { data } = await api.post(`/api/wishlist/${propertyId}`);
            setWishlistIds(prev => data.wishlisted ? [...prev, propertyId] : prev.filter(id => id !== propertyId));
        } catch (e) { }
    };

    const isWishlisted = (id) => wishlistIds.includes(id);

    const handleSearch = (params) => {
        const qs = new URLSearchParams();
        if (params.location) qs.set('location', params.location);
        if (params.checkIn) qs.set('checkIn', params.checkIn);
        if (params.checkOut) qs.set('checkOut', params.checkOut);
        if (params.guests > 1) qs.set('guests', params.guests);
        navigate(`/browse?${qs.toString()}`);
    };

    // Group properties
    const topRated = [...properties].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
    const cities = [...new Set(properties.map(p => p.location?.city).filter(Boolean))];
    const byCityGroups = cities.slice(0, 3).map(city => ({
        city,
        props: properties.filter(p => p.location?.city === city)
    }));

    return (
        <div className="home-page">
            {/* Search Section */}
            <div className="home-search-section">
                <SearchBar onSearch={handleSearch} />
            </div>

            {/* Category bar */}
            <div className="home-categories">
                {CATEGORIES.map(c => (
                    <button
                        key={c.value}
                        className="home-category-chip"
                        onClick={() => navigate(`/browse${c.value ? `?type=${c.value}` : ''}`)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="property-grid" style={{ marginTop: 24 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="pcard"><div className="pcard-img-wrap skeleton-shimmer" style={{ background: 'var(--surface)' }} /><div className="pcard-info"><div className="skeleton-line w-3/4" /><div className="skeleton-line w-1/2" /></div></div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Popular homes — horizontal scroll */}
                    <ScrollRow
                        title="Popular homes"
                        properties={topRated}
                        isWishlisted={isWishlisted}
                        onToggleWishlist={toggleWishlist}
                    />

                    {/* By city rows */}
                    {byCityGroups.map(({ city, props }) => (
                        <ScrollRow
                            key={city}
                            title={`Stays in ${city}`}
                            properties={props}
                            isWishlisted={isWishlisted}
                            onToggleWishlist={toggleWishlist}
                        />
                    ))}

                    {/* Show all */}
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <button
                            className="home-showall-btn"
                            onClick={() => navigate('/browse')}
                        >
                            Show all properties
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;
