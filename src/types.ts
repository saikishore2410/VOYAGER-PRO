export interface ItineraryStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  x: number; // For clean map rendering
  y: number; // For clean map rendering
  arrivalTime?: string;
  notes?: string;
}

export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  stops: ItineraryStop[];
  savedOffline: boolean;
  interests?: string[];
  dietaryPrefs?: string[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  convertedAmountUSD: number;
  category: "Transport" | "Car Rental" | "Accommodation" | "Food" | "Sightseeing" | "Utilities" | "Other";
  date: string;
  isGroupShared: boolean;
  paidBy: string;
  splitWith: string[]; // List of names
}

export interface DirectBooking {
  id: string;
  hotelName: string;
  city: string;
  pricePerNightUSD: number;
  rating: number;
  amenities: string[];
  imageUrl: string;
  durationDays: number;
  roomType: string;
}

export interface UserBooking {
  id: string;
  booking: DirectBooking;
  checkInDate: string;
  guestName: string;
  passportNumberSecret?: string; // Stored in encrypted/biometric vault
  status: "Confirmed" | "Pending" | "Cancelled";
}

export interface TransitAlert {
  id: string;
  type: "Traffic" | "Construction" | "Delays" | "Weather" | "General";
  severity: "Minor" | "Moderate" | "Severe";
  title: string;
  description: string;
  affectedLineOrRoad: string;
  timestamp: string;
}

export interface WeatherCondition {
  tempCelsius: number;
  condition: string;
  icon: string;
  humidity: number;
  warning?: string;
}

export interface SocialPost {
  id: string;
  author: string;
  destination: string;
  itinerarySummary: string;
  content: string;
  likes: number;
  timestamp: string;
  shares: number;
}

export interface GeminiRecommendation {
  summary: string;
  activities: {
    title: string;
    description: string;
    estimatedCostUSD: number;
    recommendedTime: string;
  }[];
  culinaryHighlights: {
    dishName: string;
    description: string;
    suggestedPlaces: string[];
    dietFriendly: boolean;
  }[];
}

export type SupportedLanguage = "en" | "es" | "fr" | "ja" | "hi";

export interface TravelDocument {
  id: string;
  type: "Passport" | "Visa" | "DriverLicense" | "Insurance" | "Ticket";
  title: string;
  docNumber: string;
  expiryDate: string;
  notes?: string;
}
