const Graph = require('../dsa/Graph');
const Pathfinding = require('../dsa/Pathfinding');
const BookingScheduler = require('../dsa/BookingScheduler');

// Mock Data for Testing
const g = new Graph();
g.addNode("A", 0, 0);
g.addNode("B", 1, 0);
g.addNode("C", 1, 1);
g.addNode("D", 0, 1);

g.addEdge("A", "B", 1);
g.addEdge("B", "C", 1);
g.addEdge("C", "D", 1);
g.addEdge("D", "A", 1);
g.addEdge("A", "C", 1.5);

console.log("--- Pathfinding Test ---");
const dijkstraRes = Pathfinding.dijkstra("A", "C", g);
console.log("Dijkstra (A to C):", dijkstraRes);

const aStarRes = Pathfinding.aStar("A", "C", g);
console.log("A* (A to C):", aStarRes);

console.log("--- Booking Scheduler Test ---");
const bookings = [
    { start: 10, end: 12 },
    { start: 14, end: 16 }
];
console.log("Conflict (11-13, overlaps 10-12):", BookingScheduler.hasConflict({ start: 11, end: 13 }, bookings));
console.log("Conflict (12-14, no overlap):", BookingScheduler.hasConflict({ start: 12, end: 14 }, bookings));

console.log("--- DSA Benchmark Passed ---");
