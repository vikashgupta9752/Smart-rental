class FraudDetection {
    /**
     * Detects cycles in a transaction/interaction graph which might indicate
     * suspicious activity (e.g. circle booking to inflate ratings)
     */
    static findSuspiciousCycles(graph) {
        const visited = new Set();
        const recStack = new Set();
        const cycles = [];

        function dfs(node, path) {
            visited.add(node);
            recStack.add(node);
            path.push(node);

            const neighbors = graph.getNeighbors(node);
            for (let neighbor of neighbors) {
                if (recStack.has(neighbor.node)) {
                    // Cycle detected
                    const cycleStartIdx = path.indexOf(neighbor.node);
                    cycles.push(path.slice(cycleStartIdx));
                } else if (!visited.has(neighbor.node)) {
                    dfs(neighbor.node, [...path]);
                }
            }

            recStack.delete(node);
        }

        const nodes = Object.keys(graph.adjacencyList);
        nodes.forEach(node => {
            if (!visited.has(node)) {
                dfs(node, []);
            }
        });

        return cycles;
    }

    /**
     * Identifies dense clusters and high-connectivity hubs
     */
    static detectAnomalies(graph) {
        const anomalies = [];
        const nodes = Object.keys(graph.adjacencyList);

        nodes.forEach(node => {
            const neighbors = graph.getNeighbors(node);
            // Flag nodes with high degree (connectivity)
            if (neighbors.length > 5) {
                anomalies.push({
                    node,
                    type: 'HUB',
                    severity: neighbors.length > 10 ? 'HIGH' : 'MEDIUM',
                    reason: `High connectivity: ${neighbors.length} connections`
                });
            }
        });

        return {
            anomalies,
            cycles: this.findSuspiciousCycles(graph)
        };
    }
}

module.exports = FraudDetection;
