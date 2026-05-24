import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Shared in-memory cloud database for robust synced states
let globalItineraries = [
  {
    id: "trip-tokyo",
    title: "Summer Vacation in Tokyo",
    destination: "Tokyo, Japan",
    startDate: "2026-07-10",
    endDate: "2026-07-18",
    savedOffline: true,
    interests: ["Tech", "Anime", "Sushi", "Traditional Architecture"],
    dietaryPrefs: ["Gluten-free"],
    stops: [
      { id: "s1", name: "Shinjuku Station", latitude: 35.6896, longitude: 139.7006, x: 20, y: 35, arrivalTime: "09:00 AM", notes: "Arrival & ticket check-in" },
      { id: "s2", name: "Meiji Jingu Shrine", latitude: 35.6764, longitude: 139.6993, x: 25, y: 55, arrivalTime: "11:30 AM", notes: "Forest walk & traditional shrine" },
      { id: "s3", name: "Shibuya Crossing", latitude: 35.6580, longitude: 139.7016, x: 30, y: 75, arrivalTime: "02:00 PM", notes: "Amazing crowds, Starbucks viewpoint" },
      { id: "s4", name: "Akihabara Electric Town", latitude: 35.6983, longitude: 139.7715, x: 80, y: 25, arrivalTime: "05:00 PM", notes: "Manga, retro-gaming and sushi dinner" }
    ]
  },
  {
    id: "trip-paris",
    title: "Art & Gastronomy Extravaganza",
    destination: "Paris, France",
    startDate: "2026-09-02",
    endDate: "2026-09-08",
    savedOffline: false,
    interests: ["Art museum", "Pastries", "History", "Coffee shops"],
    dietaryPrefs: ["Vegan"],
    stops: [
      { id: "p1", name: "Louvre Museum", latitude: 48.8606, longitude: 2.3376, x: 45, y: 30, arrivalTime: "10:00 AM", notes: "Booked Mona Lisa time slot" },
      { id: "p2", name: "Jardin des Tuileries", latitude: 48.8635, longitude: 2.3275, x: 30, y: 40, arrivalTime: "01:30 PM", notes: "Relaxing lunch walk, hot chocolate" },
      { id: "p3", name: "Eiffel Tower Pier", latitude: 48.8584, longitude: 2.2945, x: 10, y: 65, arrivalTime: "04:30 PM", notes: "Sunset cruise & Seine landmarks" }
    ]
  }
];

let globalExpenses = [
  { id: "exp-1", title: "JR Rail Pass Passbook", amount: 280, currency: "USD", convertedAmountUSD: 280, category: "Transport", date: "2026-05-24", isGroupShared: true, paidBy: "You", splitWith: ["Sarah", "Marcus"] },
  { id: "exp-2", title: "Shibuya Capsule Hostel Deposit", amount: 45000, currency: "JPY", convertedAmountUSD: 290.40, category: "Accommodation", date: "2026-05-24", isGroupShared: true, paidBy: "Sarah", splitWith: ["You", "Marcus"] },
  { id: "exp-3", title: "Car Rental - Hakone Scenic Loop", amount: 120, currency: "USD", convertedAmountUSD: 120, category: "Car Rental", date: "2026-05-25", isGroupShared: false, paidBy: "You", splitWith: [] },
  { id: "exp-4", title: "Traditional Hand-rolled Sushi Lunch", amount: 15400, currency: "JPY", convertedAmountUSD: 99.30, category: "Food", date: "2026-05-25", isGroupShared: true, paidBy: "Marcus", splitWith: ["You", "Sarah"] }
];

let globalBookings = [
  { id: "b-1", booking: { id: "hotel-1", hotelName: "Hotel Gracery Shinjuku (Godzilla Hotel)", city: "Tokyo, Japan", pricePerNightUSD: 195, rating: 4.8, amenities: ["WiFi", "A/C", "Godzilla Terrace", "English Support", "Metro Access"], imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80", durationDays: 4, roomType: "Double Standard Room" }, checkInDate: "2026-07-10", guestName: "Sarah Connor", passportNumberSecret: "P******23", status: "Confirmed" },
  { id: "b-2", booking: { id: "hotel-2", hotelName: "Sotetsu Fresa Inn Ginza-Nanachome", city: "Tokyo, Japan", pricePerNightUSD: 140, rating: 4.6, amenities: ["WiFi", "Subway Near", "Self Check-in", "Coin Laundry"], imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80", durationDays: 3, roomType: "Superior Compact Twin" }, checkInDate: "2026-07-14", guestName: "Sarah Connor", status: "Pending" }
];

let globalSocialFeed = [
  { id: "p-1", author: "Emily Watson", destination: "Tokyo, Japan", itinerarySummary: "4 station public transit loop visiting shrines, arcades and bullet train connectors.", content: "Just successfully downloaded the offline subway maps for Shinjuku and Shibuya! Spent the afternoon at Akihabara without any cell service, and our offline transit stop tracker worked flawlessly. Check out our itinerary stops!", likes: 18, shares: 3, timestamp: "2 hours ago" },
  { id: "p-2", author: "Devon Graham", destination: "Paris, France", itinerarySummary: "Louvre to Eiffel Tower walking path and sunset river cruise itinerary stops.", content: "Group split-budgets make calculations so easy! Shared expenses for Eiffel tower ticks are perfectly divided USD-to-EUR in real-time. Shared it below so you can clone my Louvre walk directly to your itinerary tab.", likes: 11, shares: 1, timestamp: "5 hours ago" }
];

// Preconfigured hotel list for accommodations booking
const ACCOMMODATIONS_DATABASE = [
  { id: "hotel-1", hotelName: "Hotel Gracery Shinjuku (Godzilla Hotel)", city: "Tokyo, Japan", pricePerNightUSD: 195, rating: 4.8, amenities: ["WiFi", "A/C", "Godzilla Terrace", "English Support", "Metro Access"], imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80", durationDays: 4, roomType: "Double Deluxe Standard" },
  { id: "hotel-2", hotelName: "Sotetsu Fresa Inn Ginza-Nanachome", city: "Tokyo, Japan", pricePerNightUSD: 140, rating: 4.6, amenities: ["WiFi", "Subway Near", "Self Check-in", "Coin Laundry"], imageUrl: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80", durationDays: 3, roomType: "Superior Compact Twin" },
  { id: "hotel-3", hotelName: "Capsule Hotel Anshin Oyado", city: "Tokyo, Japan", pricePerNightUSD: 65, rating: 4.4, amenities: ["Shared Bath", "Sauna Room", "Unlimited Tea", "VR System"], imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80", durationDays: 2, roomType: "Modern Tech Capsule" },
  { id: "hotel-4", hotelName: "Hotel Lutetia Left Bank", city: "Paris, France", pricePerNightUSD: 360, rating: 4.9, amenities: ["Infinity Spa", "Michelin Stars", "Scenic Balconies", "Vintage Champagne Bar"], imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80", durationDays: 3, roomType: "Art Deco Balcony Suite" },
  { id: "hotel-5", hotelName: "Caron de Beaumarchais Marais", city: "Paris, France", pricePerNightUSD: 175, rating: 4.7, amenities: ["Antique Decors", "Boutique Atmosphere", "Free Croissant Breakfast"], imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80", durationDays: 5, roomType: "Historical Cosy Queen" }
];

// Preconfigured list of transit, traffic and storm alerts
const GLOBAL_ALERTS = [
  { id: "a-1", type: "Traffic", severity: "Severe", title: "Heavy Jam on Shibuya Metropolitan Express", description: "Multi-vehicle collision near exit 4 causing 25-minute delays, recommend public Tokyo Metro Ginza Line diversion.", affectedLineOrRoad: "Metropolitan Route 3", timestamp: "15 mins ago" },
  { id: "a-2", type: "Delays", severity: "Moderate", title: "Yamanote Line Signalling Glitch", description: "Inner loop trains operating with 8-12 minute delays under reduced speed protocols. Express lines run normal.", affectedLineOrRoad: "JR Yamanote Line Loop", timestamp: "35 mins ago" },
  { id: "a-3", type: "Weather", severity: "Severe", title: "Active Severe Storm/Rain Alert", description: "Severe downpour incoming within the next 2 hours. Expect localized surface street water pooling and wind gusts up to 45km/h.", affectedLineOrRoad: "Chuo Line / Ground Terminals", timestamp: "1 hour ago" },
  { id: "a-4", type: "Construction", severity: "Minor", title: "Louvre-Rivoli Walkway Repair", description: "Pedestrian access limited to northern gates due to walkway tile enhancements. Watch for directional boards.", affectedLineOrRoad: "Louvre Entrance Metro Exit 1", timestamp: "3 hours ago" }
];

// Live exchange rate calculations relative to USD
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155.0,
  INR: 83.20
};

// Lazy initialize Gemini clients
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. AI functionality will fallback gracefully.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// ---------------------- API Endpoints ----------------------

// Currency Conversion Calculation Helper API
app.get("/api/currency", (req, res) => {
  res.json({
    success: true,
    rates: EXCHANGE_RATES,
    timestamp: new Date().toISOString()
  });
});

// Transit Alerts & Emergency weather advisories
app.get("/api/alerts", (req, res) => {
  res.json({
    success: true,
    alerts: GLOBAL_ALERTS
  });
});

// Itineraries: fetch all (cloud synced)
app.get("/api/itineraries", (req, res) => {
  res.json({
    success: true,
    itineraries: globalItineraries
  });
});

// Itineraries: save/update (cloud synced)
app.post("/api/itineraries", (req, res) => {
  const newOrUpdated = req.body;
  if (!newOrUpdated.id) {
    newOrUpdated.id = "trip-" + Date.now();
  }
  const existingIndex = globalItineraries.findIndex(i => i.id === newOrUpdated.id);
  if (existingIndex !== -1) {
    globalItineraries[existingIndex] = { ...globalItineraries[existingIndex], ...newOrUpdated };
  } else {
    globalItineraries.push(newOrUpdated);
  }
  res.json({
    success: true,
    itineraries: globalItineraries,
    item: newOrUpdated
  });
});

// Itineraries: Delete
app.delete("/api/itineraries/:id", (req, res) => {
  const { id } = req.params;
  globalItineraries = globalItineraries.filter(i => i.id !== id);
  res.json({
    success: true,
    itineraries: globalItineraries
  });
});

// Expenses: fetch all (group & personal expense logs)
app.get("/api/expenses", (req, res) => {
  res.json({
    success: true,
    expenses: globalExpenses
  });
});

// Expenses: create/edit
app.post("/api/expenses", (req, res) => {
  const expense = req.body;
  if (!expense.id) {
    expense.id = "exp-" + Date.now();
  }
  
  // Clean values & calculate conversion
  const rate = EXCHANGE_RATES[expense.currency] || 1.0;
  expense.convertedAmountUSD = parseFloat((expense.amount / rate).toFixed(2));
  
  const existingIndex = globalExpenses.findIndex(e => e.id === expense.id);
  if (existingIndex !== -1) {
    globalExpenses[existingIndex] = expense;
  } else {
    globalExpenses.push(expense);
  }
  
  res.json({
    success: true,
    expenses: globalExpenses,
    item: expense
  });
});

// Expenses: Delete
app.delete("/api/expenses/:id", (req, res) => {
  const { id } = req.params;
  globalExpenses = globalExpenses.filter(e => e.id !== id);
  res.json({
    success: true,
    expenses: globalExpenses
  });
});

// Bookings: List of accommodations and booked history
app.get("/api/bookings", (req, res) => {
  res.json({
    success: true,
    accommodations: ACCOMMODATIONS_DATABASE,
    userBookings: globalBookings
  });
});

// Bookings: submit a new direct hotel room reservation
app.post("/api/bookings", (req, res) => {
  const { hotelId, checkInDate, guestName, passportNumberSecret, durationDays } = req.body;
  const hotel = ACCOMMODATIONS_DATABASE.find(h => h.id === hotelId);
  
  if (!hotel) {
    return res.status(404).json({ success: false, message: "Accommodation not found." });
  }

  const userBooking = {
    id: "b-" + Date.now(),
    booking: { ...hotel, durationDays: Number(durationDays) || 3 },
    checkInDate: checkInDate || "2026-06-15",
    guestName: guestName || "Unnamed Traveler",
    passportNumberSecret: passportNumberSecret || undefined,
    status: "Confirmed" as const
  };

  globalBookings.push(userBooking);

  // Auto add to expenses
  const totalCost = hotel.pricePerNightUSD * (Number(durationDays) || 3);
  globalExpenses.push({
    id: "exp-booking-" + userBooking.id,
    title: `Accommodation: ${hotel.hotelName}`,
    amount: totalCost,
    currency: "USD",
    convertedAmountUSD: totalCost,
    category: "Accommodation",
    date: checkInDate || new Date().toISOString().split('T')[0],
    isGroupShared: false,
    paidBy: "You",
    splitWith: []
  });

  res.json({
    success: true,
    userBookings: globalBookings,
    expenses: globalExpenses,
    booking: userBooking
  });
});

// Booking: Cancel
app.delete("/api/bookings/:id", (req, res) => {
  const { id } = req.params;
  const bookingIndex = globalBookings.findIndex(b => b.id === id);
  if (bookingIndex !== -1) {
    globalBookings[bookingIndex].status = "Cancelled";
  }
  res.json({
    success: true,
    userBookings: globalBookings
  });
});

// Social Feed sharing logic
app.get("/api/social-feed", (req, res) => {
  res.json({
    success: true,
    feed: globalSocialFeed
  });
});

app.post("/api/social-feed", (req, res) => {
  const { author, destination, itinerarySummary, content } = req.body;
  const post = {
    id: "p-" + Date.now(),
    author: author || "Curious Adventurer",
    destination: destination || "Global Traveler",
    itinerarySummary: itinerarySummary || "Custom mapped paths",
    content: content || "",
    likes: 0,
    shares: 0,
    timestamp: "Just now"
  };
  globalSocialFeed.unshift(post);
  res.json({
    success: true,
    feed: globalSocialFeed,
    item: post
  });
});

// Gemini AI Recommendation API handler
app.post("/api/gemini/recommendations", async (req, res) => {
  const { destination, interests, dietaryPrefs, budgetTier, transitMode } = req.body;

  if (!destination) {
    return res.status(400).json({ success: false, message: "A destination is required to generate travel reviews." });
  }

  const client = getGeminiClient();
  if (!client) {
    // Elegant fallback mock recommendation if API key is not present
    const fallback = generateMockAIRecommendation(destination, interests || [], dietaryPrefs || []);
    return res.json({
      success: true,
      data: fallback,
      isMock: true,
      message: "Showing precompiled travel guide due to offline key configurations."
    });
  }

  try {
    const prompt = `You are Voyager, a premium AI travel assistant specializing in optimized transit logic and local highlights.
Destination: ${destination}
User Traveling Style/Interests: ${interests ? interests.join(", ") : "general exploration, scenery, museums"}
Dietary Information or Preferences: ${dietaryPrefs ? dietaryPrefs.join(", ") : "None/Open to anything"}
Budget Level: ${budgetTier || "Moderate"}
Primary Transportation Mode Chosen: ${transitMode || "Public Transport / Train"}

Generate a comprehensive travel optimization recommendations structure. It MUST strictly use this JSON schema:
{
  "summary": "Expert short text detailing route convenience, traffic trends, and transit advisory.",
  "activities": [
    {
       "title": "Name of tailored activity/stop",
       "description": "Short reasoning of why it matches their listed interests and transit modes.",
       "estimatedCostUSD": 25,
       "recommendedTime": "Morning / 3 Hours"
    }
  ],
  "culinaryHighlights": [
    {
       "dishName": "Must-try dish of the local region",
       "description": "Flavor details and where to enjoy, fully tailored to accommodate listed dietary filters.",
       "suggestedPlaces": ["Local landmark tavern or food stall"],
       "dietFriendly": true
    }
  ]
}

Only return clean parseable JSON. Do not write visual symbols, markdown formatting blocks, or surrounding ticks other than the text containing the JSON data payload structure. Ensure JSON is valid.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Compact transit summary overview" },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedCostUSD: { type: Type.INTEGER },
                  recommendedTime: { type: Type.STRING }
                },
                required: ["title", "description", "estimatedCostUSD", "recommendedTime"]
              }
            },
            culinaryHighlights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dishName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suggestedPlaces: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  dietFriendly: { type: Type.BOOLEAN }
                },
                required: ["dishName", "description", "suggestedPlaces", "dietFriendly"]
              }
            }
          },
          required: ["summary", "activities", "culinaryHighlights"]
        }
      }
    });

    const textOutput = response.text || "{}";
    const parsedData = JSON.parse(textOutput);

    res.json({
      success: true,
      data: parsedData,
      isMock: false
    });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    const fallback = generateMockAIRecommendation(destination, interests || [], dietaryPrefs || []);
    res.json({
      success: true,
      data: fallback,
      isMock: true,
      errorMessage: error.message || "Unknown GenAI parsing failure"
    });
  }
});

// Robust programmatic Mock creator for seamless failsafes
function generateMockAIRecommendation(destination: string, interests: string[], dietary: string[]) {
  const cleanDest = destination.trim().toLowerCase();
  
  const activitiesList = [
    { title: "Public High-Speed Transit Route Explorer", description: "Take the primary express bullet or local train circuit for the fastest transfers, skipping surface jams.", estimatedCostUSD: 18, recommendedTime: "All Day ticket" },
    { title: "Scenic Historical Garden Walks", description: "A quiet, pedestrianized path filled with architecture, highly recommended since you like " + (interests[0] || "exploration") + ".", estimatedCostUSD: 5, recommendedTime: "Afternoon / 2 hours" },
    { title: "Sunset Skyline Overlook Deck", description: "Vibrant observation tower presenting an integrated map view of city transit corridors.", estimatedCostUSD: 24, recommendedTime: "Evening / 1.5 hours" }
  ];

  const highlights = [
    { dishName: "Signature Local Craft Dining Special", description: "Delicate and seasoned using home-grown spices, prepared meticulously to suit " + (dietary.join(", ") || "standard profiles") + ".", suggestedPlaces: ["Central Market Grill", "Wayside Eatery"], dietFriendly: true },
    { dishName: "Savory Steamed Street Snacks", description: "An incredible quick bite accessible close to major passenger terminals and car hire outlets.", suggestedPlaces: ["Express Stop Foodstall"], dietFriendly: true }
  ];

  return {
    summary: `Transit is highly accessible in ${destination}! Car rentals are ideal for remote exploration, whilst the comprehensive public subways bypass metropolitan peak-time traffic delays completely. Local alerts suggest buying digital passes beforehand.`,
    activities: activitiesList,
    culinaryHighlights: highlights
  };
}

// -------------------- Vite Server Connection --------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting development environment node proxy...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Voyager Full-Stack Server listening successfully on port ${PORT}`);
  });
}

startServer();
