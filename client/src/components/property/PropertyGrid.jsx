import React from 'react';
import PropertyCard from './PropertyCard';

const SkeletonCard = () => (
    <div className="property-card skeleton-card">
        <div className="property-card-image-wrap skeleton-shimmer" style={{ background: 'var(--surface)' }} />
        <div className="property-card-info">
            <div className="skeleton-line w-3/4" />
            <div className="skeleton-line w-1/2" />
            <div className="skeleton-line w-1/3" />
        </div>
    </div>
);

const PropertyGrid = ({ properties, loading, isWishlisted, onToggleWishlist }) => {
    if (loading) {
        return (
            <div className="property-grid">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (!properties || properties.length === 0) {
        return (
            <div className="property-grid-empty">
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>No properties found</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Try adjusting your filters or search in a different area.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="property-grid">
            {properties.map((property, index) => (
                <PropertyCard
                    key={property._id}
                    property={property}
                    index={index}
                    isWishlisted={isWishlisted?.(property._id)}
                    onToggleWishlist={onToggleWishlist}
                />
            ))}
        </div>
    );
};

export default PropertyGrid;
