import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Navbar';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';
import SellerPanel from './components/SellerPanel';
import CustomerPanel from './components/CustomerPanel';
import Login from './components/Login';
import BrowseSpaces from './components/BrowseSpaces';
import ProtectedRoute from './components/ProtectedRoute';
import NewListing from './components/NewListing';
import PropertyDetail from './components/property/PropertyDetail';
import SavedProperties from './components/customer/SavedProperties';
import { SystemMetricsProvider } from './context/SystemMetrics';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

// Customer Sub-Components
import SearchResults from './components/customer/SearchResults';
import BookingPage from './components/customer/BookingPage';
import CustomerAnalytics from './components/customer/CustomerAnalytics';
import BookingHistory from './components/customer/BookingHistory';
import SystemMonitoring from './components/customer/SystemMonitoring';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <ThemeProvider>
            <SystemMetricsProvider>
                <NotificationProvider>
                    <Router>
                        <div className="app-container">
                            <div className="main-layout">
                                <Sidebar user={user} logout={logout} />
                                <main className="content animate-fade-in">
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/browse" element={<BrowseSpaces />} />
                                        <Route path="/property/:id" element={<PropertyDetail user={user} />} />
                                        <Route
                                            path="/login"
                                            element={user ? <Navigate to="/" /> : <Login setUser={setUser} />}
                                        />
                                        <Route
                                            path="/admin"
                                            element={
                                                <ProtectedRoute user={user} allowedRoles={['admin']}>
                                                    <AdminPanel user={user} />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/seller"
                                            element={
                                                <ProtectedRoute user={user} allowedRoles={['seller', 'admin']}>
                                                    <SellerPanel user={user} />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/seller/listing/new"
                                            element={
                                                <ProtectedRoute user={user} allowedRoles={['seller', 'admin']}>
                                                    <NewListing user={user} />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/customer"
                                            element={
                                                <ProtectedRoute user={user} allowedRoles={['customer', 'admin']}>
                                                    <CustomerPanel user={user} />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/customer/saved"
                                            element={
                                                <ProtectedRoute user={user} allowedRoles={['customer', 'admin']}>
                                                    <SavedProperties user={user} />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/customer/search-results"
                                            element={
                                                <ProtectedRoute user={user} allowedRoles={['customer', 'admin']}>
                                                    <SearchResults user={user} />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/customer/booking/:id"
                                            element={
                                                <ProtectedRoute user={user} allowedRoles={['customer', 'admin']}>
                                                    <BookingPage user={user} />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/customer/analytics"
                                            element={
                                                <ProtectedRoute user={user} allowedRoles={['customer', 'admin']}>
                                                    <CustomerAnalytics user={user} />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/customer/bookings"
                                            element={
                                                <ProtectedRoute user={user} allowedRoles={['customer', 'admin']}>
                                                    <BookingHistory user={user} />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/system/metrics"
                                            element={
                                                <ProtectedRoute user={user} allowedRoles={['admin', 'customer']}>
                                                    <SystemMonitoring user={user} />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route path="*" element={<Navigate to="/" />} />
                                    </Routes>
                                </main>
                            </div>
                        </div>
                    </Router>
                </NotificationProvider>
            </SystemMetricsProvider>
        </ThemeProvider>
    );
}

export default App;
