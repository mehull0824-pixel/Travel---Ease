import type { Attraction, Destination, Interest } from '../types';
import { MORE_DESTINATIONS } from './moreDestinations';
import { EXTRA_DESTINATIONS } from './extraDestinations';

// Helper: A(id, name, description, categories, hours, costPerPerson, slot, intense)
const A = (
  id: string, name: string, desc: string, categories: Interest[], hours: number,
  cost: number, slot: Attraction['slot'] = 'any', intense = false,
): Attraction => ({ id, name, desc, categories, hours, costPerPerson: cost, slot, intense });

/**
 * ALL PRICES ARE ILLUSTRATIVE SAMPLE ESTIMATES, not verified current prices.
 * To add a destination: copy one object below, change the values, and append it to DESTINATIONS.
 */
const BASE_DESTINATIONS: Destination[] = [
  {
    id: 'manali', name: 'Manali', state: 'Himachal Pradesh', emoji: '🏔️',
    gradient: 'linear-gradient(135deg,#0e9aa7,#0b2545)', tagline: 'Snowy peaks, pine forests and mountain adventure.',
    bestFor: ['nature', 'adventure', 'relaxation'], intercityPP: 3500,
    stay: { budget: 1200, balanced: 2800, comfort: 6500 }, food: { budget: 500, balanced: 900, comfort: 1600 },
    local: { budget: 800, balanced: 1500, comfort: 2500 },
    transportTip: 'local taxi or shared cab', dishes: ['Siddu', 'Trout fish', 'Himachali dham', 'Momos & thukpa'],
    attractions: [
      A('man-solang', 'Solang Valley', 'Valley with ropeway and optional adventure activities.', ['adventure', 'nature'], 4, 800, 'morning', true),
      A('man-hadimba', 'Hadimba Devi Temple', 'Historic wooden temple set in a cedar forest.', ['culture', 'history', 'sightseeing'], 1.5, 0, 'morning'),
      A('man-oldmanali', 'Old Manali Cafe Walk', 'Riverside lanes with cafes and live-music spots.', ['food', 'relaxation', 'shopping'], 2.5, 0, 'evening'),
      A('man-sissu', 'Atal Tunnel & Sissu', 'Scenic drive to the Lahaul side with mountain views.', ['nature', 'sightseeing'], 6, 500, 'morning'),
      A('man-jogini', 'Jogini Waterfall Trek', 'Short forest trail ending at a waterfall.', ['nature', 'adventure'], 3, 0, 'morning', true),
      A('man-vashisht', 'Vashisht Hot Springs', 'Village temples and natural hot-water springs.', ['relaxation', 'culture'], 2, 50, 'afternoon'),
      A('man-mall', 'Mall Road Manali', 'Evening stroll with local shops and street food.', ['shopping', 'food'], 2, 0, 'evening'),
      A('man-raft', 'River Rafting (Kullu)', 'Guided rafting on the Beas river, seasonal.', ['adventure'], 2.5, 1000, 'afternoon', true),
    ],
  },
  {
    id: 'goa', name: 'Goa', state: 'Goa', emoji: '🏖️',
    gradient: 'linear-gradient(135deg,#f77f00,#0e9aa7)', tagline: 'Beaches, Portuguese heritage, seafood and nightlife.',
    bestFor: ['beaches', 'food', 'relaxation'], intercityPP: 4500,
    stay: { budget: 1500, balanced: 3500, comfort: 8000 }, food: { budget: 600, balanced: 1100, comfort: 2000 },
    local: { budget: 700, balanced: 1400, comfort: 2400 },
    transportTip: 'rented scooter or local taxi', dishes: ['Goan fish curry', 'Bebinca', 'Pork vindaloo', 'Prawn balchão'],
    attractions: [
      A('goa-baga', 'Baga & Calangute Beach', 'Lively beaches with shacks and sunset views.', ['beaches', 'relaxation'], 3, 0, 'afternoon'),
      A('goa-aguada', 'Fort Aguada', '17th-century Portuguese fort with sea views.', ['history', 'sightseeing'], 2, 0, 'morning'),
      A('goa-bom', 'Basilica of Bom Jesus & Old Goa', 'UNESCO-listed churches of Old Goa.', ['history', 'culture'], 2.5, 0, 'morning'),
      A('goa-water', 'Water Sports at Baga', 'Optional parasailing, jet-ski and banana rides.', ['adventure', 'beaches'], 2, 1500, 'afternoon', true),
      A('goa-anjuna', 'Anjuna Flea Market', 'Weekly market for crafts, clothes and snacks.', ['shopping', 'food'], 2.5, 0, 'evening'),
      A('goa-palolem', 'Palolem Beach', 'Calm crescent beach in South Goa.', ['beaches', 'nature', 'relaxation'], 4, 0, 'afternoon'),
      A('goa-fontainhas', 'Fontainhas Latin Quarter', 'Colourful Portuguese-era lanes in Panaji.', ['culture', 'sightseeing'], 2, 0, 'morning'),
      A('goa-dudh', 'Dudhsagar Waterfall', 'Multi-tier waterfall reached by jeep safari.', ['nature', 'adventure'], 5, 700, 'morning', true),
      A('goa-cruise', 'Mandovi Sunset Cruise', 'Evening river cruise with music and dance.', ['sightseeing', 'relaxation'], 1.5, 500, 'evening'),
    ],
  },
  {
    id: 'jaipur', name: 'Jaipur', state: 'Rajasthan', emoji: '🏰',
    gradient: 'linear-gradient(135deg,#d6603a,#f4b942)', tagline: 'The Pink City of forts, palaces and bazaars.',
    bestFor: ['history', 'culture', 'shopping', 'food'], intercityPP: 2500,
    stay: { budget: 1000, balanced: 2600, comfort: 6000 }, food: { budget: 450, balanced: 850, comfort: 1500 },
    local: { budget: 600, balanced: 1200, comfort: 2200 },
    transportTip: 'auto-rickshaw or app cab', dishes: ['Dal baati churma', 'Laal maas', 'Pyaaz kachori', 'Ghewar'],
    attractions: [
      A('jai-amber', 'Amber Fort', 'Hilltop fort-palace with mirrored halls.', ['history', 'sightseeing', 'culture'], 3, 200, 'morning'),
      A('jai-city', 'City Palace', 'Royal residence with museums and courtyards.', ['history', 'culture'], 2, 300, 'afternoon'),
      A('jai-hawa', 'Hawa Mahal', 'Iconic honeycomb facade of the Palace of Winds.', ['sightseeing', 'history'], 1, 50, 'morning'),
      A('jai-jantar', 'Jantar Mantar', 'Historic astronomical observatory.', ['history', 'culture'], 1.5, 50, 'afternoon'),
      A('jai-bapu', 'Bapu Bazaar', 'Textiles, jewellery, juttis and street snacks.', ['shopping', 'food'], 2.5, 0, 'evening'),
      A('jai-nahar', 'Nahargarh Fort Sunset', 'City views from the Aravalli ridge.', ['sightseeing', 'nature'], 2, 50, 'evening'),
      A('jai-chokhi', 'Chokhi Dhani Village Experience', 'Rajasthani village-style dinner and folk shows.', ['culture', 'food'], 3, 800, 'evening'),
      A('jai-jal', 'Jal Mahal Viewpoint', 'Palace in the middle of Man Sagar Lake.', ['sightseeing', 'relaxation'], 1, 0, 'any'),
    ],
  },
  {
    id: 'agra', name: 'Agra', state: 'Uttar Pradesh', emoji: '🕌',
    gradient: 'linear-gradient(135deg,#0b2545,#d6603a)', tagline: 'Home of the Taj Mahal and Mughal heritage.',
    bestFor: ['history', 'culture', 'sightseeing'], intercityPP: 2000,
    stay: { budget: 900, balanced: 2400, comfort: 5500 }, food: { budget: 400, balanced: 800, comfort: 1400 },
    local: { budget: 500, balanced: 1000, comfort: 1800 },
    transportTip: 'e-rickshaw or app cab', dishes: ['Petha', 'Bedai & jalebi', 'Mughlai kebabs', 'Dalmoth'],
    attractions: [
      A('agr-taj', 'Taj Mahal', 'The ivory-marble mausoleum, best at sunrise.', ['history', 'sightseeing', 'culture'], 3, 1100, 'morning'),
      A('agr-fort', 'Agra Fort', 'Red-sandstone Mughal fort with river views.', ['history', 'sightseeing'], 2.5, 600, 'afternoon'),
      A('agr-mehtab', 'Mehtab Bagh', 'Garden with a view of the Taj across the river.', ['sightseeing', 'relaxation'], 1.5, 300, 'evening'),
      A('agr-fatehpur', 'Fatehpur Sikri', 'Abandoned Mughal capital, UNESCO World Heritage Site.', ['history', 'culture'], 3.5, 600, 'morning'),
      A('agr-kinari', 'Kinari Bazaar', 'Old-city market for marble crafts and sweets.', ['shopping', 'food'], 2, 0, 'evening'),
      A('agr-itimad', 'Itimad-ud-Daulah (Baby Taj)', 'Delicate marble tomb with inlay work.', ['history', 'culture'], 1, 300, 'afternoon'),
      A('agr-food', 'Mughlai & Petha Food Trail', 'Sample local sweets and kebabs in Sadar Bazaar.', ['food', 'culture'], 2, 0, 'evening'),
    ],
  },
  {
    id: 'rishikesh', name: 'Rishikesh', state: 'Uttarakhand', emoji: '🧘',
    gradient: 'linear-gradient(135deg,#2a9d8f,#264653)', tagline: 'Yoga capital of the world on the banks of the Ganga.',
    bestFor: ['adventure', 'relaxation', 'culture', 'nature'], intercityPP: 2200,
    stay: { budget: 800, balanced: 2000, comfort: 5000 }, food: { budget: 400, balanced: 750, comfort: 1300 },
    local: { budget: 500, balanced: 1000, comfort: 1800 },
    transportTip: 'shared tuk-tuk or taxi', dishes: ['Aloo puri', 'Chole bhature', 'Kachori sabzi', 'Fresh cafe thalis'],
    attractions: [
      A('rish-jhula', 'Laxman Jhula & Ram Jhula', 'Iconic suspension bridges and riverside lanes.', ['sightseeing', 'culture'], 2, 0, 'morning'),
      A('rish-aarti', 'Ganga Aarti at Triveni Ghat', 'Evening prayer ceremony on the river.', ['culture', 'relaxation'], 1.5, 0, 'evening'),
      A('rish-raft', 'River Rafting', 'Guided rafting on the Ganga, seasonal.', ['adventure'], 3, 1000, 'morning', true),
      A('rish-beatles', 'Beatles Ashram', 'Forest ashram with murals and meditation huts.', ['history', 'culture'], 2, 150, 'afternoon'),
      A('rish-neer', 'Neer Garh Waterfall', 'Short trek to a tiered waterfall.', ['nature', 'adventure'], 2, 50, 'afternoon', true),
      A('rish-yoga', 'Morning Yoga Session', 'Drop-in beginner-friendly yoga class.', ['relaxation', 'culture'], 1.5, 400, 'morning'),
      A('rish-bungee', 'Bungee / Flying Fox', 'Optional high-adrenaline jump platform.', ['adventure'], 2, 3500, 'afternoon', true),
      A('rish-tapovan', 'Tapovan Cafe Hopping', 'Riverside cafes and small boutiques.', ['food', 'shopping', 'relaxation'], 2, 0, 'evening'),
    ],
  },
  {
    id: 'shimla', name: 'Shimla', state: 'Himachal Pradesh', emoji: '🚂',
    gradient: 'linear-gradient(135deg,#5b8def,#0b2545)', tagline: 'Colonial charm, pine ridges and toy-train views.',
    bestFor: ['nature', 'sightseeing', 'shopping', 'relaxation'], intercityPP: 3000,
    stay: { budget: 1100, balanced: 2600, comfort: 6000 }, food: { budget: 450, balanced: 850, comfort: 1500 },
    local: { budget: 600, balanced: 1200, comfort: 2000 },
    transportTip: 'local taxi (many roads are walkable)', dishes: ['Chana madra', 'Babru', 'Aktori', 'Himachali trout'],
    attractions: [
      A('shi-ridge', 'The Ridge & Mall Road', 'Open promenade with colonial buildings and shops.', ['sightseeing', 'shopping'], 2.5, 0, 'evening'),
      A('shi-jakhu', 'Jakhu Temple', 'Hilltop Hanuman temple with panoramic views.', ['culture', 'nature'], 2.5, 0, 'morning', true),
      A('shi-christ', 'Christ Church', 'Neo-Gothic church on the Ridge.', ['history', 'culture'], 1, 0, 'morning'),
      A('shi-kufri', 'Kufri', 'Hill resort with viewpoints and optional pony rides.', ['adventure', 'nature'], 4, 500, 'morning'),
      A('shi-vice', 'Viceregal Lodge', 'Former residence of the British Viceroy.', ['history', 'sightseeing'], 1.5, 50, 'afternoon'),
      A('shi-train', 'Toy Train Short Ride', 'Short segment on the heritage Kalka–Shimla line.', ['sightseeing', 'nature'], 2, 400, 'any'),
      A('shi-chad', 'Chadwick Falls', 'Forest walk to a seasonal waterfall.', ['nature', 'adventure'], 2, 0, 'afternoon', true),
      A('shi-lakkar', 'Lakkar Bazaar', 'Wooden handicrafts and street food.', ['shopping', 'food'], 1.5, 0, 'evening'),
      A('shi-mash', 'Mashobra & Naldehra', 'Quiet orchards, meadows and a golf-course walk.', ['nature', 'relaxation'], 3, 100, 'afternoon'),
    ],
  },
];

export const DESTINATIONS: Destination[] = [...BASE_DESTINATIONS, ...MORE_DESTINATIONS, ...EXTRA_DESTINATIONS];
