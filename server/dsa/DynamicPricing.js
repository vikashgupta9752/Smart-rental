const MinHeap = require('./MinHeap');

class DynamicPricing {
    /**
     * Calculates dynamic price based on demand score and occupancy
     * @param {number} basePrice 
     * @param {number} demandScore (0-100)
     * @param {number} occupancyRate (0-1)
     */
    static calculatePrice(basePrice, demandScore, occupancyRate) {
        // Use a MaxHeap to find the "multiplier" priority
        // Since we have a MinHeap, we'll use negative values for MaxHeap behavior
        const pq = new MinHeap();

        // Push various factors into the heap
        pq.add({ factor: 'demand', priority: -demandScore });
        pq.add({ factor: 'occupancy', priority: -(occupancyRate * 50) });

        // Get the strongest factor
        const top = pq.poll();
        const multiplier = 1 + (Math.abs(top.priority) / 100);

        return Math.round(basePrice * multiplier * 100) / 100;
    }

    /**
     * Updates prices for a list of properties based on overall market demand
     */
    static updateMarketPrices(properties) {
        const pq = new MinHeap();
        properties.forEach(p => {
            pq.add({ id: p._id, priority: -p.score }); // Max demand first
        });

        const updates = [];
        let rank = 1;
        while (!pq.isEmpty()) {
            const item = pq.poll();
            // Higher rank (lower priority value) gets higher multiplier
            const multiplier = 1 + (0.2 / rank);
            updates.push({ id: item.id, multiplier });
            rank++;
        }
        return updates;
    }
}

module.exports = DynamicPricing;
