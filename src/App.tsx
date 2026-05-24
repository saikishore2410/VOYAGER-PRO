import React, { useState, useEffect } from "react";
import { 
  Compass, Map, Wallet, Building, Sparkles, KeyRound, Users, 
  Wifi, WifiOff, Bell, Languages, Shield, CloudRain, CloudSun, AlertTriangle, 
  MapPin, RefreshCw, Layers, Check, Copy, Trash2, Key, Info, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Importing high-fidelity subcomponents
import MapSimulator from "./components/MapSimulator";
import ExpenseTracker from "./components/ExpenseTracker";
import BookingPortal from "./components/BookingPortal";
import AiAdvisor from "./components/AiAdvisor";
import BiometricVault from "./components/BiometricVault";
import SocialHub from "./components/SocialHub";

// Import types
import { 
  Itinerary, ItineraryStop, Expense, DirectBooking, 
  UserBooking, TransitAlert, SocialPost, SupportedLanguage, TravelDocument, WeatherCondition 
} from "./types";

// Translation Dictionary for multi-language navigation support
const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    app_title: "VOYAGER",
    sub_title: "Smart Transit & Travel Ledger",
    tab_map: "Transit Route Stops",
    tab_budget: "Expense ledger",
    tab_bookings: "Direct Lodging",
    tab_ai: "AI Co-pilot",
    tab_vault: "Security vault",
    tab_social: "Traveler Forum",
    status_online: "ONLINE - Cloud Synced",
    status_offline: "OFFLINE - Local Storage",
    current_city: "Active City",
    weather_desc: "Current Weather Matrix",
    warning_title: "Emergency Broadcast Alerts",
    passport_lock: "Access to private documents encrypted with simulated biometrics. Tap to clear."
  },
  es: {
    app_title: "VOYAGER",
    sub_title: "Seguimiento Inteligente de Tránsito y Viajes",
    tab_map: "Rutas y Paradas",
    tab_budget: "Presupuesto y Gastos",
    tab_bookings: "Hoteles Directos",
    tab_ai: "Co-piloto IA",
    tab_vault: "Bóveda Segura",
    tab_social: "Foro de Viajeros",
    status_online: "EN LÍNEA - Sincronizado",
    status_offline: "FUERA DE LÍNEA - Caché Local",
    current_city: "Ciudad Activa",
    weather_desc: "Matriz Meteorológica Actual",
    warning_title: "Previsiones de Emergencia",
    passport_lock: "Documentos privados encriptados con datos biométricos. Pulse para desbloquear."
  },
  fr: {
    app_title: "VOYAGER",
    sub_title: "Transit Intelligent & Registre de Voyage",
    tab_map: "Itinéraires & Arrêts",
    tab_budget: "Tracker de Budget",
    tab_bookings: "Logements Directs",
    tab_ai: "Co-pilote IA",
    tab_vault: "Coffre-fort Sécurisé",
    tab_social: "Forum des Voyageurs",
    status_online: "EN LIGNE - Synchronisé",
    status_offline: "HORS LIGNE - Stockage Local",
    current_city: "Ville Active",
    weather_desc: "Météo Actuelle",
    warning_title: "Alerte d'Urgence Publique",
    passport_lock: "Documents sécurisés débloqués par capteur d'empreintes simulé."
  },
  ja: {
    app_title: "VOYAGER",
    sub_title: "スマート交通機関と旅程バジェット管理",
    tab_map: "経路と乗換一覧",
    tab_budget: "費用計算マネージャー",
    tab_bookings: "宿直結予約",
    tab_ai: "AIコンパニオン",
    tab_vault: "生体認証金庫",
    tab_social: "トラベラー掲示板",
    status_online: "オンプレミス - クラウド同期中",
    status_offline: "オフライン - ローカルキャッシュ保管中",
    current_city: "対象都市",
    weather_desc: "リアルタイム気象基準",
    warning_title: "緊急避難・遅延放送",
    passport_lock: "機密書類は生体キーチェックで保護中。ロッククリアで表示。"
  },
  hi: {
    app_title: "VOYAGER",
    sub_title: "स्मार्ट पारगमन और यात्रा व्यय बहीखाता",
    tab_map: "मार्ग और प्रमुख पड़ाव",
    tab_budget: "यात्रा बजट ट्रैकर",
    tab_bookings: "सीधी होटल बुकिंग",
    tab_ai: "एआई सह-चालक",
    tab_vault: "बायोमेट्रिक तिजोरी",
    tab_social: "यात्री मंच और साझाकरण",
    status_online: "ऑनलाइन - क्लाउड सिंक",
    status_offline: "ऑफ़लाइन - स्थानीय संग्रह",
    current_city: "सक्रिय शहर",
    weather_desc: "मौसम की स्थिति",
    warning_title: "आपातकालीन चेतावनी",
    passport_lock: "संवेदनशील दस्तावेज बायोमेट्रिक प्रमाणीकरण द्वारा सुरक्षित।"
  }
};

const CITY_OPTIONS = [
  "Tokyo, Japan",
  "Paris, France",
  "Berlin, Germany"
];

// Weather characteristics per city
const WEATHER_DATA_MAP: Record<string, WeatherCondition> = {
  "Tokyo, Japan": { tempCelsius: 22, condition: "Sunny Spots", icon: "sun-cloud", humidity: 60, warning: "Storm alerts warn of localized heavy rain on ground terminals within 2 hours" },
  "Paris, France": { tempCelsius: 16, condition: "Light Overcast Mist", icon: "cloud-mist", humidity: 75 },
  "Berlin, Germany": { tempCelsius: 14, condition: "Wayside Breezy", icon: "wind", humidity: 50 }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"map" | "budget" | "bookings" | "ai" | "vault" | "social">("map");
  const [activeLang, setActiveLang] = useState<SupportedLanguage>("en");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [currentCity, setCurrentCity] = useState("Tokyo, Japan");

  // Core Data Structures
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accommodations, setAccommodations] = useState<DirectBooking[]>([]);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [socialFeed, setSocialFeed] = useState<SocialPost[]>([]);
  const [transitAlerts, setTransitAlerts] = useState<TransitAlert[]>([]);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1.0, JPY: 155, EUR: 0.92, GBP: 0.79, INR: 83.20
  });

  // Biometrics simulation locked states
  const [isBiometricAuthenticated, setIsBiometricAuthenticated] = useState(false);
  const [travelDocuments, setTravelDocuments] = useState<TravelDocument[]>([
    { id: "doc-1", type: "Passport", title: "Global Passport Folder", docNumber: "P-4481023", expiryDate: "2032-10-30", notes: "Carry at all times near border entry gates." },
    { id: "doc-2", type: "Ticket", title: "Shinkansen Express voucher - Tokyo to Kyoto", docNumber: "T-5510-XA", expiryDate: "2026-07-12", notes: "Departing platform 14A." }
  ]);

  // Notifications bell alerts popup drawer state
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(2);
  const [systemLogsList, setSystemLogsList] = useState<string[]>([
    "JR Yamanote express delays updated on your map overlay.",
    "Monsoon storm warning active for Eastern Tokyo. Take trains.",
    "Cloud synchronization completed across alternate traveler devices."
  ]);

  // Loading indicator for cloud syncing
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Load from local storage or cloud services
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch Transit Alerts
      const alertsRes = await fetch("/api/alerts");
      const alertsJson = await alertsRes.json();
      if (alertsJson.success) setTransitAlerts(alertsJson.alerts);

      // 2. Fetch Sync Itineraries
      const itinerariesRes = await fetch("/api/itineraries");
      const itinerariesJson = await itinerariesRes.json();
      if (itinerariesJson.success) setItineraries(itinerariesJson.itineraries);

      // 3. Fetch Expenses registry
      const expensesRes = await fetch("/api/expenses");
      const expensesJson = await expensesRes.json();
      if (expensesJson.success) setExpenses(expensesJson.expenses);

      // 4. Fetch Accommodations
      const bookingsRes = await fetch("/api/bookings");
      const bookingsJson = await bookingsRes.json();
      if (bookingsJson.success) {
        setAccommodations(bookingsJson.accommodations);
        setUserBookings(bookingsJson.userBookings);
      }

      // 5. Fetch Social Feed
      const feedRes = await fetch("/api/social-feed");
      const feedJson = await feedRes.json();
      if (feedJson.success) setSocialFeed(feedJson.feed);

      // 6. Fetch Currency exchange rates
      const curRes = await fetch("/api/currency");
      const curJson = await curRes.json();
      if (curJson.success) setExchangeRates(curJson.rates);

    } catch (err) {
      console.warn("Server connection offline. Loading fallback offline state configurations.");
      // Read fallback data cached in local storage if present
      loadOfflineFallbackCache();
    } finally {
      setIsSyncing(false);
    }
  };

  const loadOfflineFallbackCache = () => {
    const cachedItineraries = localStorage.getItem("cached_offline_itinerary");
    const cachedExpenses = localStorage.getItem("cached_offline_expenses");
    const cachedBookings = localStorage.getItem("cached_offline_bookings");
    const cachedDocs = localStorage.getItem("cached_offline_docs");

    if (cachedItineraries) setItineraries(JSON.parse(cachedItineraries));
    if (cachedExpenses) setExpenses(JSON.parse(cachedExpenses));
    if (cachedBookings) setUserBookings(JSON.parse(cachedBookings));
    if (cachedDocs) setTravelDocuments(JSON.parse(cachedDocs));
  };

  const saveOfflineCache = (updatedItin?: Itinerary[], updatedExp?: Expense[], updatedB?: UserBooking[], updatedD?: TravelDocument[]) => {
    if (updatedItin) localStorage.setItem("cached_offline_itinerary", JSON.stringify(updatedItin));
    if (updatedExp) localStorage.setItem("cached_offline_expenses", JSON.stringify(updatedExp));
    if (updatedB) localStorage.setItem("cached_offline_bookings", JSON.stringify(updatedB));
    if (updatedD) localStorage.setItem("cached_offline_docs", JSON.stringify(updatedD));
  };

  // Helper: sync current details back to express server in real time
  const triggerSyncToCloud = async () => {
    if (isOfflineMode) {
      showToast("Cannot cloud sync in offline mode. Standard database requests are currently blocked.", "error");
      return;
    }
    setIsSyncing(true);
    try {
      // Direct post sequences 
      const activeItin = itineraries.find(i => i.destination.toLowerCase().includes(currentCity.split(",")[0].toLowerCase()));
      if (activeItin) {
        await fetch("/api/itineraries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activeItin)
        });
      }

      // Sync active expenses ledger
      for (const exp of expenses) {
        if (!exp.id.startsWith("exp-booking-")) { // skip direct booking autoexpenses to avoid duplicates
          await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(exp)
          });
        }
      }

      // Re-fetch to realign states
      await fetchInitialData();
      
      const updateMsg = "Cloud sync successful. All local modifications securely backed up on server databases.";
      setSystemLogsList(prev => [updateMsg, ...prev]);
      showToast(updateMsg, "success");

    } catch (error) {
      console.error("Cloud synching failure", error);
      showToast("Unable to complete network syncing. Retained in local offline cache.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle addition of stop over node to map
  const handleAddNewStopToMap = async (stop: ItineraryStop) => {
    const currentCityKey = currentCity.toLowerCase();
    
    // Find active itinerary
    const itineraryIndex = itineraries.findIndex(i => i.destination.toLowerCase().includes(currentCityKey.split(",")[0]));
    
    let updated: Itinerary[];

    if (itineraryIndex !== -1) {
      const active = itineraries[itineraryIndex];
      // Avoid duplicate station entries
      if (active.stops.some(s => s.name === stop.name)) return;
      const updatedStops = [...active.stops, stop];
      const updatedItin = { ...active, stops: updatedStops };
      
      updated = [...itineraries];
      updated[itineraryIndex] = updatedItin;
      setItineraries(updated);
    } else {
      // Create new Itinerary
      const newItin: Itinerary = {
        id: "trip-" + Date.now(),
        title: `Adventure in ${currentCity}`,
        destination: currentCity,
        startDate: "2026-08-01",
        endDate: "2026-08-07",
        stops: [stop],
        savedOffline: true
      };
      updated = [...itineraries, newItin];
      setItineraries(updated);
    }

    saveOfflineCache(updated, undefined, undefined, undefined);

    // If online, post straight to Express server database
    if (!isOfflineMode) {
      try {
        const index = updated.findIndex(i => i.destination.toLowerCase().includes(currentCityKey.split(",")[0]));
        await fetch("/api/itineraries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated[index])
        });
      } catch (err) {
        console.warn("Itinerary backup to cloud deferred. Saved locally.");
      }
    }
  };

  const handleRemoveStopFromItinerary = async (stopId: string) => {
    const currentCityKey = currentCity.toLowerCase();
    const itineraryIndex = itineraries.findIndex(i => i.destination.toLowerCase().includes(currentCityKey.split(",")[0]));
    if (itineraryIndex === -1) return;

    const active = itineraries[itineraryIndex];
    const updatedStops = active.stops.filter(s => s.id !== stopId);
    const updatedItin = { ...active, stops: updatedStops };
    
    const updated = [...itineraries];
    updated[itineraryIndex] = updatedItin;
    setItineraries(updated);
    saveOfflineCache(updated, undefined, undefined, undefined);

    if (!isOfflineMode) {
      try {
        await fetch("/api/itineraries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItin)
        });
      } catch (err) {
        console.warn("Deletion sync deferred.");
      }
    }
  };

  // Expenses CRUD actions
  const handleInsertExpenseLineItem = async (expenseDetails: Omit<Expense, "id" | "convertedAmountUSD">) => {
    // Generate mock object first for immediate user feedback
    const rate = exchangeRates[expenseDetails.currency] || 1.0;
    const usdConverted = parseFloat((expenseDetails.amount / rate).toFixed(2));
    
    const newExp: Expense = {
      ...expenseDetails,
      id: "exp-" + Date.now(),
      convertedAmountUSD: usdConverted
    };

    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveOfflineCache(undefined, updated, undefined, undefined);

    if (!isOfflineMode) {
      try {
        const response = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newExp)
        });
        const resJson = await response.json();
        if (resJson.success) {
          // Re-fetch to synchronize fully
          const freshRes = await fetch("/api/expenses");
          const freshJson = await freshRes.json();
          if (freshJson.success) setExpenses(freshJson.expenses);
        }
      } catch (e) {
        console.warn("Offline fallback caching purchase.");
      }
    }
  };

  const handleDeleteExpenseItem = async (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveOfflineCache(undefined, updated, undefined, undefined);

    if (!isOfflineMode) {
      try {
        await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      } catch (e) {
        console.warn("Deferred delete action.");
      }
    }
  };

  // Accommodation Res Method
  const handleBookNewAccommodation = async (hotelId: string, details: { checkInDate: string; guestName: string; passportNumberSecret?: string; durationDays: number }) => {
    if (isOfflineMode) {
      showToast("Online booking portals require internet access. Switch off Offline mode.", "error");
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId, ...details })
      });
      const resJson = await response.json();
      if (resJson.success) {
        setUserBookings(resJson.userBookings);
        setExpenses(resJson.expenses);
        setSystemLogsList(prev => [`Travel Booking to ${resJson.booking.booking.hotelName} Confirmed! Invoice logged.`, ...prev]);
        saveOfflineCache(undefined, resJson.expenses, resJson.userBookings, undefined);
        showToast(`Travel Booking to ${resJson.booking.booking.hotelName} Confirmed!`, "success");
      }
    } catch (e) {
      console.error(e);
      showToast("Error booking accommodations.", "error");
    }
  };

  const handleCancelAccommodationBooking = async (bookingId: string) => {
    if (isOfflineMode) {
      showToast("Hotel gateway requests are currently offline.", "error");
      return;
    }
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      const resJson = await response.json();
      if (resJson.success) {
        setUserBookings(resJson.userBookings);
        saveOfflineCache(undefined, undefined, resJson.userBookings, undefined);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Social updates publishing API handler
  const handlePublishTravelerFeed = async (post: { author: string; destination: string; itinerarySummary: string; content: string }) => {
    const mockPost: SocialPost = {
      id: "p-" + Date.now(),
      author: post.author,
      destination: post.destination,
      itinerarySummary: post.itinerarySummary,
      content: post.content,
      likes: 0,
      shares: 0,
      timestamp: "Just now"
    };

    setSocialFeed(prev => [mockPost, ...prev]);

    if (!isOfflineMode) {
      try {
        const res = await fetch("/api/social-feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(post)
        });
        const resJson = await res.json();
        if (resJson.success) setSocialFeed(resJson.feed);
      } catch (err) {
        console.warn("Shared post listed in draft cache.");
      }
    }
  };

  // Itinerary Stops Cloning Feature!
  const handleCloneSharedItineraryStops = (destName: string) => {
    const isTokyo = destName.toLowerCase().includes("tokyo");
    const cityFolder = isTokyo ? "Tokyo, Japan" : "Paris, France";
    setCurrentCity(cityFolder);

    const stopsToInsert: ItineraryStop[] = isTokyo ? [
      { id: "c1", name: "Shinjuku Terminal", latitude: 35.6896, longitude: 139.7006, x: 20, y: 35, arrivalTime: "09:00 AM", notes: "Cloned waypoint check" },
      { id: "c2", name: "Meiji Shrine Walkway", latitude: 35.6764, longitude: 139.6993, x: 25, y: 55, arrivalTime: "11:30 AM", notes: "Scenic stroll" },
      { id: "c3", name: "Shibuya Center Crossing", x: 30, y: 75, latitude: 35.658, longitude: 139.701, arrivalTime: "01:00 PM" },
      { id: "c4", name: "Akihabara Electric Town", x: 80, y: 25, latitude: 35.698, longitude: 139.771, arrivalTime: "04:30 PM" }
    ] : [
      { id: "cp1", name: "Louvre Museum", latitude: 48.8606, longitude: 2.3376, x: 45, y: 30, arrivalTime: "10:00 AM", notes: "Louvre Cloned stop" },
      { id: "cp2", name: "Eiffel Tower Pier", latitude: 48.8584, longitude: 2.2945, x: 10, y: 65, arrivalTime: "02:00 PM" }
    ];

    stopsToInsert.forEach(s => handleAddNewStopToMap(s));
    setActiveTab("map");
    showToast(`Successfully cloned all coordinates for the ${destName} itinerary stops to your transit ledger!`, "success");
  };

  // Travel Documents secure actions
  const handleAddPrivateDocument = (doc: Omit<TravelDocument, "id">) => {
    const newDoc = { ...doc, id: "doc-" + Date.now() };
    const updated = [...travelDocuments, newDoc];
    setTravelDocuments(updated);
    saveOfflineCache(undefined, undefined, undefined, updated);
  };

  const handleRemovePrivateDocument = (id: string) => {
    const updated = travelDocuments.filter(d => d.id !== id);
    setTravelDocuments(updated);
    saveOfflineCache(undefined, undefined, undefined, updated);
  };

  // Helper values
  const currentCityStops = itineraries.find(i => 
    currentCity.toLowerCase().includes(i.destination.toLowerCase().split(",")[0])
  )?.stops || [];

  const activeWeather = WEATHER_DATA_MAP[currentCity] || { tempCelsius: 20, condition: "Clean sky", icon: "sun", humidity: 55 };
  const labelsText = TRANSLATIONS[activeLang];

  // Helper trigger to prompt FaceID unlock screen
  const promptBiometricCredentialsScan = async (): Promise<boolean> => {
    setActiveTab("vault");
    showToast("Authenticating via Simulated FaceID scanner... Touch the fingerprint button on the next vault security panel.", "info");
    return false; // must unlock via the components visually 
  };

  // Toggle offline simulator connection state
  const handleToggleOfflineSimulator = (checked: boolean) => {
    setIsOfflineMode(checked);
    if (checked) {
      setSystemLogsList(prev => ["Internet disconnected. Requests querying local storage cache.", ...prev]);
    } else {
      setSystemLogsList(prev => ["Internet link restored. Cloud database sync live.", ...prev]);
      // Auto back-feed sync trigger
      fetchInitialData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-text">
      
      {/* Top Main Navigation Header Banner */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white font-black tracking-widest text-xs flex items-center justify-center animate-bounce">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black tracking-widest text-slate-100 mr-1.5">{labelsText.app_title} PRO</h1>
                <span className="text-[9px] bg-slate-950 font-mono tracking-wide px-2 py-0.5 rounded border border-slate-800 text-slate-400">
                  SYSTEM TIME: 2026-05-24
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                {labelsText.sub_title}
              </p>
            </div>
          </div>

          {/* Quick Real-Time Settings toolbar */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            
            {/* Live syncing status loader */}
            {isSyncing && (
              <span className="text-[10px] text-teal-400 font-mono animate-pulse flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-teal-900">
                <RefreshCw className="w-3 h-3 animate-spin text-teal-400" /> SYNCING...
              </span>
            )}

            {/* Offline simulate togglers */}
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
              {isOfflineMode ? (
                <WifiOff className="w-3.5 h-3.5 text-yellow-500" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-teal-400" />
              )}
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-350 select-none">
                <input
                  type="checkbox"
                  checked={isOfflineMode}
                  onChange={(e) => handleToggleOfflineSimulator(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-850 accent-indigo-500"
                />
                Simulate Offline
              </label>
            </div>

            {/* Language Localizations Dropdowns */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 rounded-lg border border-slate-850">
              <Languages className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={activeLang}
                onChange={(e) => setActiveLang(e.target.value as SupportedLanguage)}
                className="bg-transparent text-[10px] outline-none text-slate-300 font-semibold cursor-pointer"
              >
                <option value="en" className="bg-slate-900 text-slate-300">English (EN)</option>
                <option value="es" className="bg-slate-900 text-slate-300">Español (ES)</option>
                <option value="fr" className="bg-slate-900 text-slate-300">Français (FR)</option>
                <option value="ja" className="bg-slate-900 text-slate-300">日本語 (JA)</option>
                <option value="hi" className="bg-slate-900 text-slate-300">हिन्दी (HI)</option>
              </select>
            </div>

            {/* Notifications Bell overlay */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationsDrawer(!showNotificationsDrawer);
                  setUnreadNotificationCount(0);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 relative"
                title="View flight updates and emergency weather announcements"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full text-[8px] px-1 font-bold animate-ping">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notification bubble alerts overlay dropdown */}
              <AnimatePresence>
                {showNotificationsDrawer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-30"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                      <p className="font-bold text-xs uppercase text-slate-200 tracking-wider">Flight Updates & Local Signals</p>
                      <button 
                        className="text-[9px] text-rose-450 hover:underline" 
                        onClick={() => setSystemLogsList([])}
                      >
                        Clear logs
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-[11px] text-slate-350">
                      
                      {/* Forced Flight Simulator Notification constant */}
                      <div className="bg-indigo-950/30 border border-indigo-900/60 p-2 rounded-lg">
                        <span className="text-[8px] bg-indigo-900 text-indigo-400 font-bold px-1 rounded uppercase mr-1">Air Info</span>
                        <span className="font-semibold text-slate-200">Flight VG-140 to {currentCity.split(",")[0]}:</span> Gate has been reassigned to Terminal 2D, Gate 41B. Safe boarding!
                      </div>

                      {systemLogsList.length === 0 ? (
                        <p className="text-center italic text-slate-500 py-4">No new emergency broadcasts.</p>
                      ) : (
                        systemLogsList.map((log, i) => (
                          <div key={i} className="p-2 bg-slate-950/60 rounded border border-slate-850">
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 space-y-6">

        {/* Global Widget Bar: Weather, Selective Cities dropdown, Active Itinerary Alert */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          
          {/* 1. Target Selector City */}
          <div className="space-y-1 md:border-r md:border-slate-800 md:pr-4">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1 text-[9px]">
              <MapPin className="w-3.5 h-3.5 text-teal-400" /> {labelsText.current_city}
            </span>
            <select
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 font-extrabold text-sm py-2 px-3 rounded-lg focus:outline-none"
            >
              {CITY_OPTIONS.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            <p className="text-[10px] text-slate-500">
              Active map simulator and guides rotate seamlessly.
            </p>
          </div>

          {/* 2. Weather conditions tracker with stormy warners */}
          <div className="space-y-1 md:border-r md:border-slate-800 md:px-4 flex items-start gap-3">
            <div className="bg-slate-950 p-2 rounded-xl text-teal-400 border border-slate-850 self-center">
              {activeWeather.icon === "sun-cloud" ? (
                <CloudSun className="w-7 h-7 text-yellow-400" />
              ) : (
                <CloudRain className="w-7 h-7 text-indigo-400 animate-pulse" />
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono text-[9px]">
                {labelsText.weather_desc}
              </span>
              <p className="text-sm font-extrabold text-slate-100 font-sans mt-0.5">
                {activeWeather.tempCelsius}°C - <span className="text-teal-400">{activeWeather.condition}</span>
              </p>
              <p className="text-[9px] text-slate-500">
                Humidity metrics is {activeWeather.humidity}%. Normal barometric bounds.
              </p>
            </div>
          </div>

          {/* 3. Severe storm or delays broadcast warn tracker */}
          <div className="md:col-span-2 md:pl-4 space-y-1 self-center">
            <div className="flex items-center gap-1.5 text-rose-450">
              <AlertTriangle className="w-4 h-4 text-yellow-500 animate-[bounce_2.5s_infinite]" />
              <span className="text-[9px] font-bold uppercase tracking-widest font-mono text-rose-400">
                {labelsText.warning_title}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans line-clamp-2 mt-1">
              {activeWeather.warning ? activeWeather.warning : "No severe weather disruptions detected for this destination. Primary rails operating normal schedules."}
            </p>
          </div>

        </div>

        {/* Dynamic Nav Tabs Navigation bar section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex flex-wrap gap-1 shadow">
          {[
            { id: "map", label: labelsText.tab_map, icon: Map },
            { id: "budget", label: labelsText.tab_budget, icon: Wallet },
            { id: "bookings", label: labelsText.tab_bookings, icon: Building },
            { id: "ai", label: labelsText.tab_ai, icon: Sparkles },
            { id: "social", label: labelsText.tab_social, icon: Users },
            { id: "vault", label: labelsText.tab_vault, icon: KeyRound }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 ${
                  isTabActive 
                    ? "bg-indigo-600 text-white shadow-lg" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Active view window container */}
        <div className="min-h-[500px] transition-all">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + "_" + currentCity}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
            >
              
              {activeTab === "map" && (
                <div className="space-y-6">
                  {/* Map Simulator block */}
                  <MapSimulator
                    currentIpStopList={currentCityStops}
                    onAddStopToItinerary={handleAddNewStopToMap}
                    onRemoveStop={handleRemoveStopFromItinerary}
                    selectedCity={currentCity}
                    isOfflineMode={isOfflineMode}
                    transitAlerts={transitAlerts}
                  />

                  {/* Manual stops description and coordinate list */}
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-100 font-sans">Itinerary Detail Route Management</h3>
                        <p className="text-[11px] text-slate-40 level mt-0.5">Edit stops, travel notes, or drag alignment maps below.</p>
                      </div>

                      <button
                        onClick={triggerSyncToCloud}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow"
                        title="Synchronize active itinerary stops across saved travel clouds"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Back Up to Traveler Cloud
                      </button>
                    </div>

                    {currentCityStops.length === 0 ? (
                      <div className="p-8 text-center text-xs italic text-slate-500 bg-slate-950 rounded-xl border border-dashed border-slate-800">
                        No transit check-stops created for this trip. Click points directly on the route map above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                        {currentCityStops.map((st, i) => (
                          <div key={st.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="w-5 h-5 rounded-full bg-teal-950 text-teal-400 font-mono font-bold flex items-center justify-center text-[10px]">
                                {i + 1}
                              </span>

                              <button
                                onClick={() => handleRemoveStopFromItinerary(st.id)}
                                className="text-slate-500 hover:text-rose-400 p-0.5 transition"
                                title="Remove waypoint"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div>
                              <p className="font-extrabold text-slate-200 truncate">{st.name}</p>
                              {/* Coordinates display */}
                              <p className="text-[9px] text-slate-500 font-mono mt-0.5">LAT: {st.latitude.toFixed(4)} · LNG: {st.longitude.toFixed(4)}</p>
                            </div>

                            <div className="space-y-1.5">
                              <div>
                                <label className="block text-[8px] uppercase font-bold text-slate-500">Departure Time</label>
                                <input
                                  type="text"
                                  value={st.arrivalTime || ""}
                                  placeholder="e.g. 10:00 AM"
                                  onChange={(e) => {
                                    const nextStops = [...currentCityStops];
                                    nextStops[i].arrivalTime = e.target.value;
                                    const itineraryIndex = itineraries.findIndex(it => it.destination.toLowerCase().includes(currentCity.toLowerCase().split(",")[0]));
                                    if (itineraryIndex !== -1) {
                                      const updated = [...itineraries];
                                      updated[itineraryIndex].stops = nextStops;
                                      setItineraries(updated);
                                      saveOfflineCache(updated, undefined, undefined, undefined);
                                    }
                                  }}
                                  className="w-full bg-slate-900 border border-slate-850 px-2 py-1 rounded text-[10px] text-slate-200 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[8px] uppercase font-bold text-slate-500">Waypoint Memo</label>
                                <input
                                  type="text"
                                  value={st.notes || ""}
                                  placeholder="Buy subway passbook..."
                                  onChange={(e) => {
                                    const nextStops = [...currentCityStops];
                                    nextStops[i].notes = e.target.value;
                                    const itineraryIndex = itineraries.findIndex(it => it.destination.toLowerCase().includes(currentCity.toLowerCase().split(",")[0]));
                                    if (itineraryIndex !== -1) {
                                      const updated = [...itineraries];
                                      updated[itineraryIndex].stops = nextStops;
                                      setItineraries(updated);
                                      saveOfflineCache(updated, undefined, undefined, undefined);
                                    }
                                  }}
                                  className="w-full bg-slate-900 border border-slate-850 px-2 py-1 rounded text-[10px] text-slate-200 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "budget" && (
                <ExpenseTracker
                  expenses={expenses}
                  onAddExpense={handleInsertExpenseLineItem}
                  onDeleteExpense={handleDeleteExpenseItem}
                  exchangeRates={exchangeRates}
                  onForceSync={triggerSyncToCloud}
                  isOfflineMode={isOfflineMode}
                />
              )}

              {activeTab === "bookings" && (
                <BookingPortal
                  accommodations={accommodations}
                  userBookings={userBookings}
                  onBookHotel={handleBookNewAccommodation}
                  onCancelBooking={handleCancelAccommodationBooking}
                  isBiometricAuthenticated={isBiometricAuthenticated}
                  onPromptBiometrics={promptBiometricCredentialsScan}
                />
              )}

              {activeTab === "ai" && (
                <AiAdvisor
                  selectedCity={currentCity}
                  onAddActivityStop={(name, costUSD, timeDesc) => {
                    const mockStop: ItineraryStop = {
                      id: "ai-" + Date.now(),
                      name: name,
                      latitude: 35.68 + (Math.random() / 10),
                      longitude: 139.70 + (Math.random() / 10),
                      x: Math.floor(Math.random() * 50) + 25,
                      y: Math.floor(Math.random() * 50) + 25,
                      arrivalTime: timeDesc,
                      notes: `Curated AI Stop. Cost: $${costUSD} USD`
                    };
                    handleAddNewStopToMap(mockStop);
                    // Add direct corresponding expense automatically to budget ledger!
                    handleInsertExpenseLineItem({
                      title: `Sightseen Activity: ${name}`,
                      amount: costUSD,
                      currency: "USD",
                      category: "Sightseeing",
                      date: new Date().toISOString().split('T')[0],
                      isGroupShared: false,
                      paidBy: "You",
                      splitWith: []
                    });
                    
                    showToast(`"${name}" has been mapped into current ${currentCity} itinerary stops. $${costUSD} expense inserted!`, "success");
                  }}
                  isOfflineMode={isOfflineMode}
                />
              )}

              {activeTab === "social" && (
                <SocialHub
                  feed={socialFeed}
                  onAddPost={handlePublishTravelerFeed}
                  selectedCity={currentCity}
                  onCloneItineraryStops={handleCloneSharedItineraryStops}
                  onShowToast={showToast}
                />
              )}

              {activeTab === "vault" && (
                <BiometricVault
                  documents={travelDocuments}
                  onAddDocument={handleAddPrivateDocument}
                  onRemoveDocument={handleRemovePrivateDocument}
                  isBiometricAuthenticated={isBiometricAuthenticated}
                  onSetBiometricAuth={setIsBiometricAuthenticated}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Persistent footer detailing cloud environment info logs */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-4 text-center text-[10px] text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Voyager Transit Applet. Synchronized with Google AI Studio Platform Core.</p>
          <p className="font-mono text-slate-550 text-slate-400">
            Node Envs: <span className="text-teal-400 text-[9px] bg-slate-950 py-0.5 px-2 rounded">production-bundler</span> · Services Status: <span className="text-emerald-400">ONLINE</span>
          </p>
        </div>
      </footer>

      {/* Premium custom state toasts */}
      <div className="fixed bottom-5 right-5 z-55 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-2xl border text-xs font-sans font-medium flex items-center justify-between pointer-events-auto select-none ${
                toast.type === "success"
                  ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-300"
                  : toast.type === "error"
                  ? "bg-rose-950/90 border-rose-500/60 text-rose-300"
                  : "bg-slate-900/95 border-slate-700/80 text-slate-200"
              }`}
            >
              <span>{toast.message}</span>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="ml-3 hover:text-white transition text-slate-400 font-bold bg-transparent border-0 cursor-pointer pointer-events-auto"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
