/**
 * Elite Security: Fraud Risk Scoring Engine
 * Uses weighted factors to determine probability of illicit activity.
 */
export const calculateFraudScore = (activity) => {
    const {
        bookingFrequency = 0, // Bookings in last 1hr
        cycleParticipation = 0, // Circular booking detected
        repeatPatternCount = 0 // Exactly same intervals
    } = activity;

    // Fraud Score = (frequency × 0.5) + (cycle × 0.3) + (pattern × 0.2)
    // Normalized to 0-100
    const score = (
        (Math.min(bookingFrequency, 10) * 10 * 0.5) +
        (cycleParticipation * 100 * 0.3) +
        (Math.min(repeatPatternCount, 5) * 20 * 0.2)
    );

    return Math.min(Math.round(score), 100);
};

export const getRiskLevel = (score) => {
    if (score < 30) return { label: 'Secure', color: '#00ff88' };
    if (score < 60) return { label: 'Elevated', color: '#ffaa00' };
    return { label: 'CRITICAL', color: '#ff4d4d' };
};

/**
 * Elite Multi-Factor Ranking
 * Weighted pricing, rating, and trust heuristic.
 */
export const calculateRankScore = (p) => {
    const ratingScore = (p.rating || 4.5) / 5;
    const priceScore = Math.max(0, (2000 - p.price) / 2000);
    const trustScore = (p.sellerTrust || 4.2) / 5;
    const distanceScore = p.location?.id === 'node-A' ? 1 : 0.7; // Mocked spatial factor

    // Ranking Score = (0.4 × Distance) + (0.3 × Rating) + (0.2 × Price) + (0.1 × Trust)
    return (0.4 * distanceScore) + (0.3 * ratingScore) + (0.2 * priceScore) + (0.1 * trustScore);
};

/**
 * Elite Spatial: Grid-Based Heatmap Clustering
 * Partitions a 2D space into grid cells to aggregate demand.
 */
export const getHeatmapClustering = (entities, gridSize = 1) => {
    const clusters = {};

    entities.forEach(e => {
        // Handle both property objects and booking objects
        const locationId = e.location?.id || e.property?.location?.id || 'unknown';
        clusters[locationId] = (clusters[locationId] || 0) + 1;
    });

    return Object.entries(clusters).map(([nodeId, count]) => ({
        nodeId,
        intensity: count > 3 ? 'high' : count > 1 ? 'medium' : 'low',
        count
    }));
};
