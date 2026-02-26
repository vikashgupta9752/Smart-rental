import React, { useState } from 'react';
import { SlidersHorizontal, X, Star, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROPERTY_TYPES = [
    { value: '', label: 'All' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'land', label: 'Land' },
    { value: 'studio', label: 'Studio' },
    { value: 'parking', label: 'Parking' },
    { value: 'room', label: 'Room' },
];

const AMENITY_OPTIONS = [
    'wifi', 'ac', 'kitchen', 'pool', 'parking', 'gym',
    'garden', 'balcony', 'workspace', 'tv', 'washer',
    'fireplace', 'bbq', 'beach_access', 'lake_view',
    'mountain_view', 'ocean_view', 'nature_view', 'spa'
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'rating', label: 'Top Rated' },
];

const FilterBar = ({ filters, onChange, resultCount }) => {
    const [expanded, setExpanded] = useState(false);

    const updateFilter = (key, value) => {
        onChange({ ...filters, [key]: value });
    };

    const toggleAmenity = (amenity) => {
        const current = filters.amenities || [];
        const updated = current.includes(amenity)
            ? current.filter(a => a !== amenity)
            : [...current, amenity];
        updateFilter('amenities', updated);
    };

    const clearAll = () => onChange({ type: '', minPrice: '', maxPrice: '', minRating: '', amenities: [], sort: 'newest' });
    const hasActiveFilters = filters.type || filters.minPrice || filters.maxPrice || filters.minRating || (filters.amenities?.length > 0);

    return (
        <div className="filter-bar">
            <div className="filter-bar-top">
                <div className="filter-chips">
                    {PROPERTY_TYPES.map(t => (
                        <button
                            key={t.value}
                            className={`filter-chip ${filters.type === t.value ? 'active' : ''}`}
                            onClick={() => updateFilter('type', t.value)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="filter-bar-right">
                    {resultCount !== undefined && (
                        <span className="filter-result-count">{resultCount} properties</span>
                    )}
                    <div className="filter-sort">
                        <select
                            value={filters.sort || 'newest'}
                            onChange={e => updateFilter('sort', e.target.value)}
                            className="filter-sort-select"
                        >
                            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>
                    <button className={`filter-expand-btn ${expanded ? 'active' : ''}`} onClick={() => setExpanded(!expanded)}>
                        <SlidersHorizontal size={14} /> Filters
                        {hasActiveFilters && <span className="filter-badge" />}
                    </button>
                    {hasActiveFilters && (
                        <button className="filter-clear-btn" onClick={clearAll}><X size={12} /> Clear</button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="filter-expanded"
                    >
                        <div className="filter-section">
                            <h4 className="filter-section-title">Price Range (₹/night)</h4>
                            <div className="filter-price-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice || ''}
                                    onChange={e => updateFilter('minPrice', e.target.value)}
                                    className="filter-price-input"
                                />
                                <span className="filter-price-dash">–</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice || ''}
                                    onChange={e => updateFilter('maxPrice', e.target.value)}
                                    className="filter-price-input"
                                />
                            </div>
                        </div>
                        <div className="filter-section">
                            <h4 className="filter-section-title">Minimum Rating</h4>
                            <div className="filter-rating-options">
                                {[0, 3, 3.5, 4, 4.5].map(r => (
                                    <button
                                        key={r}
                                        className={`filter-chip small ${Number(filters.minRating) === r ? 'active' : ''}`}
                                        onClick={() => updateFilter('minRating', r || '')}
                                    >
                                        {r === 0 ? 'Any' : <><Star size={10} fill="currentColor" /> {r}+</>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="filter-section">
                            <h4 className="filter-section-title">Amenities</h4>
                            <div className="filter-amenities-grid">
                                {AMENITY_OPTIONS.map(a => (
                                    <button
                                        key={a}
                                        className={`filter-chip small ${(filters.amenities || []).includes(a) ? 'active' : ''}`}
                                        onClick={() => toggleAmenity(a)}
                                    >
                                        {a.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FilterBar;
