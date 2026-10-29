import type { Attraction, Destination, Interest, StyleCosts } from '../types';

const A = (
  id: string, name: string, desc: string, categories: Interest[], hours: number,
  cost: number, slot: Attraction['slot'] = 'any', intense = false,
): Attraction => ({ id, name, desc, categories, hours, costPerPerson: cost, slot, intense });
const S = (budget: number, balanced: number, comfort: number): StyleCosts => ({ budget, balanced, comfort });
const G = (a: string, b: string) => `linear-gradient(135deg,${a},${b})`;

/** Illustrative sample estimates only, not verified current prices. Copy a block to add more. */
export const EXTRA_DESTINATIONS: Destination[] = [
  {
    id: 'amritsar', name: 'Amritsar', state: 'Punjab', emoji: '🛕', gradient: G('#f4b942', '#0b2545'),
    tagline: 'Golden Temple, Punjabi food and the Wagah Border ceremony.', bestFor: ['culture', 'history', 'food'],
    intercityPP: 2200, stay: S(900, 2300, 5500), food: S(400, 750, 1300), local: S(500, 1000, 1700),
    transportTip: 'e-rickshaw or app cab', dishes: ['Amritsari kulcha', 'Lassi', 'Chole bhature', 'Jalebi'],
    attractions: [
      A('amr-golden', 'Golden Temple', 'Sikh holy shrine with free community meal.', ['culture', 'history', 'sightseeing'], 2.5, 0, 'morning'),
      A('amr-jallian', 'Jallianwala Bagh', 'Memorial garden of the 1919 massacre.', ['history'], 1, 0, 'afternoon'),
      A('amr-wagah', 'Wagah Border Ceremony', 'Evening flag-lowering ceremony.', ['culture', 'sightseeing'], 3, 0, 'evening'),
      A('amr-partition', 'Partition Museum', 'Personal stories of the 1947 Partition.', ['history', 'culture'], 1.5, 50, 'afternoon'),
      A('amr-food', 'Kulcha & Langar Food Trail', 'Famous kulcha spots and sweets.', ['food', 'culture'], 2, 0, 'afternoon'),
      A('amr-hall', 'Hall Bazaar', 'Phulkari, juttis and street snacks.', ['shopping', 'food'], 2, 0, 'evening'),
    ],
  },
  {
    id: 'jaisalmer', name: 'Jaisalmer', state: 'Rajasthan', emoji: '🐪', gradient: G('#e0a030', '#7b3f00'),
    tagline: 'Golden fort city and Thar desert dunes.', bestFor: ['history', 'adventure', 'culture', 'nature'],
    intercityPP: 3500, stay: S(1000, 2800, 7000), food: S(450, 850, 1500), local: S(600, 1200, 2000),
    transportTip: 'auto-rickshaw or jeep', dishes: ['Ker sangri', 'Dal baati', 'Gatte ki sabzi', 'Ghotua ladoo'],
    attractions: [
      A('jsm-fort', 'Jaisalmer Fort', 'Living sandstone fort with shops and temples.', ['history', 'sightseeing', 'culture'], 2.5, 100, 'morning'),
      A('jsm-patwon', 'Patwon ki Haveli', 'Ornate merchant mansions.', ['history', 'culture'], 1.5, 150, 'afternoon'),
      A('jsm-gadisar', 'Gadisar Lake', 'Peaceful lake with small temples.', ['relaxation', 'sightseeing'], 1.5, 0, 'morning'),
      A('jsm-sam', 'Sam Sand Dunes Camel Safari', 'Sunset camel ride and desert evening.', ['adventure', 'nature'], 4, 1000, 'evening'),
      A('jsm-bada', 'Bada Bagh Cenotaphs', 'Royal memorials, great at sunset.', ['history', 'sightseeing'], 1.5, 50, 'evening'),
      A('jsm-market', 'Sadar Bazaar', 'Mirror-work textiles and handicrafts.', ['shopping', 'food'], 2, 0, 'afternoon'),
    ],
  },
  {
    id: 'gangtok', name: 'Gangtok', state: 'Sikkim', emoji: '🏔️', gradient: G('#2a9d8f', '#5b8def'),
    tagline: 'Monasteries, mountain lakes and Himalayan views.', bestFor: ['nature', 'culture', 'sightseeing'],
    intercityPP: 4500, stay: S(1100, 2600, 6000), food: S(450, 800, 1400), local: S(700, 1300, 2200),
    transportTip: 'shared or private taxi', dishes: ['Momos', 'Thukpa', 'Sel roti', 'Gundruk soup'],
    attractions: [
      A('gan-tsomgo', 'Tsomgo Lake & Baba Mandir', 'High-altitude lake day trip. Permit needed.', ['nature', 'sightseeing'], 6, 600, 'morning'),
      A('gan-rumtek', 'Rumtek Monastery', 'Important Buddhist monastery.', ['culture', 'history'], 2.5, 50, 'afternoon'),
      A('gan-ropeway', 'Gangtok Ropeway & Ganesh Tok', 'Cable car with city views.', ['sightseeing', 'nature'], 2, 150, 'afternoon'),
      A('gan-mg', 'MG Marg', 'Pedestrian street with cafes and shops.', ['shopping', 'food'], 2, 0, 'evening'),
      A('gan-hanuman', 'Hanuman Tok Viewpoint', 'Hilltop temple with valley views.', ['culture', 'nature'], 1.5, 0, 'morning'),
      A('gan-banjhakri', 'Banjhakri Falls Energy Park', 'Waterfall park with forest paths.', ['nature', 'adventure'], 2, 100, 'afternoon', true),
    ],
  },
  {
    id: 'srinagar', name: 'Srinagar', state: 'Jammu & Kashmir', emoji: '🚣', gradient: G('#5b8def', '#2a9d8f'),
    tagline: 'Shikaras on Dal Lake, Mughal gardens and snow meadows.', bestFor: ['nature', 'relaxation', 'sightseeing', 'adventure'],
    intercityPP: 5500, stay: S(1200, 3000, 8000), food: S(500, 900, 1600), local: S(800, 1500, 2500),
    transportTip: 'taxi or shikara', dishes: ['Rogan josh', 'Kahwa', 'Noon chai', 'Wazwan dishes'],
    attractions: [
      A('sri-dal', 'Dal Lake Shikara Ride', 'Boat ride past floating gardens.', ['relaxation', 'sightseeing'], 2, 600, 'evening'),
      A('sri-mughal', 'Nishat & Shalimar Mughal Gardens', 'Terraced gardens by the lake.', ['nature', 'history'], 3, 50, 'morning'),
      A('sri-shankar', 'Shankaracharya Temple', 'Hilltop temple with city views.', ['culture', 'history'], 2, 0, 'morning', true),
      A('sri-jama', 'Jama Masjid & Old City', 'Wooden mosque and old lanes.', ['culture', 'history'], 1.5, 0, 'afternoon'),
      A('sri-lal', 'Lal Chowk Market', 'Dry fruits, shawls and handicrafts.', ['shopping', 'food'], 2, 0, 'evening'),
      A('sri-gulmarg', 'Gulmarg Day Trip', 'Gondola and alpine meadows, seasonal.', ['adventure', 'nature'], 9, 1500, 'morning', true),
    ],
  },
  {
    id: 'alleppey', name: 'Alleppey', state: 'Kerala', emoji: '🛶', gradient: G('#2a9d8f', '#f4b942'),
    tagline: 'Backwater canals, houseboats and calm beaches.', bestFor: ['relaxation', 'nature', 'beaches', 'food'],
    intercityPP: 3800, stay: S(1200, 3200, 7500), food: S(450, 850, 1500), local: S(500, 1000, 1800),
    transportTip: 'auto-rickshaw or boat', dishes: ['Karimeen pollichathu', 'Appam & stew', 'Kerala sadya', 'Puttu & kadala curry'],
    attractions: [
      A('all-house', 'Backwater Houseboat Cruise', 'Day cruise through canals with lunch.', ['relaxation', 'nature'], 6, 2500, 'any'),
      A('all-beach', 'Alappuzha Beach & Lighthouse', 'Pier, beach and sunset.', ['beaches', 'sightseeing'], 2, 20, 'evening'),
      A('all-marari', 'Marari Beach', 'Quiet fishing-village beach.', ['beaches', 'relaxation'], 3, 0, 'afternoon'),
      A('all-canoe', 'Kuttanad Village Canoe Ride', 'Narrow canal ride past paddy fields.', ['nature', 'culture'], 2, 500, 'morning'),
      A('all-krish', 'Krishnapuram Palace', 'Kerala-style palace museum.', ['history', 'culture'], 1.5, 20, 'morning'),
      A('all-market', 'Local Canal Market', 'Spices, coir products and snacks.', ['shopping', 'food'], 1.5, 0, 'evening'),
    ],
  },
  {
    id: 'ooty', name: 'Ooty', state: 'Tamil Nadu', emoji: '🌿', gradient: G('#2a9d8f', '#1b4332'),
    tagline: 'Nilgiri hills, toy train and tea estates.', bestFor: ['nature', 'relaxation', 'sightseeing'],
    intercityPP: 3000, stay: S(1000, 2500, 6000), food: S(400, 750, 1300), local: S(600, 1200, 2000),
    transportTip: 'local taxi', dishes: ['Ooty varkey', 'Homemade chocolates', 'South Indian meals', 'Nilgiri tea'],
    attractions: [
      A('oot-train', 'Nilgiri Mountain Railway Ride', 'Heritage train through tea hills.', ['sightseeing', 'nature'], 2.5, 400, 'morning'),
      A('oot-garden', 'Government Botanical Garden', 'Terraced garden with rare plants.', ['nature', 'relaxation'], 2, 50, 'morning'),
      A('oot-lake', 'Ooty Lake Boating', 'Paddle or row boats on the lake.', ['relaxation'], 1.5, 300, 'afternoon'),
      A('oot-dodda', 'Doddabetta Peak', 'Highest viewpoint in the Nilgiris.', ['nature', 'sightseeing'], 1.5, 20, 'morning'),
      A('oot-tea', 'Tea Factory & Museum', 'See tea processing and taste.', ['food', 'culture'], 1.5, 100, 'afternoon'),
      A('oot-market', 'Charing Cross Market', 'Chocolates, tea and woollens.', ['shopping', 'food'], 1.5, 0, 'evening'),
    ],
  },
  {
    id: 'coorg', name: 'Coorg', state: 'Karnataka', emoji: '☕', gradient: G('#6b4226', '#2a9d8f'),
    tagline: 'Coffee plantations, waterfalls and misty hills.', bestFor: ['nature', 'relaxation', 'food', 'adventure'],
    intercityPP: 3000, stay: S(1100, 2800, 6500), food: S(450, 800, 1400), local: S(600, 1200, 2000),
    transportTip: 'local taxi', dishes: ['Pandi curry', 'Akki roti', 'Kadambuttu', 'Coorg coffee'],
    attractions: [
      A('coo-abbey', 'Abbey Falls', 'Waterfall in a spice plantation.', ['nature', 'sightseeing'], 1.5, 50, 'morning'),
      A('coo-raja', "Raja's Seat", 'Garden viewpoint for sunsets.', ['sightseeing', 'relaxation'], 1.5, 20, 'evening'),
      A('coo-coffee', 'Coffee Plantation Walk', 'Guided walk with tasting.', ['nature', 'food'], 2.5, 300, 'morning'),
      A('coo-dubare', 'Dubare Elephant Camp', 'Elephant bathing and feeding, seasonal.', ['nature', 'adventure'], 3, 400, 'morning'),
      A('coo-namdroling', 'Namdroling Monastery (Bylakuppe)', 'Large Tibetan Buddhist monastery.', ['culture', 'history'], 2, 0, 'afternoon'),
      A('coo-fort', 'Madikeri Fort', 'Old fort and museum.', ['history', 'sightseeing'], 1.5, 0, 'afternoon'),
    ],
  },
  {
    id: 'pondicherry', name: 'Puducherry', state: 'Puducherry', emoji: '🏛️', gradient: G('#f4b942', '#00b4d8'),
    tagline: 'French quarter, seaside cafes and spiritual calm.', bestFor: ['culture', 'beaches', 'food', 'relaxation'],
    intercityPP: 3500, stay: S(1200, 3000, 7000), food: S(500, 950, 1700), local: S(400, 900, 1600),
    transportTip: 'bicycle, scooter or auto-rickshaw', dishes: ['French-style crepes', 'Seafood platter', 'Filter coffee', 'Baguette sandwiches'],
    attractions: [
      A('pon-white', 'White Town Heritage Walk', 'Colourful French-colonial streets.', ['history', 'culture', 'sightseeing'], 2.5, 0, 'morning'),
      A('pon-promenade', 'Promenade Beach', 'Seafront walk, best at sunrise or dusk.', ['beaches', 'relaxation'], 1.5, 0, 'evening'),
      A('pon-auroville', 'Auroville & Matrimandir View', 'Experimental township and meditation dome.', ['culture', 'relaxation'], 3, 0, 'morning'),
      A('pon-paradise', 'Paradise Beach Boat Trip', 'Boat ride to a sandy island beach.', ['beaches', 'nature'], 3, 300, 'afternoon'),
      A('pon-ashram', 'Sri Aurobindo Ashram', 'Quiet spiritual centre.', ['culture', 'history'], 1, 0, 'afternoon'),
      A('pon-scuba', 'Scuba at Temple Reef', 'Beginner dive with instructor, seasonal.', ['adventure', 'beaches'], 2.5, 3500, 'morning', true),
      A('pon-cafes', 'Rue Suffren Cafes & Boutiques', 'Cafes and design shops.', ['food', 'shopping'], 2, 0, 'evening'),
    ],
  },
  {
    id: 'kolkata', name: 'Kolkata', state: 'West Bengal', emoji: '🌉', gradient: G('#264653', '#e76f51'),
    tagline: 'Colonial heritage, art, sweets and street food.', bestFor: ['history', 'food', 'culture', 'shopping'],
    intercityPP: 2800, stay: S(1000, 2800, 7000), food: S(400, 800, 1500), local: S(500, 1000, 1800),
    transportTip: 'metro, tram or app cab', dishes: ['Kathi roll', 'Rosogolla', 'Mishti doi', 'Bengali fish curry'],
    attractions: [
      A('kol-victoria', 'Victoria Memorial', 'Marble museum and gardens.', ['history', 'sightseeing'], 2, 50, 'morning'),
      A('kol-howrah', 'Howrah Bridge & Flower Market', 'Iconic bridge and Mullick Ghat market.', ['sightseeing', 'culture'], 1.5, 0, 'morning'),
      A('kol-dakshineswar', 'Dakshineswar Kali Temple', 'Riverside temple complex.', ['culture', 'history'], 1.5, 0, 'afternoon'),
      A('kol-museum', 'Indian Museum', 'India’s oldest and largest museum.', ['history', 'culture'], 2, 50, 'afternoon'),
      A('kol-park', 'Park Street Food Trail', 'Cafes, rolls and sweets.', ['food'], 2.5, 0, 'evening'),
      A('kol-college', 'College Street Book Market', 'Rows of second-hand bookstalls.', ['shopping', 'culture'], 2, 0, 'afternoon'),
      A('kol-tram', 'Heritage Tram Ride', 'Short ride on Asia’s oldest tram line.', ['sightseeing', 'culture'], 1, 10, 'any'),
    ],
  },
  {
    id: 'mysuru', name: 'Mysuru', state: 'Karnataka', emoji: '🏯', gradient: G('#d6603a', '#f4b942'),
    tagline: 'Royal palace city with gardens and silk markets.', bestFor: ['history', 'culture', 'shopping', 'sightseeing'],
    intercityPP: 2800, stay: S(900, 2400, 6000), food: S(400, 750, 1300), local: S(500, 1000, 1700),
    transportTip: 'auto-rickshaw', dishes: ['Mysore pak', 'Masala dosa', 'Bisi bele bath', 'Filter coffee'],
    attractions: [
      A('mys-palace', 'Mysore Palace', 'Grand Indo-Saracenic palace.', ['history', 'culture', 'sightseeing'], 2.5, 100, 'morning'),
      A('mys-chamundi', 'Chamundi Hill', 'Hilltop temple with city views.', ['culture', 'nature'], 2.5, 0, 'morning', true),
      A('mys-brindavan', 'Brindavan Gardens Musical Fountain', 'Evening fountain show, near KRS Dam.', ['relaxation', 'sightseeing'], 2, 100, 'evening'),
      A('mys-devaraja', 'Devaraja Market', 'Flowers, spices, silk and sandalwood.', ['shopping', 'food'], 2, 0, 'afternoon'),
      A('mys-philomena', "St. Philomena's Cathedral", 'Neo-Gothic church.', ['history', 'culture'], 1, 0, 'afternoon'),
      A('mys-zoo', 'Mysore Zoo', 'One of India’s oldest zoos.', ['nature'], 3, 100, 'afternoon'),
    ],
  },
];
