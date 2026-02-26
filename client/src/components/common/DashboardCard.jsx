import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardCard = ({ icon: Icon, title, value, subValue, trend, trendType, color = 'primary', subtitle }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -1, transition: { duration: 0.15 } }}
            className="glass-card group relative overflow-hidden"
            style={{ borderLeft: `2px solid var(--${color})`, padding: '12px 14px' }}
        >
            <div className="flex items-start justify-between mb-2.5">
                <div
                    className="p-1.5 rounded-lg group-hover:scale-105 transition-transform duration-200"
                    style={{ background: `var(--${color}-light)`, color: `var(--${color})` }}
                >
                    <Icon size={14} />
                </div>
                {trend !== undefined && (
                    <div
                        className="flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                            background: trendType === 'up' ? 'var(--accent-light)' : 'var(--danger-light)',
                            color: trendType === 'up' ? 'var(--accent)' : 'var(--danger)'
                        }}
                    >
                        {trendType === 'up' ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                        {trend}%
                    </div>
                )}
            </div>

            <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] mb-0.5" style={{ color: 'var(--text-dim)' }}>{title}</p>
                <div className="flex items-baseline gap-1.5">
                    <h2 className="text-lg font-extrabold tracking-tight leading-none" style={{ color: 'var(--text-main)' }}>{value}</h2>
                    {subValue && <span className="text-[8px] font-medium" style={{ color: 'var(--text-dim)' }}>{subValue}</span>}
                </div>
                {subtitle && <p className="text-[7px] mt-0.5" style={{ color: 'var(--text-dim)' }}>{subtitle}</p>}
            </div>
        </motion.div>
    );
};

export default DashboardCard;
