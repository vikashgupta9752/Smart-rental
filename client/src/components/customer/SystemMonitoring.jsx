import React from 'react';
import { useMetrics } from '../../context/SystemMetrics';
import { Activity, Zap, Shield, Cpu, Clock, MousePointer2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SystemMonitoring = () => {
    const { metrics } = useMetrics();

    const chartData = metrics.searchExecutionTimes.map((val, i) => ({ name: i, time: val }));

    return (
        <div className="panel dashboard-container">
            <div className="section-header">
                <h1 className="section-title flex items-center gap-2"><Cpu className="text-secondary" /> System Observability</h1>
            </div>

            <div className="dashboard-grid mt-6">
                <div className="glass p-6 border-primary">
                    <div className="flex justify-between items-start mb-4">
                        <Zap className="text-primary" />
                        <span className="badge">Real-Time</span>
                    </div>
                    <h3>Algorithm Throughput</h3>
                    <div className="chart-wrapper mt-4">
                        <ResponsiveContainer width="100%" height={150}>
                            <AreaChart data={chartData}>
                                <Area type="monotone" dataKey="time" stroke="var(--primary)" fill="var(--primary-dim)" />
                                <XAxis hide />
                                <YAxis hide />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass p-6 border-secondary">
                    <Clock className="text-secondary mb-4" />
                    <h3>Avg. Latency</h3>
                    <p className="card-val mt-2">{(metrics.searchExecutionTimes.reduce((a, b) => a + b, 0) / (metrics.searchExecutionTimes.length || 1)).toFixed(2)}ms</p>
                    <p className="card-lbl">Execution profiling active</p>
                </div>

                <div className="glass p-6 border-success">
                    <Shield className="text-success mb-4" />
                    <h3>Security Resilience</h3>
                    <p className="card-val mt-2">{metrics.conflictsPrevented}</p>
                    <p className="card-lbl">Conflicts blocked by DSA</p>
                </div>
            </div>

            <div className="glass p-8 border-glass mt-10">
                <h3 className="mb-6 flex items-center gap-2"><Activity size={20} /> Production Performance Logs</h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-center py-4 border-b border-glass">
                        <span>Min-Heap Top-K Sorting</span>
                        <div className="flex gap-10">
                            <span className="text-secondary">O(N log K)</span>
                            <span className="text-primary">Optimized</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-glass">
                        <span>Grid-Based Indices (Heatmap)</span>
                        <div className="flex gap-10">
                            <span className="text-secondary">O(1) Lookup</span>
                            <span className="text-primary">Clustered</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center py-4">
                        <span>Cache Layer Efficiency</span>
                        <div className="flex gap-10">
                            <span className="text-secondary">Hit Rate: {((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses || 1)) * 100).toFixed(1)}%</span>
                            <span className="text-primary">Redis-Sim</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemMonitoring;
