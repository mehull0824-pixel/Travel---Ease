export type Interest = 'nature' | 'adventure' | 'beaches' | 'history' | 'culture' | 'food' | 'shopping' | 'relaxation' | 'sightseeing';
export type TravelStyle = 'budget' | 'balanced' | 'comfort';
export type AgeGroup = 'under18' | '18-25' | '26-40' | '41-60' | 'above60';
export type Pace = 'relaxed' | 'balanced' | 'packed';
export type Accommodation = 'any' | 'hostel' | 'homestay' | 'hotel' | 'resort';
export type SlotName = 'Morning' | 'Afternoon' | 'Evening';

export interface Attraction {
  id: string;
  name: string;
  desc: string;
  categories: Interest[];
  hours: number;
  costPerPerson: number; // illustrative estimate in INR
  slot: 'morning' | 'afternoon' | 'evening' | 'any';
  intense: boolean;
}

export interface StyleCosts { budget: number; balanced: number; comfort: number }

export interface Destination {
  id: string;
  name: string;
  state: string;
  emoji: string;
  gradient: string;
  tagline: string;
  bestFor: Interest[];
  intercityPP: number; // illustrative round trip from a major metro, per person
  stay: StyleCosts; // per room per night
  food: StyleCosts; // per person per day
  local: StyleCosts; // per day for a group of up to 4
  transportTip: string;
  dishes: string[];
  attractions: Attraction[];
}

export interface TripInput {
  destinationId: string;
  startCity: string;
  age: AgeGroup | '';
  budget: number;
  days: number;
  travellers: number;
  interests: Interest[];
  style: TravelStyle;
  pace: Pace;
  accommodation: Accommodation;
  accessibility: boolean;
  freeOnly?: boolean;
  startDate?: string; // YYYY-MM-DD
}

export interface PlannedActivity {
  attractionId: string;
  name: string;
  desc: string;
  slot: SlotName;
  time: string;
  hours: number;
  costPerPerson: number;
  totalCost: number;
  categories: Interest[];
  reason: string;
  transport: string;
  mapsUrl: string;
  isFiller: boolean;
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: PlannedActivity[];
  meals: { type: string; suggestion: string }[];
  costs: { activities: number; food: number; local: number; stay: number; total: number };
}

export interface BudgetLine { key: string; label: string; total: number; perPerson: number; note: string }

export interface Budget {
  lines: BudgetLine[];
  total: number;
  perPersonTotal: number;
  budget: number;
  remaining: number;
  withinBudget: boolean;
}

export interface Alternative {
  title: string;
  detail: string;
  estimatedTotal: number;
  saving: number;
  apply: Partial<Pick<TripInput, 'style' | 'freeOnly' | 'days'>>;
}

export interface Itinerary {
  id: string;
  createdAt: string;
  seed: number;
  destinationId: string;
  destinationName: string;
  summary: string;
  reasons: string[];
  ageNotes: string[];
  days: DayPlan[];
  budget: Budget;
  alternatives: Alternative[];
  warning?: string;
  ai?: { overview: string; tips: string[] };
  source: 'rule-based' | 'gemini';
  disclaimer: string;
}

export interface SavedTrip { id: string; savedAt: string; input: TripInput; itinerary: Itinerary }
