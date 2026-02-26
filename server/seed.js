const mongoose = require('mongoose');
require('dotenv').config();
const Property = require('./models/Property');
const User = require('./models/User');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/property_rental');
        console.log('Connected to MongoDB');

        const seller = await User.findOne({ role: 'seller' });
        if (!seller) {
            console.log('No seller found. Please register a seller account first.');
            process.exit(0);
        }

        const properties = [
            {
                title: 'Sunlit Modern Apartment',
                description: 'A beautifully designed modern apartment with floor-to-ceiling windows, high-speed internet, and panoramic city views. The space features a fully equipped kitchen, cozy living area, and a work desk perfect for remote workers.',
                price: 2800,
                type: 'apartment',
                location: { id: 'node-A1', x: 10, y: 12, lat: 19.0522, lng: 72.8317, city: 'Mumbai', address: 'Bandra West, Hill Road' },
                amenities: ['wifi', 'ac', 'kitchen', 'tv', 'washer', 'parking', 'balcony'],
                maxGuests: 4, bedrooms: 2, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
                    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800'
                ],
                rating: 4.9, reviewCount: 47, owner: seller._id
            },
            {
                title: 'Cozy Studio Near Metro',
                description: 'Compact and efficient studio apartment just 2 minutes walk from the metro station. Ideal for solo travelers or couples looking for a convenient city base.',
                price: 1200,
                type: 'studio',
                location: { id: 'node-A2', x: 15, y: 18, lat: 19.1136, lng: 72.8697, city: 'Mumbai', address: 'Andheri East, Marol' },
                amenities: ['wifi', 'ac', 'kitchen', 'tv', 'gym'],
                maxGuests: 2, bedrooms: 1, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
                    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800',
                    'https://images.unsplash.com/photo-1527030280862-64c01bb88396?w=800',
                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
                    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'
                ],
                rating: 4.6, reviewCount: 23, owner: seller._id
            },
            {
                title: 'Luxury Villa with Pool',
                description: 'Stunning private villa with an infinity pool, lush garden, outdoor BBQ area, and spacious interiors. Perfect for families or groups celebrating special occasions.',
                price: 12000,
                type: 'villa',
                location: { id: 'node-B1', x: 40, y: 25, lat: 15.5414, lng: 73.7651, city: 'Goa', address: 'Calangute, North Goa' },
                amenities: ['wifi', 'ac', 'kitchen', 'pool', 'parking', 'garden', 'bbq', 'tv', 'washer'],
                maxGuests: 8, bedrooms: 4, bathrooms: 3,
                images: [
                    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
                ],
                rating: 4.95, reviewCount: 112, owner: seller._id
            },
            {
                title: 'Heritage Loft in Old Quarter',
                description: 'A character-filled loft in a restored heritage building. Exposed brick walls, wooden beams, and artisan furniture create an unforgettable stay in the heart of the old city.',
                price: 3500,
                type: 'loft',
                location: { id: 'node-C1', x: 55, y: 30, lat: 28.6601, lng: 77.2307, city: 'Delhi', address: 'Chandni Chowk, Old Delhi' },
                amenities: ['wifi', 'ac', 'kitchen', 'tv', 'workspace'],
                maxGuests: 3, bedrooms: 1, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
                    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
                    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
                    'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800',
                    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800'
                ],
                rating: 4.8, reviewCount: 34, owner: seller._id
            },
            {
                title: 'Beachfront House',
                description: 'Wake up to the sound of waves in this stunning beachfront property. Features a private deck, outdoor shower, hammocks, and direct beach access.',
                price: 7500,
                type: 'house',
                location: { id: 'node-B2', x: 42, y: 28, lat: 15.0118, lng: 74.0267, city: 'Goa', address: 'Palolem Beach, South Goa' },
                amenities: ['wifi', 'ac', 'kitchen', 'parking', 'beach_access', 'garden', 'tv', 'washer'],
                maxGuests: 6, bedrooms: 3, bathrooms: 2,
                images: [
                    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
                    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800',
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
                    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'
                ],
                rating: 4.85, reviewCount: 89, owner: seller._id
            },
            {
                title: 'Mountain View Cabin',
                description: 'A cozy wooden cabin nestled in the mountains with breathtaking valley views. Features a fireplace, private balcony, and hiking trails starting from the doorstep.',
                price: 4200,
                type: 'house',
                location: { id: 'node-D1', x: 70, y: 15, lat: 32.2598, lng: 77.1824, city: 'Manali', address: 'Old Manali, Kullu Valley' },
                amenities: ['wifi', 'fireplace', 'parking', 'mountain_view', 'balcony', 'kitchen'],
                maxGuests: 4, bedrooms: 2, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
                    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
                    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
                    'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800',
                    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800'
                ],
                rating: 4.7, reviewCount: 56, owner: seller._id
            },
            {
                title: 'Urban Design Studio',
                description: 'A stylish, open-plan studio in the creative district. Floor-to-ceiling art, designer furniture, and a dedicated workspace make this perfect for creatives.',
                price: 1800,
                type: 'studio',
                location: { id: 'node-E1', x: 25, y: 40, lat: 12.9784, lng: 77.6408, city: 'Bangalore', address: 'Indiranagar, 12th Main' },
                amenities: ['wifi', 'ac', 'workspace', 'kitchen', 'tv', 'gym'],
                maxGuests: 2, bedrooms: 1, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=800',
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
                    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
                    'https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=800',
                    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800'
                ],
                rating: 4.5, reviewCount: 18, owner: seller._id
            },
            {
                title: 'Penthouse Suite with Terrace',
                description: 'Top-floor penthouse with a private rooftop terrace, Jacuzzi, and 360° city views. Premium finishes throughout with smart home automation.',
                price: 9500,
                type: 'apartment',
                location: { id: 'node-A3', x: 12, y: 14, lat: 19.0157, lng: 72.8130, city: 'Mumbai', address: 'Worli Sea Face' },
                amenities: ['wifi', 'ac', 'kitchen', 'pool', 'gym', 'parking', 'terrace', 'jacuzzi', 'tv', 'washer', 'concierge'],
                maxGuests: 6, bedrooms: 3, bathrooms: 2,
                images: [
                    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
                    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
                    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
                    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
                ],
                rating: 4.92, reviewCount: 73, owner: seller._id
            },
            {
                title: 'Lakeside Cottage',
                description: 'A peaceful cottage on the lakefront with a private dock, kayak access, and stunning sunsets. The perfect escape from city life.',
                price: 3200,
                type: 'house',
                location: { id: 'node-F1', x: 65, y: 50, lat: 24.6000, lng: 73.6826, city: 'Udaipur', address: 'Fateh Sagar Lake Area' },
                amenities: ['wifi', 'kitchen', 'parking', 'lake_view', 'garden', 'balcony', 'fireplace'],
                maxGuests: 4, bedrooms: 2, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1475087542963-13ab5e611954?w=800',
                    'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
                    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
                ],
                rating: 4.75, reviewCount: 41, owner: seller._id
            },
            {
                title: 'Minimalist City Flat',
                description: 'Clean, minimalist apartment in the heart of the IT corridor. High-speed fiber internet, standing desk, and coffee machine included.',
                price: 1500,
                type: 'apartment',
                location: { id: 'node-E2', x: 28, y: 42, lat: 12.9844, lng: 77.7524, city: 'Bangalore', address: 'Whitefield, ITPL Road' },
                amenities: ['wifi', 'ac', 'workspace', 'kitchen', 'gym', 'parking'],
                maxGuests: 2, bedrooms: 1, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
                    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
                ],
                rating: 4.4, reviewCount: 15, owner: seller._id
            },
            {
                title: 'Royal Heritage Haveli',
                description: 'Stay in a restored 200-year-old haveli with intricate Rajasthani architecture, courtyard dining, and traditional hospitality.',
                price: 5500,
                type: 'villa',
                location: { id: 'node-G1', x: 50, y: 35, lat: 26.9240, lng: 75.8079, city: 'Jaipur', address: 'Nahargarh Road, Old City' },
                amenities: ['wifi', 'ac', 'kitchen', 'garden', 'parking', 'pool', 'spa'],
                maxGuests: 8, bedrooms: 4, bathrooms: 3,
                images: [
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
                    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
                ],
                rating: 4.88, reviewCount: 67, owner: seller._id
            },
            {
                title: 'Treehouse Retreat',
                description: 'An adventurous treehouse perched among ancient trees. Glass walls, a rope bridge entrance, and stargazing from the rooftop deck.',
                price: 6000,
                type: 'house',
                location: { id: 'node-H1', x: 75, y: 20, lat: 11.5367, lng: 76.0468, city: 'Wayanad', address: 'Vythiri, Kerala' },
                amenities: ['wifi', 'nature_view', 'balcony', 'breakfast', 'guided_tours'],
                maxGuests: 2, bedrooms: 1, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
                    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
                    'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800',
                    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800'
                ],
                rating: 4.93, reviewCount: 94, owner: seller._id
            },
            {
                title: 'Downtown Business Suite',
                description: 'Executive suite designed for business travelers. Conference room access, business center, and premium concierge services.',
                price: 4000,
                type: 'apartment',
                location: { id: 'node-C2', x: 58, y: 32, lat: 28.6315, lng: 77.2167, city: 'Delhi', address: 'Connaught Place, Block A' },
                amenities: ['wifi', 'ac', 'workspace', 'gym', 'parking', 'concierge', 'tv', 'laundry'],
                maxGuests: 2, bedrooms: 1, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800',
                    'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=800',
                    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
                    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
                    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'
                ],
                rating: 4.6, reviewCount: 29, owner: seller._id
            },
            {
                title: 'Bohemian Beach Shack',
                description: 'A laid-back bamboo and wood shack steps from the beach. Hammock, outdoor kitchen, and fire pit under the stars.',
                price: 1800,
                type: 'room',
                location: { id: 'node-B3', x: 44, y: 30, lat: 15.6865, lng: 73.7056, city: 'Goa', address: 'Arambol Beach, North Goa' },
                amenities: ['wifi', 'beach_access', 'garden', 'bbq', 'parking'],
                maxGuests: 3, bedrooms: 1, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
                    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800',
                    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
                    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
                ],
                rating: 4.3, reviewCount: 12, owner: seller._id
            },
            {
                title: 'Sky Garden Apartment',
                description: 'Modern apartment with a private rooftop garden, herb beds, and a meditation corner. Smart home features and sustainable design throughout.',
                price: 3800,
                type: 'apartment',
                location: { id: 'node-E3', x: 30, y: 38, lat: 12.9352, lng: 77.6245, city: 'Bangalore', address: 'Koramangala, 5th Block' },
                amenities: ['wifi', 'ac', 'kitchen', 'garden', 'terrace', 'workspace', 'gym', 'parking'],
                maxGuests: 4, bedrooms: 2, bathrooms: 2,
                images: [
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
                    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
                    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
                    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
                ],
                rating: 4.72, reviewCount: 38, owner: seller._id
            },
            {
                title: 'Artist Loft Gallery',
                description: 'A unique loft space doubling as an art gallery. Rotating exhibitions, creative workshops, and an inspiring atmosphere for artistic souls.',
                price: 2500,
                type: 'loft',
                location: { id: 'node-A4', x: 14, y: 16, lat: 18.9272, lng: 72.8335, city: 'Mumbai', address: 'Kala Ghoda, Fort' },
                amenities: ['wifi', 'ac', 'workspace', 'kitchen', 'gallery'],
                maxGuests: 2, bedrooms: 1, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
                    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
                    'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800',
                    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800',
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
                ],
                rating: 4.55, reviewCount: 21, owner: seller._id
            },
            {
                title: 'Eco Farm Stay',
                description: 'Sustainable farm stay with organic meals, farm tours, pottery classes, and peaceful green surroundings. Digital detox paradise.',
                price: 2200,
                type: 'house',
                location: { id: 'node-I1', x: 85, y: 55, lat: 12.4244, lng: 75.7382, city: 'Coorg', address: 'Madikeri, Karnataka' },
                amenities: ['wifi', 'kitchen', 'garden', 'breakfast', 'parking', 'nature_view', 'farm_activities'],
                maxGuests: 5, bedrooms: 2, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800',
                    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
                    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
                    'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
                    'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800'
                ],
                rating: 4.82, reviewCount: 53, owner: seller._id
            },
            {
                title: 'Houseboat Experience',
                description: 'Traditional Kerala houseboat with a modern twist. Cruise through the backwaters with a private chef, sundeck, and air-conditioned cabin.',
                price: 8500,
                type: 'room',
                location: { id: 'node-J1', x: 90, y: 60, lat: 9.4981, lng: 76.3329, city: 'Alleppey', address: 'Vembanad Lake, Kerala' },
                amenities: ['ac', 'kitchen', 'lake_view', 'breakfast', 'guided_tours'],
                maxGuests: 4, bedrooms: 2, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                    'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800',
                    'https://images.unsplash.com/photo-1475087542963-13ab5e611954?w=800',
                    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800',
                    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'
                ],
                rating: 4.91, reviewCount: 81, owner: seller._id
            },
            {
                title: 'Tech Hub Co-Living Space',
                description: 'Modern co-living space designed for digital nomads. High-speed fiber, standing desks, community kitchen, and weekly networking events.',
                price: 900,
                type: 'room',
                location: { id: 'node-K1', x: 20, y: 35, lat: 17.4483, lng: 78.3915, city: 'Hyderabad', address: 'HITEC City, Madhapur' },
                amenities: ['wifi', 'ac', 'workspace', 'kitchen', 'gym', 'laundry', 'community_events'],
                maxGuests: 1, bedrooms: 1, bathrooms: 1,
                images: [
                    'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?w=800',
                    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
                ],
                rating: 4.35, reviewCount: 9, owner: seller._id
            },
            {
                title: 'Cliffside Glass House',
                description: 'An architectural marvel perched on a cliff with 180° ocean views through floor-to-ceiling glass walls. Infinity pool merges with the horizon.',
                price: 15000,
                type: 'villa',
                location: { id: 'node-L1', x: 95, y: 10, lat: 14.5445, lng: 74.3162, city: 'Gokarna', address: 'Om Beach Cliff, Karnataka' },
                amenities: ['wifi', 'ac', 'kitchen', 'pool', 'ocean_view', 'parking', 'garden', 'bbq', 'tv', 'washer', 'spa'],
                maxGuests: 6, bedrooms: 3, bathrooms: 3,
                images: [
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
                    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
                    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
                    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800'
                ],
                rating: 4.97, reviewCount: 128, owner: seller._id
            }
        ];

        await Property.deleteMany({ owner: seller._id });
        await Property.insertMany(properties);

        console.log(`Successfully seeded ${properties.length} properties!`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
