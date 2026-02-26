import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import MapView from '../common/MapView';
import {
    Star, MapPin, Heart, Share, ChevronLeft, ChevronRight, X,
    Wifi, Wind, UtensilsCrossed, Car, Dumbbell, Tv, Waves,
    Flame, Trees, Coffee, Eye, Mountain, Laptop, Sparkles,
    Shield, Award, Calendar, Users, ArrowLeft, Phone, Mail, ExternalLink,
    MessageCircle, Send, Loader2, Check, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AMENITY_ICONS = {
    wifi: Wifi, ac: Wind, kitchen: UtensilsCrossed, parking: Car, gym: Dumbbell,
    tv: Tv, pool: Waves, fireplace: Flame, garden: Trees, breakfast: Coffee,
    balcony: Eye, mountain_view: Mountain, workspace: Laptop, washer: Wind,
    terrace: Eye, jacuzzi: Waves, concierge: Award, spa: Sparkles,
    bbq: Flame, beach_access: Waves, lake_view: Waves, ocean_view: Waves,
    nature_view: Trees, guided_tours: MapPin, farm_activities: Trees,
    community_events: Users, gallery: Eye, laundry: Wind,
};

const PropertyDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingMsg, setBookingMsg] = useState(null);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showAllPhotos, setShowAllPhotos] = useState(false);

    // Messaging state
    const [showContactModal, setShowContactModal] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [messageSent, setMessageSent] = useState(false);

    const fetchProperty = useCallback(async () => {
        try {
            setLoading(true);
            const [propRes, revRes] = await Promise.all([
                axios.get(`http://127.0.0.1:5000/api/properties/${id}`),
                axios.get(`http://127.0.0.1:5000/api/reviews/${id}`)
            ]);
            setProperty(propRes.data);
            setReviews(revRes.data);

            // Check availability
            try {
                const availRes = await axios.get(`http://127.0.0.1:5000/api/bookings/availability/${id}`);
                setBookedDates(availRes.data);
            } catch (e) { }

            // Check wishlist
            if (user?.token) {
                try {
                    const wRes = await axios.get('http://127.0.0.1:5000/api/wishlist', {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    setIsWishlisted(wRes.data.some(p => p._id === id));
                } catch (e) { }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [id, user?.token]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        if (!messageContent.trim()) return;

        setSendingMessage(true);
        try {
            await axios.post('http://127.0.0.1:5000/api/messages', {
                receiverId: property.owner._id,
                content: messageContent,
                propertyId: property._id
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setMessageSent(true);
            setMessageContent('');
            setTimeout(() => {
                setShowContactModal(false);
                setMessageSent(false);
            }, 2000);
        } catch (err) {
            console.error(err);
            alert('Failed to send message. Please try again.');
        } finally {
            setSendingMessage(false);
        }
    };

    useEffect(() => {
        fetchProperty();
    }, [fetchProperty]);

    const toggleWishlist = async () => {
        if (!user?.token) return;
        try {
            const { data } = await axios.post(`http://127.0.0.1:5000/api/wishlist/${id}`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setIsWishlisted(data.wishlisted);
        } catch (e) { }
    };

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMode, setPaymentMode] = useState(null); // 'upi' or 'card'
    const [paymentId, setPaymentId] = useState('');

    const handleBook = async () => {
        if (!user?.token) { setBookingMsg({ type: 'error', text: 'Please login to book' }); return; }
        if (!checkIn || !checkOut) { setBookingMsg({ type: 'error', text: 'Select check-in and check-out dates' }); return; }

        if (!paymentId) {
            setBookingMsg({ type: 'success', text: 'Dates verified. Please select payment method.' });
            return;
        }

        finalizeBooking();
    };

    const finalizeBooking = async () => {
        setBookingLoading(true);
        setBookingMsg(null);
        try {
            await axios.post('http://127.0.0.1:5000/api/bookings', {
                propertyId: id, checkIn, checkOut, guests
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            setBookingMsg({ type: 'success', text: 'Booking confirmed! 🎉' });
            setShowPaymentModal(false);
            setPaymentId('');
            fetchProperty();
        } catch (err) {
            setBookingMsg({ type: 'error', text: err.response?.data?.error || 'Booking failed' });
        }
        finally { setBookingLoading(false); }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!user?.token) return;
        setReviewLoading(true);
        try {
            await axios.post('http://127.0.0.1:5000/api/reviews', {
                propertyId: id, rating: reviewRating, comment: reviewText
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            setReviewText('');
            setReviewRating(5);
            fetchProperty();
        } catch (err) {
            alert(err.response?.data?.error || 'Review failed');
        }
        finally { setReviewLoading(false); }
    };

    const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))) : 0;
    const totalPrice = (property?.price || 0) * nights;
    const today = new Date().toISOString().split('T')[0];

    if (loading) {
        return (
            <div style={{ padding: '40px 0' }}>
                <div className="detail-skeleton">
                    <div className="skeleton-shimmer" style={{ height: 400, borderRadius: 12 }} />
                    <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
                        <div style={{ flex: 1 }}><div className="skeleton-shimmer" style={{ height: 30, width: '60%', marginBottom: 8 }} /><div className="skeleton-shimmer" style={{ height: 18, width: '40%' }} /></div>
                        <div style={{ width: 340 }}><div className="skeleton-shimmer" style={{ height: 300, borderRadius: 12, border: '1px solid var(--card-border)' }} /></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!property) {
        return <div style={{ padding: '80px 0', textAlign: 'center' }}><p style={{ color: 'var(--text-muted)' }}>Property not found.</p><Link to="/browse" style={{ color: 'var(--primary)' }}>Browse properties</Link></div>;
    }

    const images = property.images?.length > 0 ? property.images : ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'];
    const ownerName = property.owner?.name || 'Host';
    const ownerInitial = ownerName[0]?.toUpperCase() || 'H';
    const displayAmenities = showAllAmenities ? property.amenities : (property.amenities || []).slice(0, 8);
    const avgRating = property.rating?.toFixed(2) || '0.00';
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => Math.round(r.rating) === star).length,
        pct: reviews.length > 0 ? (reviews.filter(r => Math.round(r.rating) === star).length / reviews.length) * 100 : 0
    }));

    return (
        <div className="detail-page">
            <div className="detail-header">
                <button onClick={() => navigate(-1)} className="detail-back"><ArrowLeft size={18} /></button>
                <div style={{ flex: 1 }}>
                    <h1 className="detail-title">{property.title}</h1>
                    <div className="detail-subtitle-row">
                        <span className="detail-rating"><Star size={13} fill="#000" stroke="#000" /> {avgRating}</span>
                        <span className="detail-dot">·</span>
                        <span className="detail-reviews-count">{property.reviewCount || 0} reviews</span>
                        <span className="detail-dot">·</span>
                        <span className="detail-location"><MapPin size={12} /> {property.location?.city}{property.location?.address ? `, ${property.location.address}` : ''}</span>
                    </div>
                </div>
                <div className="detail-actions">
                    <button className="detail-action-btn" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard! 📋');
                    }}>
                        <Share size={15} /> Share
                    </button>
                    <button className="detail-action-btn" onClick={toggleWishlist}>
                        <Heart size={15} fill={isWishlisted ? 'var(--primary)' : 'none'} stroke={isWishlisted ? 'var(--primary)' : 'currentColor'} /> Save
                    </button>
                </div>
            </div>

            <div className="detail-gallery" onClick={() => setShowAllPhotos(true)}>
                <div className="detail-gallery-main">
                    <img src={images[0]} alt="" className="detail-gallery-img" />
                </div>
                <div className="detail-gallery-grid">
                    {images.slice(1, 5).map((img, i) => (
                        <div key={i} className={`detail-gallery-cell ${i >= 2 ? 'detail-gallery-cell-br' : ''}`}>
                            <img src={img} alt="" className="detail-gallery-img" />
                        </div>
                    ))}
                </div>
                <button className="detail-gallery-showall">Show all photos</button>
            </div>

            <AnimatePresence>
                {showAllPhotos && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lightbox-overlay" onClick={() => setShowAllPhotos(false)}>
                        <button className="lightbox-close" onClick={() => setShowAllPhotos(false)}><X size={20} /></button>
                        <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                            {images.map((img, i) => (
                                <img key={i} src={img} alt="" className="lightbox-image" />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="detail-body">
                <div className="detail-main">
                    <div className="detail-host-section">
                        <div>
                            <h2 className="detail-host-title">{property.type?.charAt(0).toUpperCase() + property.type?.slice(1)} hosted by {ownerName}</h2>
                            <p className="detail-host-meta">{property.maxGuests} guests · {property.bedrooms} bedroom{property.bedrooms > 1 ? 's' : ''} · {property.bathrooms} bathroom{property.bathrooms > 1 ? 's' : ''}</p>
                        </div>
                        <div className="detail-host-avatar">
                            {ownerInitial}
                        </div>
                    </div>
                    <div className="detail-divider" />

                    <div className="detail-highlights">
                        <div className="detail-highlight">
                            <Award size={22} />
                            <div>
                                <p className="detail-highlight-title">{ownerName} is a Superhost</p>
                                <p className="detail-highlight-desc">Experienced, highly rated hosts committed to great stays.</p>
                            </div>
                        </div>
                        <div className="detail-highlight">
                            <MapPin size={22} />
                            <div>
                                <p className="detail-highlight-title">Great location</p>
                                <p className="detail-highlight-desc">95% of recent guests gave the location a 5-star rating.</p>
                            </div>
                        </div>
                        <div className="detail-highlight">
                            <Calendar size={22} />
                            <div>
                                <p className="detail-highlight-title">Free cancellation before check-in</p>
                                <p className="detail-highlight-desc">Get a full refund if you change your mind.</p>
                            </div>
                        </div>
                    </div>
                    <div className="detail-divider" />

                    <div className="detail-section">
                        <h2 className="detail-section-title">Contact the Host</h2>
                        <div className="seller-contact-card">
                            <div className="seller-contact-header">
                                <div className="seller-contact-avatar">
                                    {ownerInitial}
                                </div>
                                <div className="seller-contact-info">
                                    <h3 className="seller-contact-name">{ownerName}</h3>
                                    <p className="seller-contact-label">Property Owner</p>
                                </div>
                            </div>
                            <div className="seller-contact-actions">
                                {property.owner?.phone && (
                                    <a href={`tel:${property.owner.phone}`} className="seller-contact-btn seller-contact-call">
                                        <Phone size={16} />
                                        <span>{property.owner.phone}</span>
                                    </a>
                                )}
                                {property.owner?.email && (
                                    <a href={`mailto:${property.owner.email}?subject=Inquiry about ${property.title}`} className="seller-contact-btn seller-contact-email">
                                        <Mail size={16} />
                                        <span>{property.owner.email}</span>
                                    </a>
                                )}
                                <button
                                    onClick={() => user ? setShowContactModal(true) : navigate('/login')}
                                    className="seller-contact-btn seller-contact-message"
                                >
                                    <MessageCircle size={16} />
                                    <span>Message Host</span>
                                </button>
                            </div>
                            {!property.owner?.phone && !property.owner?.email && (
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '8px' }}>Contact information not available.</p>
                            )}
                        </div>
                    </div>
                    <div className="detail-divider" />

                    <div className="detail-section">
                        <p className="detail-description">{property.description}</p>
                    </div>
                    <div className="detail-divider" />

                    <div className="detail-section">
                        <h2 className="detail-section-title">What this place offers</h2>
                        <div className="detail-amenities-grid">
                            {displayAmenities.map(a => {
                                const Icon = AMENITY_ICONS[a] || Sparkles;
                                return (
                                    <div key={a} className="detail-amenity-item">
                                        <Icon size={22} />
                                        <span>{a.replace(/_/g, ' ')}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {(property.amenities || []).length > 8 && (
                            <button className="detail-show-more-btn" onClick={() => setShowAllAmenities(!showAllAmenities)}>
                                {showAllAmenities ? 'Show less' : `Show all ${property.amenities.length} amenities`}
                            </button>
                        )}
                    </div>
                    <div className="detail-section">
                        <h2 className="detail-section-title">Where you'll be</h2>
                        <MapView
                            properties={[property]}
                            center={[property.location?.lat || 20, property.location?.lng || 78]}
                            zoom={15}
                            height="400px"
                        />
                        <div className="map-location-footer">
                            <p className="map-address-text">
                                <MapPin size={14} />
                                {property.location?.address ? `${property.location.address}, ` : ''}{property.location?.city || 'India'}
                            </p>
                            {property.location?.lat && property.location?.lng && property.location.lat !== 0 && (
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${property.location.lat},${property.location.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="get-directions-btn"
                                >
                                    <ExternalLink size={14} />
                                    Get Directions
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="detail-divider" />

                    <div className="detail-section">
                        <div className="detail-reviews-header">
                            <Star size={18} fill="#000" stroke="#000" />
                            <span className="detail-reviews-avg">{avgRating}</span>
                            <span className="detail-dot">·</span>
                            <span className="detail-reviews-total">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="detail-rating-bars">
                            {ratingDistribution.map(d => (
                                <div key={d.star} className="detail-rating-bar-row">
                                    <span className="detail-rating-bar-label">{d.star}</span>
                                    <div className="detail-rating-bar-bg">
                                        <div className="detail-rating-bar-fill" style={{ width: `${d.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="detail-reviews-list">
                            {reviews.slice(0, 6).map(r => (
                                <div key={r._id} className="detail-review-card">
                                    <div className="detail-review-header">
                                        <div className="detail-review-avatar">{r.user?.name?.[0]?.toUpperCase() || 'U'}</div>
                                        <div>
                                            <p className="detail-review-name">{r.user?.name || 'User'}</p>
                                            <p className="detail-review-date">{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="detail-review-stars">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} size={11} fill={i < r.rating ? '#000' : 'none'} stroke="#000" />
                                        ))}
                                    </div>
                                    <p className="detail-review-text">{r.comment}</p>
                                </div>
                            ))}
                        </div>

                        {user && user.role === 'customer' && (
                            <form onSubmit={handleReview} className="detail-review-form">
                                <h3 className="detail-review-form-title">Leave a review</h3>
                                <div className="detail-review-stars-input">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} type="button" onClick={() => setReviewRating(s)} className="detail-star-btn">
                                            <Star size={20} fill={s <= reviewRating ? '#000' : 'none'} stroke="#000" />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={reviewText}
                                    onChange={e => setReviewText(e.target.value)}
                                    placeholder="Share your experience..."
                                    className="detail-review-textarea"
                                    required
                                />
                                <button type="submit" className="detail-review-submit" disabled={reviewLoading}>
                                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="detail-booking-wrap">
                    <div className="detail-booking-panel">
                        <div className="detail-booking-price-row">
                            <span className="detail-booking-price">₹{property.price?.toLocaleString()}</span>
                            <span className="detail-booking-per">night</span>
                        </div>
                        {property.reviewCount > 0 && (
                            <div className="detail-booking-rating">
                                <Star size={11} fill="#000" stroke="#000" /> {avgRating} · <span>{property.reviewCount} reviews</span>
                            </div>
                        )}

                        <div className="detail-booking-dates">
                            <div className="detail-booking-date-field">
                                <label>CHECK-IN</label>
                                <input type="date" value={checkIn} min={today} onChange={e => setCheckIn(e.target.value)} />
                            </div>
                            <div className="detail-booking-date-field">
                                <label>CHECKOUT</label>
                                <input type="date" value={checkOut} min={checkIn || today} onChange={e => setCheckOut(e.target.value)} />
                            </div>
                        </div>
                        <div className="detail-booking-guests-field">
                            <label>GUESTS</label>
                            <select value={guests} onChange={e => setGuests(Number(e.target.value))}>
                                {Array.from({ length: property.maxGuests || 4 }).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>

                        <button className="detail-booking-reserve" onClick={handleBook} disabled={bookingLoading}>
                            {bookingLoading ? 'Processing...' : (paymentId ? 'Confirm Reservation' : 'Reserve')}
                        </button>

                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                className="detail-booking-reserve"
                                style={{ background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '0.8rem' }}
                                onClick={() => { setPaymentMode('upi'); setShowPaymentModal(true); }}
                            >
                                Pay via UPI
                            </button>
                            <button
                                className="detail-booking-reserve"
                                style={{ background: 'var(--surface)', color: 'var(--text-main)', border: '1px solid var(--card-border)', fontSize: '0.8rem' }}
                                onClick={() => { setPaymentMode('card'); setShowPaymentModal(true); }}
                            >
                                Pay via Card
                            </button>
                        </div>

                        {bookingMsg && (
                            <p className={`detail-booking-msg ${bookingMsg.type === 'error' && bookingMsg.text.includes('balance') ? 'success' : bookingMsg.type}`} style={{
                                background: bookingMsg.text.includes('balance') ? 'rgba(16, 185, 129, 0.1)' : '',
                                color: bookingMsg.text.includes('balance') ? '#10b981' : ''
                            }}>
                                {bookingMsg.text.includes('balance') ? 'Ready to pay via UPI/Card' : bookingMsg.text}
                            </p>
                        )}

                        {nights > 0 && (
                            <div className="detail-booking-breakdown">
                                <div className="detail-booking-line">
                                    <span>{property.price?.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                                    <span>₹{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="detail-booking-total">
                                    <span>Total</span>
                                    <span>₹{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            style={{
                                background: 'var(--card-bg)', padding: '32px', borderRadius: '24px',
                                width: '100%', maxWidth: '400px', border: '1px solid var(--card-border)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{paymentMode === 'upi' ? 'UPI Payment' : 'Card Payment'}</h3>
                                <button onClick={() => setShowPaymentModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
                            </div>

                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                Enter your {paymentMode === 'upi' ? 'UPI ID' : 'Card Details'} to complete the reservation.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {paymentMode === 'upi' ? (
                                    <input
                                        type="text"
                                        placeholder="username@upi"
                                        value={paymentId}
                                        onChange={(e) => setPaymentId(e.target.value)}
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--text-main)' }}
                                    />
                                ) : (
                                    <>
                                        <input
                                            type="text" placeholder="Card Number"
                                            value={paymentId} onChange={(e) => setPaymentId(e.target.value)}
                                            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--text-main)' }}
                                        />
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <input type="text" placeholder="MM/YY" style={{ flex: 1, minWidth: 0, width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--text-main)' }} />
                                            <input type="text" placeholder="CVV" style={{ flex: 1, minWidth: 0, width: '100%', padding: '14px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--card-border)', color: 'var(--text-main)' }} />
                                        </div>
                                    </>
                                )}

                                <button
                                    onClick={finalizeBooking}
                                    disabled={!paymentId || bookingLoading}
                                    style={{
                                        padding: '16px', borderRadius: '12px', background: 'var(--primary)',
                                        color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer',
                                        marginTop: '12px', opacity: !paymentId ? 0.5 : 1
                                    }}
                                >
                                    {bookingLoading ? 'Processing...' : 'Pay & Confirm Reservation'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showContactModal && (
                    <div className="contact-modal-overlay" onClick={() => setShowContactModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="contact-modal-content"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="contact-modal-header">
                                <h3 className="contact-modal-title">Message {ownerName}</h3>
                                <button className="contact-modal-close" onClick={() => setShowContactModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="contact-modal-body">
                                <div className="contact-host-preview">
                                    <div className="contact-host-avatar">{ownerInitial}</div>
                                    <div>
                                        <p className="contact-host-name">Typically responds within an hour</p>
                                        <p className="contact-host-sub">Ask about availability or specific details</p>
                                    </div>
                                </div>

                                {messageSent ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="message-success-state"
                                    >
                                        <div className="message-success-icon"><Check size={32} /></div>
                                        <p>Message sent successfully!</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSendMessage} className="contact-message-form">
                                        <textarea
                                            placeholder={`Hi ${ownerName}, I'm interested in your property...`}
                                            value={messageContent}
                                            onChange={e => setMessageContent(e.target.value)}
                                            required
                                        ></textarea>
                                        <button
                                            type="submit"
                                            className="contact-send-btn"
                                            disabled={sendingMessage || !messageContent.trim()}
                                        >
                                            {sendingMessage ? (
                                                <Loader2 size={18} className="spin" />
                                            ) : (
                                                <>
                                                    <Send size={18} />
                                                    <span>Send message</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PropertyDetail;
