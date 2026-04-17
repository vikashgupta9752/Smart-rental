import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from './search/SearchBar';
import FilterBar from './search/FilterBar';
import PropertyGrid from './property/PropertyGrid';
import MapView from './common/MapView';

const BrowseSpaces = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlistIds, setWishlistIds] = useState([]);

    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minRating: searchParams.get('minRating') || '',
        amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
        sort: searchParams.get('sort') || 'newest'
    });

    const searchLocation = searchParams.get('location') || '';
    const searchGuests = searchParams.get('guests') || '';
    const searchCheckIn = searchParams.get('checkIn') || '';
    const searchCheckOut = searchParams.get('checkOut') || '';

    const fetchProperties = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchLocation) params.location = searchLocation;
            if (searchGuests) params.guests = searchGuests;
            if (filters.type) params.type = filters.type;
            if (filters.minPrice) params.minPrice = filters.minPrice;
            if (filters.maxPrice) params.maxPrice = filters.maxPrice;
            if (filters.minRating) params.minRating = filters.minRating;
            if (filters.amenities?.length) params.amenities = filters.amenities.join(',');
            if (filters.sort) params.sort = filters.sort;

            const { data } = await api.get('/api/properties', { params });
            setProperties(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [searchLocation, searchGuests, filters]);

    const fetchWishlist = useCallback(async () => {
        const saved = localStorage.getItem('user');
        if (!saved) return;
        const user = JSON.parse(saved);
        if (!user.token) return;
        try {
            const { data } = await api.get('/api/wishlist');
            setWishlistIds(data.map(p => p._id));
        } catch (e) { }
    }, []);

    useEffect(() => { fetchProperties(); fetchWishlist(); }, [fetchProperties, fetchWishlist]);

    const handleSearch = (params) => {
        const qs = new URLSearchParams();
        if (params.location) qs.set('location', params.location);
        if (params.checkIn) qs.set('checkIn', params.checkIn);
        if (params.checkOut) qs.set('checkOut', params.checkOut);
        if (params.guests > 1) qs.set('guests', params.guests);
        if (filters.type) qs.set('type', filters.type);
        setSearchParams(qs);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const [viewMode, setViewMode] = useState('grid');

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

    return (
        <div style={{ maxWidth: viewMode === 'map' ? '1400px' : 1200, margin: '0 auto', padding: '0 20px' }}>
            {/* Search */}
            <SearchBar
                onSearch={handleSearch}
                initialValues={{
                    location: searchLocation,
                    checkIn: searchCheckIn,
                    checkOut: searchCheckOut,
                    guests: Number(searchGuests) || 1
                }}
            />

            {/* View Toggle & Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--card-bg)', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--surface)', padding: '4px', borderRadius: '10px' }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                            background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                            color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
                            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Grid View
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                            background: viewMode === 'map' ? 'var(--primary)' : 'transparent',
                            color: viewMode === 'map' ? '#fff' : 'var(--text-muted)',
                            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Map View
                    </button>
                </div>

                <FilterBar
                    filters={filters}
                    onChange={handleFilterChange}
                    resultCount={properties.length}
                />
            </div>

            {/* Content */}
            {viewMode === 'grid' ? (
                <PropertyGrid
                    properties={properties}
                    loading={loading}
                    isWishlisted={isWishlisted}
                    onToggleWishlist={toggleWishlist}
                />
            ) : (
                <MapView
                    properties={properties}
                    height="700px"
                    zoom={5}
                />
            )}
        </div>
    );
};

export default BrowseSpaces;
