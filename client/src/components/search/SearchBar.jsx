import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CITIES = [
    'Mumbai', 'Goa', 'Delhi', 'Bangalore', 'Manali',
    'Udaipur', 'Jaipur', 'Wayanad', 'Alleppey', 'Coorg',
    'Hyderabad', 'Gokarna', 'Pondicherry', 'Shimla', 'Darjeeling'
];

const SearchBar = ({ onSearch, initialValues = {} }) => {
    const [location, setLocation] = useState(initialValues.location || '');
    const [checkIn, setCheckIn] = useState(initialValues.checkIn || '');
    const [checkOut, setCheckOut] = useState(initialValues.checkOut || '');
    const [guests, setGuests] = useState(initialValues.guests || 1);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showGuests, setShowGuests] = useState(false);
    const suggestRef = useRef(null);
    const guestRef = useRef(null);

    const filteredCities = CITIES.filter(c =>
        c.toLowerCase().includes(location.toLowerCase())
    );

    useEffect(() => {
        const close = (e) => {
            if (suggestRef.current && !suggestRef.current.contains(e.target)) setShowSuggestions(false);
            if (guestRef.current && !guestRef.current.contains(e.target)) setShowGuests(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const handleSearch = (e) => {
        e?.preventDefault();
        onSearch({ location, checkIn, checkOut, guests });
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSearch} className="search-bar-container">
            <div className="search-bar-inner">
                {/* Location */}
                <div className="search-field search-field-location" ref={suggestRef}>
                    <label className="search-label">Where</label>
                    <div className="search-input-wrap">
                        <MapPin size={14} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search destinations"
                            value={location}
                            onChange={e => { setLocation(e.target.value); setShowSuggestions(true); }}
                            onFocus={() => setShowSuggestions(true)}
                            className="search-input"
                        />
                        {location && (
                            <button type="button" onClick={() => setLocation('')} className="search-clear">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <AnimatePresence>
                        {showSuggestions && filteredCities.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="search-suggestions"
                            >
                                {filteredCities.map(city => (
                                    <button
                                        key={city}
                                        type="button"
                                        className="search-suggestion-item"
                                        onClick={() => { setLocation(city); setShowSuggestions(false); }}
                                    >
                                        <MapPin size={12} /> {city}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="search-divider" />

                {/* Check-in */}
                <div className="search-field">
                    <label className="search-label">Check in</label>
                    <div className="search-input-wrap">
                        <Calendar size={14} className="search-icon" />
                        <input
                            type="date"
                            value={checkIn}
                            min={today}
                            onChange={e => setCheckIn(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="search-divider" />

                {/* Check-out */}
                <div className="search-field">
                    <label className="search-label">Check out</label>
                    <div className="search-input-wrap">
                        <Calendar size={14} className="search-icon" />
                        <input
                            type="date"
                            value={checkOut}
                            min={checkIn || today}
                            onChange={e => setCheckOut(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="search-divider" />

                {/* Guests */}
                <div className="search-field search-field-guests" ref={guestRef}>
                    <label className="search-label">Guests</label>
                    <button
                        type="button"
                        className="search-input guest-trigger"
                        onClick={() => setShowGuests(!showGuests)}
                    >
                        <Users size={14} className="search-icon" />
                        <span>{guests} guest{guests > 1 ? 's' : ''}</span>
                        <ChevronDown size={12} />
                    </button>
                    <AnimatePresence>
                        {showGuests && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="guest-dropdown"
                            >
                                <div className="guest-row">
                                    <span>Guests</span>
                                    <div className="guest-controls">
                                        <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} disabled={guests <= 1}>−</button>
                                        <span>{guests}</span>
                                        <button type="button" onClick={() => setGuests(Math.min(16, guests + 1))}>+</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search Button */}
                <button type="submit" className="search-button">
                    <Search size={16} />
                    <span>Search</span>
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
