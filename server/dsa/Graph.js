class Graph {
    constructor() {
        this.adjacencyList = {};
        this.nodes = {}; // To store coordinate data for A* (Manhattan)
    }

    addNode(id, x, y) {
        this.adjacencyList[id] = [];
        this.nodes[id] = { x, y };
    }

    addEdge(node1, node2, weight) {
        if (this.adjacencyList[node1] && this.adjacencyList[node2]) {
            this.adjacencyList[node1].push({ node: node2, weight });
            this.adjacencyList[node2].push({ node: node1, weight });
        }
    }

    getNeighbors(node) {
        return this.adjacencyList[node] || [];
    }

    getNodeData(node) {
        return this.nodes[node];
    }
}

module.exports = Graph;
