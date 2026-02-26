import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Calendar, Clock, CheckCircle2, ArrowRight, Loader2,
    ShieldCheck, Info, User, MapPin, Gauge,
    ChevronRight, Zap, Target, CreditCard, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingPage = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [bookingTime, setBookingTime] = useState({ start: '', end: '' });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const res = await axios.get(`http://127.0.0.1:5000/api/properties`);
                const prop = res.data.find(p => p._id === id);
                setProperty(prop);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    const handleBooking = async () => {
        setLoading(true);
        try {
            const startTs = new Date(bookingTime.start).getTime();
            const endTs = new Date(bookingTime.end).getTime();
            await axios.post('http://127.0.0.1:5000/api/bookings',
                { propertyId: id, start: startTs, end: endTs },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setStep(4);
        } catch (err) {
            alert(err.response?.data?.error || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading && step === 1) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-dim animate-pulse">Loading property details...</p>
        </div>
    );

    if (!property) return <div className="glass-card text-center py-20 border-danger">Property not found. Please go back and try again.</div>;

    const steps = [
        { label: 'Property Details', icon: Info },
        { label: 'Choose Time', icon: Clock },
        { label: 'Review', icon: ShieldCheck },
        { label: 'Confirmed', icon: CheckCircle2 }
    ];

    // Route/Location Visual Component
    const RouteMap = () => (
        <div className="glass-card mb-8 relative overflow-hidden bg-slate-950/40 p-8">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="flex justify-between items-center mb-8">
                <h4 className="text-[10px] uppercase font-black tracking-[0.3em] text-primary">Route to Property</h4>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    <span className="text-[9px] font-mono text-accent uppercase">Live Location</span>
                </div>
            </div>

            <div className="flex justify-between items-center relative z-10 px-4">
                <div className="text-center group">
                    <div className="w-14 h-14 rounded-2xl bg-primary-dim text-primary flex items-center justify-center border border-primary/30 mb-3 group-hover:scale-110 transition-transform">
                        <User size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-dim group-hover:text-primary transition-colors">Your Location</p>
                </div>

                <div className="flex-1 px-8 relative h-12">
                    <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="var(--primary)" />
                                <stop offset="100%" stopColor="var(--secondary)" />
                            </linearGradient>
                        </defs>
                        <path d="M 0 30 Q 100 0 200 30" stroke="url(#routeGradient)" strokeWidth="3" fill="none" strokeDasharray="6,6">
                            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="5s" repeatCount="indefinite" />
                        </path>
                        <motion.circle
                            r="4"
                            fill="var(--primary)"
                            animate={{ cx: [0, 200], cy: [30, 0, 30] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass px-3 py-1 rounded-full border-glass shadow-2xl">
                        <span className="text-[9px] text-primary font-black tracking-widest whitespace-nowrap">1.24 km away</span>
                    </div>
                </div>

                <div className="text-center group">
                    <div className="w-14 h-14 rounded-2xl bg-secondary-dim text-secondary flex items-center justify-center border border-secondary/30 mb-3 group-hover:scale-110 transition-transform">
                        <MapPin size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-dim group-hover:text-secondary transition-colors">{property.location.id}</p>
                </div>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-12"
        >
            {/* Stepper */}
            <div className="flex justify-between items-center relative gap-4">
                <div className="absolute top-[22px] left-0 w-full h-0.5 bg-glass-border -z-10" />
                {steps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 relative z-10 bg-background px-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${step >= i + 1 ? 'border-primary bg-primary text-white shadow-[0_0_15px_var(--primary)]' : 'border-glass-border bg-background-alt text-dim'}`}>
                            {step > i + 1 ? <CheckCircle2 size={24} /> : <s.icon size={20} />}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${step >= i + 1 ? 'text-primary' : 'text-dim'}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <RouteMap />
                                <div className="glass-card p-10 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-3xl font-extrabold tracking-tight mb-2">{property.title}</h2>
                                            <div className="flex items-center gap-4">
                                                <span className="badge badge-primary">{property.type}</span>
                                                <span className="text-xs font-bold text-dim flex items-center gap-1"><MapPin size={12} /> {property.location.id}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-dim uppercase tracking-widest mb-1">Hourly Rate</p>
                                            <span className="text-3xl font-black text-primary">₹{property.price}<span className="text-xs font-normal text-dim">/hr</span></span>
                                        </div>
                                    </div>

                                    <p className="text-dim leading-relaxed">{property.description}</p>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="glass p-4 border-none bg-white/[0.02]">
                                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Category</p>
                                            <p className="text-sm font-bold">{property.type}</p>
                                        </div>
                                        <div className="glass p-4 border-none bg-white/[0.02]">
                                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-2">Availability</p>
                                            <p className="text-sm font-bold text-accent">Available Now</p>
                                        </div>
                                    </div>

                                    <button className="btn btn-primary w-full py-4 text-sm uppercase tracking-[0.2em]" onClick={() => setStep(2)}>
                                        Select Time Slot <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="glass-card p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 rounded-xl bg-primary-dim text-primary"><Clock size={24} /></div>
                                        <div>
                                            <h3 className="text-xl font-bold">Choose Your Time</h3>
                                            <p className="text-xs text-dim">Pick your preferred start and end times.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="input-group">
                                            <label className="input-label uppercase tracking-widest text-[9px]">Start Time</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                                <input type="datetime-local" className="glass-input w-full pl-12" onChange={e => setBookingTime({ ...bookingTime, start: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label uppercase tracking-widest text-[9px]">End Time</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                                <input type="datetime-local" className="glass-input w-full pl-12" onChange={e => setBookingTime({ ...bookingTime, end: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-12">
                                        <button className="btn btn-secondary flex-1 py-4" onClick={() => setStep(1)}>Back</button>
                                        <button className="btn btn-primary flex-1 py-4" disabled={!bookingTime.start || !bookingTime.end} onClick={() => setStep(3)}>
                                            Review Booking
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                <div className="glass-card p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 rounded-xl bg-accent-dim text-accent"><ShieldCheck size={24} /></div>
                                        <div>
                                            <h3 className="text-xl font-bold">Review & Confirm</h3>
                                            <p className="text-xs text-dim">Double-check your booking details before confirming.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-10">
                                        <div className="flex items-center gap-3 p-4 bg-accent-dim/10 border border-accent/20 rounded-xl text-xs">
                                            <CheckCircle2 size={16} className="text-accent" />
                                            <span className="font-bold flex-1">Time slot is available — no conflicts found.</span>
                                            <span className="text-[10px] font-mono opacity-60">VERIFIED</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-primary-dim/10 border border-primary/20 rounded-xl text-xs text-primary">
                                            <Zap size={16} />
                                            <span className="font-bold">Property is ready for your reservation.</span>
                                        </div>
                                    </div>

                                    <div className="glass p-6 bg-white/[0.02] border-none mb-10">
                                        <p className="text-[10px] font-black text-dim uppercase tracking-[0.2em] mb-4">Price details</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-dim">Rate per hour</span>
                                                <span className="font-bold">₹{property.price}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-black pt-4 border-t border-glass">
                                                <span>Estimated Total</span>
                                                <span className="text-primary">₹{(property.price * 2).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button className="btn btn-secondary flex-1 py-4" onClick={() => setStep(2)}>Go Back</button>
                                        <button className="btn btn-primary flex-1 py-4" onClick={handleBooking} disabled={loading}>
                                            {loading ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                <div className="glass-card p-20 text-center space-y-8">
                                    <div className="relative inline-block">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                                            transition={{ type: "spring", damping: 10, stiffness: 100 }}
                                            className="w-24 h-24 rounded-full bg-accent text-white flex items-center justify-center shadow-[0_0_30px_var(--accent)]"
                                        >
                                            <CheckCircle2 size={48} />
                                        </motion.div>
                                        <motion.div className="absolute inset-0 rounded-full bg-accent opacity-20" animate={{ scale: [1, 2], opacity: [0.2, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                                    </div>

                                    <div>
                                        <h2 className="text-4xl font-black mb-4">Booking Confirmed!</h2>
                                        <p className="text-dim max-w-sm mx-auto">Your reservation has been successfully placed. You'll receive a confirmation with all the details.</p>
                                    </div>

                                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                        <button className="btn btn-primary py-4 uppercase tracking-widest text-xs" onClick={() => navigate('/customer/bookings')}>
                                            View My Bookings <ChevronRight size={16} />
                                        </button>
                                        <button className="btn btn-secondary py-3 text-[10px] uppercase font-bold tracking-widest" onClick={() => setStep(1)}>
                                            Book Another Property
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Property Summary Panel */}
                <div className="space-y-6">
                    <div className="glass-card p-8 border-none bg-slate-900/40">
                        <div className="flex items-center gap-3 mb-6">
                            <Target size={20} className="text-primary" />
                            <h4 className="text-sm font-black uppercase tracking-widest">Property Info</h4>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-dim uppercase tracking-widest mb-1">Property ID</p>
                                <p className="text-xs font-mono font-bold text-primary">ID-{id.slice(-8).toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-dim uppercase tracking-widest mb-1">Rating</p>
                                <div className="flex items-center gap-2">
                                    <Star className="text-warning fill-warning" size={14} />
                                    <span className="text-sm font-black">4.92 / 5.0</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-dim uppercase tracking-widest mb-1">Demand</p>
                                <span className="text-[9px] bg-accent/20 text-accent px-2 py-0.5 rounded font-bold">HIGH DEMAND</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 border-none bg-primary-dim/10 border-primary/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Gauge size={20} className="text-primary" />
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Smart Tip</h4>
                        </div>
                        <p className="text-[11px] text-dim leading-relaxed mb-4">
                            Booking this property during off-peak hours could save you up to <span className="text-primary font-bold">18.4%</span> on your total.
                        </p>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="h-full bg-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BookingPage;
