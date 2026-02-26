# Technical Architecture: Smart Micro-Rental Optimization System

This document provides a comprehensive breakdown of the system's working process, designed for technical reviews and architectural walkthroughs.

---

## 1. Landing Page Mechanics
The entry point of the system handles session awareness and multi-role gateway logic.

- **"Get Started" Button**: 
   - **Logic**: Checks for an active JWT in `localStorage`.
   - **Flow**: If logged in → Redirect to role-specific dashboard (`/customer`, `/seller`, or `/admin`). If NOT logged in → Open `/login`.
- **"Explore Rentals" Button**: 
   - **Route**: Opens `/browse` (Public Discovery Mode).
   - **Access**: Publicly accessible; allows users to view assets and run pathfinding simulations without an account.
- **Login/Register Flow**:
   - **Role Selection**: Handled via a `<select>` dropdown in the `Login.jsx` component.
   - **Backend**: `POST /api/users/login` returns a payload including user info and a **Role Token**.
   - **Redirection**: React Router's `useNavigate` identifies the role from the response and pushes to the corresponding dedicated panel.

---

## 2. Customer Panel: The Discovery Hub
The most DSA-heavy segment of the application.

### Search & Discovery Process
1. **Input**: User enters a space name or Node ID (e.g., `node-B`).
2. **Geolocation**: Uses the browser's Geolocation API to get the user's current coordinates (mocked as `node-A` for simulation).
3. **Backend Trigger**: `POST /api/properties/path`
   - **Graph Construction**: The backend fetches all property coordinates from MongoDB and builds a `Graph` adjacency list in memory.
   - **DSA Execution**: Executes **A* Pathfinding** using the **Manhattan Heuristic** to minimize nodes visited.
4. **Response**: Returns an object containing the optimal node sequence, total distance (weight), and compute time.
5. **UI Update**: Highlights the property card and opens the **Map Visualization** modal.

### Map Route Logic
- **Placement**: Mounted within an `AnimatePresence` modal in `BrowseSpaces.jsx`.
- **Rendering**: An **SVG-based dynamic grid** that uses node coordinates to draw a coordinate-mapped polyline.
- **Visuals**: Primary markers for properties, secondary markers for the user, and an animated `<path>` showing the shortest route.

### Booking Flow (The 4-Step Process)
- **Step 1 (Select)**: Confirm asset details.
- **Step 2 (Time)**: Capture `startTime` and `endTime` using standard HTML5 datetime-local.
- **Step 3 (Interval Check)**: 
   - **DSA Logic**: `BookingScheduler.hasConflict()` runs an **Interval Overlap algorithm**. It sorts existing bookings for that property and checks if `[newStart, newEnd]` intersects with any `[existingStart, existingEnd]`.
- **Step 4 (Pricing & Confirm)**: 
   - **Dynamic Pricing**: Triggers the **DynamicPricing Engine** (Priority Queue based) which increases the property price if demand (score) exceeds a threshold.
   - **Finalization**: Deducts from the `wallet` and creates a `Booking` document in MongoDB.

---

## 3. Seller Panel: Asset Management
Focuses on inventory tracking and demand-based optimizations.

- **New Listing Button**: 
   - **Action**: Redirects to `/seller/listing/new`.
   - **Backend Logic**: Stores property info + (X, Y) coordinates. 
   - **Graph Integration**: On the next search, the building logic automatically includes this new node in the global graph.
- **Dynamic Pricing Badge**: 
   - **Logic**: Automatically recalculates whenever a "Book" action occurs.
   - **Algorithm**: Uses a **Min-Heap/Priority Queue** to prioritize assets with the highest occupancy for price increases.
- **Fraud Alert Icon**:
   - **Trigger**: Backend middleware flags circular transactions or suspicious high-frequency wallet transfers.
   - **Visualization**: Opens a modal showing a filtered view of the user's transaction network.

---

## 4. Admin Panel: System Governance
Provides high-level monitoring via graph-based analytics.

- **Detect Fraud Button**:
   - **Algorithm**: Executes **DFS Cycle Detection** on the Platform Transaction Graph.
   - **Logic**: Identifies cycles (e.g., A → B → C → A) which indicate potential money laundering or fake booking loops.
- **Transaction Graph Visualization**:
   - **Placement**: Full-screen modal or dedicated section.
   - **Architecture**: Nodes represent Users; directed edges represent Transactions. Visualized using `framer-motion` for node placement.
- **Block User Action**:
   - **Update**: Sets `isBlocked: true` in MongoDB.
   - **Middleware**: Every request goes through `protect` middleware which checks the user's blocked status before allowing API execution.

---

## 5. DSA Execution Layers Summary

| Role | Algorithm | Purpose |
| :--- | :--- | :--- |
| **Customer** | **A* / Dijkstra** | Multi-node shortest path discovery. |
| **Customer** | **Interval Scheduling** | Non-conflicting booking allocation. |
| **Seller** | **Priority Queues** | Demand-sensitive dynamic pricing. |
| **Admin** | **DFS (Depth-First Search)** | Detecting circular fraud patterns in transaction graphs. |
| **System** | **Manhattan Heuristic** | Optimize cost function for coordinate-based routing. |

---

## 6. Performance Considerations
- **Graph Caching**: The graph topology is cached in the backend service layer and only re-built if a `Property.count()` change is detected.
- **Database Indexing**: Compound indexing on `[propertyId, start, end]` in the MongoDB `bookings` collection ensures interval checks run in $O(log N)$ time.
- **UI Responsiveness**: All heavy computation (Pathfinding/Fraud check) is offloaded to the Node.js event pool, keeping the frontend 60FPS during interaction.
