import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bell, Zap, ShieldAlert, CheckCircle } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notif) => {
        setNotifications(prev => [{ id: Date.now(), ...notif }, ...prev].slice(0, 5));
    };

    // Elite: Real-Time Surge Alert Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.8) {
                addNotification({
                    title: 'Surge Price Alert',
                    desc: 'High demand detected in Node-A region. Price adjusted (O(1) logic).',
                    icon: Zap,
                    color: 'warning'
                });
            }
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
