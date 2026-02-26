import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Navigation } from 'lucide-react';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom red pin icon for selected location
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const LocationMarker = ({ position, onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position ? <Marker position={[position.lat, position.lng]} icon={redIcon} /> : null;
};

const FlyToLocation = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

const MapPicker = ({ onLocationSelect, initialPosition = null }) => {
    const [position, setPosition] = useState(initialPosition);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [flyTo, setFlyTo] = useState(null);
    const searchTimeout = useRef(null);

    const handleLocationSelect = (loc) => {
        setPosition(loc);
        onLocationSelect(loc);
        setSearchResults([]);
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
                );
                const data = await res.json();
                setSearchResults(data);
            } catch (e) {
                console.error('Geocoding error:', e);
            } finally {
                setSearching(false);
            }
        }, 400);
    };

    const selectSearchResult = (result) => {
        const loc = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        setPosition(loc);
        setFlyTo([loc.lat, loc.lng]);
        onLocationSelect(loc);
        setSearchQuery(result.display_name.split(',').slice(0, 3).join(','));
        setSearchResults([]);
    };

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setPosition(loc);
                    setFlyTo([loc.lat, loc.lng]);
                    onLocationSelect(loc);
                },
                (err) => console.error('Geolocation error:', err)
            );
        }
    };

    return (
        <div className="map-picker-container">
            <div className="map-picker-search-bar">
                <Search size={16} className="map-picker-search-icon" />
                <input
                    type="text"
                    placeholder="Search for a location..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="map-picker-search-input"
                />
                <button
                    type="button"
                    onClick={handleLocateMe}
                    className="map-picker-locate-btn"
                    title="Use my location"
                >
                    <Navigation size={16} />
                </button>
            </div>

            {searchResults.length > 0 && (
                <div className="map-picker-results">
                    {searchResults.map((r, i) => (
                        <button
                            key={i}
                            type="button"
                            className="map-picker-result-item"
                            onClick={() => selectSearchResult(r)}
                        >
                            <MapPin size={14} />
                            <span>{r.display_name}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="map-picker-map" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                <MapContainer
                    center={position ? [position.lat, position.lng] : [20.5937, 78.9629]}
                    zoom={position ? 15 : 5}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
                    {flyTo && <FlyToLocation center={flyTo} />}
                </MapContainer>
            </div>

            {position && (
                <div className="map-picker-coords">
                    <MapPin size={14} />
                    <span>📍 Location pinned ({position.lat.toFixed(5)}, {position.lng.toFixed(5)})</span>
                </div>
            )}

            {!position && (
                <p className="map-picker-hint">Click on the map or search to pin your property's exact location</p>
            )}
        </div>
    );
};

export default MapPicker;
