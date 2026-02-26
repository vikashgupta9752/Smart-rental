import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapView = ({ properties, center = [20.5937, 78.9629], zoom = 5, height = '400px' }) => {
    return (
        <div className="map-view-container" style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {properties?.map(p => (
                    p.location?.lat && p.location?.lng ? (
                        <Marker key={p._id} position={[p.location.lat, p.location.lng]}>
                            <Popup>
                                <div style={{ minWidth: '160px' }}>
                                    {p.images?.[0] && (
                                        <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                    )}
                                    <h4 style={{ margin: '8px 0 4px', fontSize: '0.9rem' }}>{p.title}</h4>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>₹{p.price?.toLocaleString()}/night</p>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;
