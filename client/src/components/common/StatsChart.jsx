import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const StatsChart = ({ data, type = 'area', dataKey = 'value', nameKey = 'name', title }) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';

    const axisColor = isLight ? '#94a3b8' : 'rgba(255,255,255,0.3)';
    const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    const tooltipBg = isLight ? '#ffffff' : '#1a1a1c';
    const tooltipBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
    const cursorFill = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)';

    return (
        <div className="chart-container glass" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
            {title && <h3 className="chart-title">{title}</h3>}
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                    {type === 'area' ? (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isLight ? '#8b5cf6' : 'var(--primary)'} stopOpacity={isLight ? 0.3 : 0.6} />
                                    <stop offset="95%" stopColor={isLight ? '#8b5cf6' : 'var(--primary)'} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey={nameKey} stroke={axisColor} fontSize={11} tickLine={false} />
                            <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    background: tooltipBg,
                                    border: `1px solid ${tooltipBorder}`,
                                    borderRadius: 10,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                                    fontSize: 12
                                }}
                                itemStyle={{ color: 'var(--primary)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey={dataKey}
                                stroke={isLight ? '#8b5cf6' : 'var(--primary)'}
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey={nameKey} stroke={axisColor} fontSize={11} tickLine={false} />
                            <YAxis stroke={axisColor} fontSize={11} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: cursorFill }}
                                contentStyle={{
                                    background: tooltipBg,
                                    border: `1px solid ${tooltipBorder}`,
                                    borderRadius: 10,
                                    fontSize: 12
                                }}
                                itemStyle={{ color: 'var(--primary)' }}
                            />
                            <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--purple)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatsChart;
