const MinHeap = require('./MinHeap');

class Pathfinding {
    static manhattanHeuristic(nodeA, nodeB, graph) {
        const a = graph.getNodeData(nodeA);
        const b = graph.getNodeData(nodeB);
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    static dijkstra(startNode, endNode, graph) {
        const startTime = Date.now();
        const distances = {};
        const previous = {};
        const pq = new MinHeap();
        let nodesVisited = 0;

        Object.keys(graph.adjacencyList).forEach(node => {
            distances[node] = Infinity;
            previous[node] = null;
        });

        distances[startNode] = 0;
        pq.add({ node: startNode, priority: 0 });

        while (!pq.isEmpty()) {
            const { node: currentNode } = pq.poll();
            nodesVisited++;

            if (currentNode === endNode) break;

            graph.getNeighbors(currentNode).forEach(neighbor => {
                const alt = distances[currentNode] + neighbor.weight;
                if (alt < distances[neighbor.node]) {
                    distances[neighbor.node] = alt;
                    previous[neighbor.node] = currentNode;
                    pq.add({ node: neighbor.node, priority: alt });
                }
            });
        }

        const path = [];
        let curr = endNode;
        while (curr) {
            path.push(curr);
            curr = previous[curr];
        }
        path.reverse();

        return {
            path,
            distance: distances[endNode],
            nodesVisited,
            executionTime: Date.now() - startTime
        };
    }

    static aStar(startNode, endNode, graph) {
        const startTime = Date.now();
        const gScore = {};
        const fScore = {};
        const previous = {};
        const pq = new MinHeap();
        let nodesVisited = 0;

        Object.keys(graph.adjacencyList).forEach(node => {
            gScore[node] = Infinity;
            fScore[node] = Infinity;
            previous[node] = null;
        });

        gScore[startNode] = 0;
        fScore[startNode] = this.manhattanHeuristic(startNode, endNode, graph);
        pq.add({ node: startNode, priority: fScore[startNode] });

        while (!pq.isEmpty()) {
            const { node: currentNode } = pq.poll();
            nodesVisited++;

            if (currentNode === endNode) break;

            graph.getNeighbors(currentNode).forEach(neighbor => {
                const tentativeGScore = gScore[currentNode] + neighbor.weight;
                if (tentativeGScore < gScore[neighbor.node]) {
                    previous[neighbor.node] = currentNode;
                    gScore[neighbor.node] = tentativeGScore;
                    fScore[neighbor.node] = gScore[neighbor.node] + this.manhattanHeuristic(neighbor.node, endNode, graph);
                    pq.add({ node: neighbor.node, priority: fScore[neighbor.node] });
                }
            });
        }

        const path = [];
        let curr = endNode;
        while (curr) {
            path.push(curr);
            curr = previous[curr];
        }
        path.reverse();

        return {
            path,
            distance: gScore[endNode],
            nodesVisited,
            executionTime: Date.now() - startTime
        };
    }

    static bfsReachability(startNode, graph) {
        const visited = new Set();
        const queue = [startNode];
        visited.add(startNode);

        while (queue.length > 0) {
            const currentNode = queue.shift();
            graph.getNeighbors(currentNode).forEach(neighbor => {
                if (!visited.has(neighbor.node)) {
                    visited.add(neighbor.node);
                    queue.push(neighbor.node);
                }
            });
        }

        return Array.from(visited);
    }
}

module.exports = Pathfinding;
