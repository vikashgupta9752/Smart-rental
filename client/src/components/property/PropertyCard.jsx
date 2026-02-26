import React, { useState } from 'react';
import { Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const PropertyCard = ({ property, isWishlisted, onToggleWishlist, index = 0 }) => {
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);
    const images = property.images?.length > 0
        ? property.images
        : ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'];

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImage(prev => (prev + 1) % images.length);
    };
    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImage(prev => (prev - 1 + images.length) % images.length);
    };
    const handleWishlist = (e) => {
        e.stopPropagation();
        onToggleWishlist?.(property._id);
    };

    // Property-style type label
    const typeLabel = (property.type || 'room').charAt(0).toUpperCase() + (property.type || 'room').slice(1);
    const cityName = property.location?.city || property.location?.id || 'India';
    const isGuestFavourite = (property.rating || 0) >= 4.7;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.03, duration: 0.3 }}
            className="pcard"
            onClick={() => navigate(`/property/${property._id}`)}
        >
            {/* Image */}
            <div className="pcard-img-wrap">
                <img
                    src={images[currentImage]}
                    alt={property.title}
                    className="pcard-img"
                    loading="lazy"
                    onLoad={() => setImgLoaded(true)}
                    style={{ opacity: imgLoaded ? 1 : 0 }}
                />
                {!imgLoaded && <div className="pcard-img-placeholder" />}

                {/* Guest favourite badge */}
                {isGuestFavourite && (
                    <div className="pcard-badge">Guest favourite</div>
                )}

                {/* Wishlist Heart */}
                <button
                    className="pcard-heart"
                    onClick={handleWishlist}
                    aria-label="Toggle wishlist"
                >
                    <Heart
                        size={22}
                        fill={isWishlisted ? 'var(--primary)' : 'rgba(0,0,0,0.5)'}
                        stroke={isWishlisted ? 'var(--primary)' : '#fff'}
                        strokeWidth={1.5}
                    />
                </button>

                {/* Image Navigation */}
                {images.length > 1 && (
                    <>
                        <button className="pcard-arrow pcard-arrow-l" onClick={prevImage}><ChevronLeft size={14} /></button>
                        <button className="pcard-arrow pcard-arrow-r" onClick={nextImage}><ChevronRight size={14} /></button>
                        <div className="pcard-dots">
                            {images.slice(0, 5).map((_, i) => (
                                <span key={i} className={`pcard-dot ${i === currentImage ? 'active' : ''}`} />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Info — Property style */}
            <div className="pcard-info">
                <div className="pcard-row1">
                    <span className="pcard-title">{typeLabel} in {cityName}</span>
                    <span className="pcard-rating">
                        <Star size={12} fill="#000" stroke="#000" /> {property.rating?.toFixed(2) || '4.50'}
                    </span>
                </div>
                <p className="pcard-subtitle">{property.title}</p>
                <p className="pcard-price">
                    <span className="pcard-price-val">₹{property.price?.toLocaleString()}</span>
                    <span className="pcard-price-per"> night</span>
                </p>
            </div>
        </motion.div>
    );
};

export default PropertyCard;
