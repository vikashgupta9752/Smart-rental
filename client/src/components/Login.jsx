import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = ({ setUser }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
        try {
            const { data } = await axios.post(`http://127.0.0.1:5000${endpoint}`, formData);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
            if (data.role === 'admin') navigate('/admin');
            else if (data.role === 'seller') navigate('/seller');
            else navigate('/customer');
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="auth-card"
            >
                {/* Logo */}
                <div className="auth-logo">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="var(--primary)">
                        <path d="M16 1C7.7 1 1 7.7 1 16s6.7 15 15 15 15-6.7 15-15S24.3 1 16 1zm6.9 22.5c-1.2 1.8-3.1 2.8-5.1 2.8-.9 0-1.8-.2-2.6-.6-1.4-.7-2.3-2-2.8-3.5-.7-2.3-.4-5 .8-7.6 1.1-2.3 2.8-4.2 4.7-5.3.9-.5 1.8-.8 2.6-.8 1.3 0 2.3.7 2.9 1.8.5.9.6 2.1.4 3.3-.3 1.7-1.3 3.5-2.8 5.1-1.1 1.2-2.4 2.1-3.6 2.5-.5.2-1 .3-1.4.3-.7 0-1.2-.3-1.5-.8-.2-.4-.3-.8-.2-1.3.2-1 1-2.2 2.2-3.4.8-.9 1.8-1.6 2.7-2 .3-.1.5-.1.6 0 .2.1.2.3.1.5-.4.7-1.2 1.5-2 2.2-.8.7-1.3 1.4-1.4 1.8 0 .2 0 .3.1.4.1.1.3.1.5.1.5-.1 1.1-.5 1.8-1.1 1.2-1.1 2-2.5 2.3-3.8.1-.7.1-1.4-.2-1.8-.3-.5-.8-.7-1.4-.7-.6 0-1.3.2-2 .7-1.5.9-2.9 2.5-3.8 4.4-1 2.1-1.3 4.3-.7 6 .4 1.1 1 1.9 2 2.4.6.3 1.2.4 1.8.4 1.5 0 3-.8 4-2.2.3-.4.5-.4.7-.2.2.2.2.5 0 .8z" />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="auth-title">
                    {isRegister ? 'Create your account' : 'Welcome to SmartRental'}
                </h1>
                <p className="auth-subtitle">
                    {isRegister ? 'Join our community of hosts and guests' : 'Log in to continue'}
                </p>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="auth-error"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isRegister ? 'register' : 'login'}
                            initial={{ opacity: 0, x: isRegister ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isRegister ? -20 : 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Name field (register only) */}
                            {isRegister && (
                                <div className="auth-field">
                                    <label>Full name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Email */}
                            <div className="auth-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {/* Password */}
                            <div className="auth-field">
                                <label>Password</label>
                                <div className="auth-pw-wrap">
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Phone (register only) */}
                            {isRegister && (
                                <div className="auth-field">
                                    <label>Phone number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                        <input
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            style={{ paddingLeft: 36 }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Role (register only) */}
                            {isRegister && (
                                <div className="auth-field">
                                    <label>I want to</label>
                                    <div className="auth-role-options">
                                        {[
                                            { value: 'customer', label: 'Book places', desc: 'Find and rent amazing spaces' },
                                            { value: 'seller', label: 'Host guests', desc: 'List your property and earn' },
                                            { value: 'admin', label: 'Manage platform', desc: 'Administrate the platform' }
                                        ].map(r => (
                                            <button
                                                key={r.value}
                                                type="button"
                                                className={`auth-role-card ${formData.role === r.value ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, role: r.value })}
                                            >
                                                <span className="auth-role-radio">
                                                    {formData.role === r.value && <span className="auth-role-dot" />}
                                                </span>
                                                <div>
                                                    <p className="auth-role-label">{r.label}</p>
                                                    <p className="auth-role-desc">{r.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Submit */}
                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? (
                            <Loader2 size={18} className="spin" />
                        ) : (
                            isRegister ? 'Sign up' : 'Log in'
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <span>or</span>
                </div>

                {/* Toggle */}
                <p className="auth-toggle">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                        {isRegister ? 'Log in' : 'Sign up'}
                    </button>
                </p>

                {/* Footer */}
                <p className="auth-footer">
                    By continuing, you agree to SmartRental's <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
