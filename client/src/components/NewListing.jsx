import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Loader2, Camera, X, Plus,
    MapPin, IndianRupee, Home, Bed, Bath, Users,
    Wifi, Wind, UtensilsCrossed, Car, Dumbbell, Tv,
    Waves, Flame, Trees, Coffee, Eye, Mountain,
    Laptop, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import MapPicker from './common/MapPicker';

const PROPERTY_TYPES = [
    { value: 'apartment', label: 'Apartment', desc: 'A rented unit within a residential building' },
    { value: 'house', label: 'House', desc: 'An entire residential home for guests' },
    { value: 'land', label: 'Land', desc: 'Plot for construction or development' },
    { value: 'studio', label: 'Studio', desc: 'A compact, self-contained space' },
    { value: 'parking', label: 'Parking', desc: 'Secured parking space for vehicles' },
    { value: 'room', label: 'Room', desc: 'A private room in someone\'s home' },
];

const AMENITY_OPTIONS = [
    { id: 'wifi', label: 'Wifi', icon: Wifi },
    { id: 'ac', label: 'Air conditioning', icon: Wind },
    { id: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed },
    { id: 'parking', label: 'Free parking', icon: Car },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'pool', label: 'Pool', icon: Waves },
    { id: 'fireplace', label: 'Fireplace', icon: Flame },
    { id: 'garden', label: 'Garden', icon: Trees },
    { id: 'breakfast', label: 'Breakfast', icon: Coffee },
    { id: 'balcony', label: 'Balcony', icon: Eye },
    { id: 'mountain_view', label: 'Mountain view', icon: Mountain },
    { id: 'workspace', label: 'Workspace', icon: Laptop },
    { id: 'washer', label: 'Washer', icon: Wind },
];

const CITIES = [
    'Agra', 'Ahmedabad', 'Alleppey', 'Amritsar', 'Aurangabad',
    'Bangalore', 'Bhopal', 'Bhubaneswar', 'Chandigarh', 'Chennai',
    'Coorg', 'Darjeeling', 'Dehradun', 'Delhi', 'Gangtok',
    'Goa', 'Gokarna', 'Gurgaon', 'Guwahati', 'Haridwar',
    'Hyderabad', 'Indore', 'Jaipur', 'Jodhpur', 'Kochi',
    'Kolkata', 'Leh', 'Lonavala', 'Lucknow', 'Manali',
    'Mangalore', 'Mathura', 'Mcleodganj', 'Mount Abu', 'Mumbai',
    'Munnar', 'Mussoorie', 'Mysore', 'Nagpur', 'Nainital',
    'Nashik', 'Noida', 'Ooty', 'Pondicherry', 'Pune',
    'Pushkar', 'Rishikesh', 'Shimla', 'Srinagar', 'Surat',
    'Tirupati', 'Trivandrum', 'Udaipur', 'Ujjain', 'Varanasi',
    'Vijayawada', 'Visakhapatnam', 'Wayanad'
];

const NewListing = ({ user }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'apartment',
        price: '',
        city: '',
        address: '',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: [],
        images: [''],
        lat: null,
        lng: null,
    });

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const toggleAmenity = (id) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(id)
                ? prev.amenities.filter(a => a !== id)
                : [...prev.amenities, id]
        }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const updateImage = (index, value) => {
        const imgs = [...formData.images];
        imgs[index] = value;
        setFormData(prev => ({ ...prev, images: imgs }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:5000/api/properties', {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                price: parseFloat(formData.price),
                location: {
                    id: formData.city,
                    city: formData.city,
                    address: formData.address,
                    x: 0,
                    y: 0,
                    lat: formData.lat || 0,
                    lng: formData.lng || 0,
                },
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                maxGuests: formData.maxGuests,
                amenities: formData.amenities,
                images: formData.images.filter(url => url.trim()),
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSuccess(true);
            setTimeout(() => navigate('/seller'), 2000);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    const totalSteps = 4;
    const canNext = () => {
        if (step === 1) return formData.type;
        if (step === 2) return formData.title && formData.city && formData.price;
        if (step === 3) return formData.amenities.length > 0;
        return true;
    };

    if (success) {
        return (
            <div className="nl-success">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <CheckCircle size={64} style={{ color: 'var(--primary)' }} />
                </motion.div>
                <h2>Your listing is published!</h2>
                <p>Guests can now discover and book your property.</p>
            </div>
        );
    }

    return (
        <div className="nl-page">
            {/* Top bar */}
            <div className="nl-topbar">
                <button className="nl-back" onClick={() => step > 1 ? setStep(step - 1) : navigate('/seller')}>
                    <ChevronLeft size={18} />
                </button>
                <div className="nl-progress">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className={`nl-progress-dot ${i + 1 <= step ? 'active' : ''}`} />
                    ))}
                </div>
                <button className="nl-exit" onClick={() => navigate('/seller')}>Exit</button>
            </div>

            {/* Step Content */}
            <div className="nl-content">
                {/* Step 1: Property Type */}
                {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="nl-step">
                        <div className="nl-step-header">
                            <p className="nl-step-label">Step 1</p>
                            <h2 className="nl-step-title">What type of place will guests have?</h2>
                        </div>
                        <div className="nl-type-grid">
                            {PROPERTY_TYPES.map(t => (
                                <button
                                    key={t.value}
                                    className={`nl-type-card ${formData.type === t.value ? 'active' : ''}`}
                                    onClick={() => updateField('type', t.value)}
                                >
                                    <Home size={24} />
                                    <span className="nl-type-label">{t.label}</span>
                                    <span className="nl-type-desc">{t.desc}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="nl-step">
                        <div className="nl-step-header">
                            <p className="nl-step-label">Step 2</p>
                            <h2 className="nl-step-title">Share some details about your place</h2>
                        </div>
                        <div className="nl-form-grid">
                            <div className="nl-field nl-field-full">
                                <label>Title</label>
                                <input
                                    type="text"
                                    placeholder="Give your place a catchy title"
                                    value={formData.title}
                                    onChange={e => updateField('title', e.target.value)}
                                />
                            </div>
                            <div className="nl-field nl-field-full">
                                <label>Description</label>
                                <textarea
                                    placeholder="Describe what makes your place special..."
                                    value={formData.description}
                                    onChange={e => updateField('description', e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="nl-field">
                                <label>City</label>
                                <select value={formData.city} onChange={e => updateField('city', e.target.value)}>
                                    <option value="">Select a city</option>
                                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="nl-field">
                                <label>Address</label>
                                <input
                                    type="text"
                                    placeholder="Street address or area"
                                    value={formData.address}
                                    onChange={e => updateField('address', e.target.value)}
                                />
                            </div>

                            {/* Map Picker */}
                            <div className="nl-field nl-field-full">
                                <label>Pin exact location on map</label>
                                <MapPicker
                                    onLocationSelect={({ lat, lng }) => {
                                        updateField('lat', lat);
                                        updateField('lng', lng);
                                    }}
                                    initialPosition={formData.lat && formData.lng ? { lat: formData.lat, lng: formData.lng } : null}
                                />
                            </div>
                            <div className="nl-field">
                                <label>
                                    {formData.type === 'land' ? 'Price per month (₹)' :
                                        formData.type === 'parking' ? 'Price per car/bike (₹)' :
                                            'Price per night (₹)'}
                                </label>
                                <input
                                    type="number"
                                    placeholder="2,500"
                                    value={formData.price}
                                    onChange={e => updateField('price', e.target.value)}
                                />
                            </div>
                            {formData.type !== 'land' && formData.type !== 'parking' && (
                                <>
                                    <div className="nl-field">
                                        <label>Bedrooms</label>
                                        <div className="nl-counter">
                                            <button type="button" onClick={() => updateField('bedrooms', Math.max(1, formData.bedrooms - 1))}>−</button>
                                            <span>{formData.bedrooms}</span>
                                            <button type="button" onClick={() => updateField('bedrooms', formData.bedrooms + 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className="nl-field">
                                        <label>Bathrooms</label>
                                        <div className="nl-counter">
                                            <button type="button" onClick={() => updateField('bathrooms', Math.max(1, formData.bathrooms - 1))}>−</button>
                                            <span>{formData.bathrooms}</span>
                                            <button type="button" onClick={() => updateField('bathrooms', formData.bathrooms + 1)}>+</button>
                                        </div>
                                    </div>
                                    <div className="nl-field">
                                        <label>Max guests</label>
                                        <div className="nl-counter">
                                            <button type="button" onClick={() => updateField('maxGuests', Math.max(1, formData.maxGuests - 1))}>−</button>
                                            <span>{formData.maxGuests}</span>
                                            <button type="button" onClick={() => updateField('maxGuests', formData.maxGuests + 1)}>+</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Amenities */}
                {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="nl-step">
                        <div className="nl-step-header">
                            <p className="nl-step-label">Step 3</p>
                            <h2 className="nl-step-title">Tell guests what your place has to offer</h2>
                            <p className="nl-step-desc">You can add more amenities after you publish.</p>
                        </div>
                        <div className="nl-amenity-grid">
                            {AMENITY_OPTIONS.map(a => (
                                <button
                                    key={a.id}
                                    className={`nl-amenity-card ${formData.amenities.includes(a.id) ? 'active' : ''}`}
                                    onClick={() => toggleAmenity(a.id)}
                                >
                                    <a.icon size={22} />
                                    <span>{a.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Step 4: Photos + Review */}
                {step === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="nl-step">
                        <div className="nl-step-header">
                            <p className="nl-step-label">Step 4</p>
                            <h2 className="nl-step-title">Add photos and review your listing</h2>
                            <p className="nl-step-desc">Add image URLs to showcase your property.</p>
                        </div>

                        {/* Photos */}
                        <div className="nl-photos-section">
                            {formData.images.map((url, i) => (
                                <div key={i} className="nl-photo-input">
                                    <Camera size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                                    <input
                                        type="url"
                                        placeholder="Paste image URL..."
                                        value={url}
                                        onChange={e => updateImage(i, e.target.value)}
                                    />
                                    {formData.images.length > 1 && (
                                        <button onClick={() => removeImage(i)} className="nl-photo-remove"><X size={14} /></button>
                                    )}
                                </div>
                            ))}
                            <button className="nl-add-photo" onClick={addImageField}>
                                <Plus size={14} /> Add another photo
                            </button>
                        </div>

                        {/* Review Summary */}
                        <div className="nl-review-summary">
                            <h3>Review your listing</h3>
                            <div className="nl-review-grid">
                                <div className="nl-review-item">
                                    <span className="nl-review-label">Title</span>
                                    <span className="nl-review-value">{formData.title || '—'}</span>
                                </div>
                                <div className="nl-review-item">
                                    <span className="nl-review-label">Type</span>
                                    <span className="nl-review-value">{formData.type}</span>
                                </div>
                                <div className="nl-review-item">
                                    <span className="nl-review-label">Location</span>
                                    <span className="nl-review-value">{formData.city || '—'}{formData.address ? `, ${formData.address}` : ''}</span>
                                </div>
                                <div className="nl-review-item">
                                    <span className="nl-review-label">Price</span>
                                    <span className="nl-review-value">
                                        ₹{formData.price || '0'}/
                                        {formData.type === 'land' ? 'month' :
                                            formData.type === 'parking' ? 'car-bike' :
                                                'night'}
                                    </span>
                                </div>
                                {formData.type !== 'land' && formData.type !== 'parking' && (
                                    <div className="nl-review-item">
                                        <span className="nl-review-label">Capacity</span>
                                        <span className="nl-review-value">{formData.maxGuests} guests · {formData.bedrooms} bed · {formData.bathrooms} bath</span>
                                    </div>
                                )}
                                <div className="nl-review-item">
                                    <span className="nl-review-label">Amenities</span>
                                    <span className="nl-review-value">{formData.amenities.join(', ') || '—'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Bottom Bar */}
            <div className="nl-bottombar">
                {step > 1 && (
                    <button className="nl-back-btn" onClick={() => setStep(step - 1)}>Back</button>
                )}
                <div style={{ flex: 1 }} />
                {step < totalSteps ? (
                    <button
                        className="nl-next-btn"
                        disabled={!canNext()}
                        onClick={() => setStep(step + 1)}
                    >
                        Next
                    </button>
                ) : (
                    <button
                        className="nl-publish-btn"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? <Loader2 size={16} className="spin" /> : 'Publish listing'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default NewListing;
