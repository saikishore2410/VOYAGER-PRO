import React, { useState, useEffect } from "react";
import { 
  Map, Download, AlertTriangle, RefreshCw, Car, Train, Navigation, Plus, MapPin, 
  Layers, CheckCircle, Wifi, WifiOff, Trash2, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ItineraryStop, TransitAlert } from "../types";

interface MapSimulatorProps {
  currentIpStopList: ItineraryStop[];
  onAddStopToItinerary: (stop: ItineraryStop) => void;
  onRemoveStop: (stopId: string) => void;
  selectedCity: string;
  isOfflineMode: boolean;
  transitAlerts: TransitAlert[];
}

// Preset transit nodes for Tokyo & Paris to populate the map simulator
const PRES_NODES_TOKYO = [
  { id: "node-1", name: "Shinjuku Terminal", x: 20, y: 35, line: "Yamanote Line", status: "Delays" },
  { id: "node-2", name: "Meiji Shrine Walkway", x: 25, y: 55, line: "Chiyoda Line", status: "Clear" },
  { id: "node-3", name: "Shibuya Center Crossing", x: 30, y: 75, line: "Yamanote Line", status: "Severe Jam" },
  { id: "node-4", name: "Roppongi Hills Lounge", x: 48, y: 70, line: "Oedo Line", status: "Clear" },
  { id: "node-5", name: "Tokyo Station Hub", x: 75, y: 45, line: "Shinkansen Main", status: "Clear" },
  { id: "node-6", name: "Akihabara Electric Town", x: 80, y: 25, line: "Chuo Line", status: "Clear" },
  { id: "node-7", name: "Asakusa Temple Lane", x: 90, y: 15, line: "Asakusa Line", status: "Clear" }
];

const PRES_NODES_PARIS = [
  { id: "node-p1", name: "Eiffel Tower Pier", x: 10, y: 65, line: "RER C Line", status: "Clear" },
  { id: "node-p2", name: "Arc de Triomphe", x: 15, y: 30, line: "Metro Line 1", status: "Clear" },
  { id: "node-p3", name: "Jardin des Tuileries", x: 35, y: 40, line: "Metro Line 1", status: "Clear" },
  { id: "node-p4", name: "Louvre Museum", x: 45, y: 30, line: "Metro Line 7", status: "Construction" },
  { id: "node-p5", name: "Notre-Dame Cathedral", x: 65, y: 55, line: "Metro Line 4", status: "Clear" },
  { id: "node-p6", name: "Gare du Nord Hub", x: 70, y: 15, line: "RER B Line", status: "Clear" }
];

export default function MapSimulator({
  currentIpStopList,
  onAddStopToItinerary,
  onRemoveStop,
  selectedCity,
  isOfflineMode,
  transitAlerts
}: MapSimulatorProps) {
  const [selectedMode, setSelectedMode] = useState<"transit" | "car">("transit");
  const [showTrafficOverlay, setShowTrafficOverlay] = useState(true);
  const [showTransitLines, setShowTransitLines] = useState(true);
  const [downloadedCities, setDownloadedCities] = useState<string[]>([]);
  
  // Custom custom input stop builder
  const [customStopName, setCustomStopName] = useState("");
  const [customStopX, setCustomStopX] = useState(50);
  const [customStopY, setCustomStopY] = useState(50);
  
  // Simulated GPS trackers
  const [gpsLocation, setGpsLocation] = useState({ x: 30, y: 45 });
  const [routingPoints, setRoutingPoints] = useState<typeof PRES_NODES_TOKYO>([]);
  const [routeMessage, setRouteMessage] = useState("");

  const activeNodes = selectedCity.toLowerCase().includes("tokyo") ? PRES_NODES_TOKYO : PRES_NODES_PARIS;

  useEffect(() => {
    // Load previously downloaded map segments
    const loaded = localStorage.getItem("saved_offline_maps");
    if (loaded) {
      setDownloadedCities(JSON.parse(loaded));
    }
  }, []);

  const handleDownloadMap = () => {
    const cityKey = selectedCity.trim().toLowerCase();
    if (downloadedCities.includes(cityKey)) return;
    const update = [...downloadedCities, cityKey];
    setDownloadedCities(update);
    localStorage.setItem("saved_offline_maps", JSON.stringify(update));
  };

  const handleCreateCustomStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStopName.trim()) return;

    const stopId = "custom-" + Date.now();
    const newStop: ItineraryStop = {
      id: stopId,
      name: customStopName.trim(),
      latitude: 35.6 + (customStopY / 1000), // Mock coordinates
      longitude: 139.7 + (customStopX / 1000),
      x: Math.round(customStopX),
      y: Math.round(customStopY),
      arrivalTime: "12:00 PM",
      notes: "Custom manual checkpoint"
    };

    onAddStopToItinerary(newStop);
    setCustomStopName("");
    // Give feedback coordinates slightly off
    setCustomStopX(Math.floor(Math.random() * 60) + 20);
    setCustomStopY(Math.floor(Math.random() * 60) + 20);
  };

  const isCurrentMapDownloaded = downloadedCities.includes(selectedCity.trim().toLowerCase());
  const canNavigateOnMap = !isOfflineMode || isCurrentMapDownloaded;

  const calculateQuickestRoute = () => {
    if (activeNodes.length < 2) return;
    // Set mock routing sequence
    const sorted = [...activeNodes].sort((a, b) => a.x - b.x);
    setRoutingPoints(sorted);
    const modeName = selectedMode === "transit" ? "Tokyo Metro FastTrack" : "Premium Rental GPS Lane";
    const travelTime = selectedMode === "transit" ? "18 mins" : "24 mins (due to high Metropolitan jams)";
    setRouteMessage(`Routed via ${modeName}. Estimated duration: ${travelTime}. Free of direct tolls.`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden" id="navigation_map_portal">
      {/* Offline Mask Alert */}
      {!canNavigateOnMap && (
        <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
          <WifiOff className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold font-sans text-rose-400">Offline Connection Lost</h3>
          <p className="text-slate-400 max-w-sm mt-2 text-sm">
            This region map is not cached locally. Enable online connectivity or switch to a previously downloaded offline area.
          </p>
          <div className="mt-4 flex gap-3">
            <button 
              onClick={handleDownloadMap} 
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Force Fetch Offline Support
            </button>
          </div>
        </div>
      )}

      {/* Map Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Map className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-slate-100 font-sans">
              Smart Transit & GPS Route Compass
            </h2>
            {isOfflineMode && (
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono py-0.5 px-2 rounded-full flex items-center gap-1">
                <WifiOff className="w-2.5 h-2.5" /> OFFLINE CACHE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Active view: <span className="text-slate-200 underline font-medium">{selectedCity}</span>. Multi-transit live path analysis.
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedMode("transit")}
            className={`p-2 rounded-lg flex items-center gap-1 text-xs transition-all ${
              selectedMode === "transit" 
                ? "bg-teal-600 text-white font-medium shadow" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="Switch to Public Transit optimized route"
          >
            <Train className="w-4 h-4" /> Subway/Metro
          </button>
          <button
            onClick={() => setSelectedMode("car")}
            className={`p-2 rounded-lg flex items-center gap-1 text-xs transition-all ${
              selectedMode === "car" 
                ? "bg-amber-600 text-white font-medium shadow" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
            title="Switch to Car Rental routes"
          >
            <Car className="w-4 h-4" /> Car Hire
          </button>
          <button
            onClick={handleDownloadMap}
            className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all border ${
              isCurrentMapDownloaded 
                ? "bg-emerald-950/50 border-emerald-800 text-emerald-400" 
                : "bg-teal-600/10 border-teal-500/30 text-teal-400 hover:bg-teal-600/30"
            }`}
          >
            {isCurrentMapDownloaded ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" /> Offline Saved
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 animate-pulse" /> Download Offline Map
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mapped Canvas Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* SVG Map Canvas */}
          <div className="relative aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
            {/* Custom Grid lines on Map */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4%_6.5%] opacity-20 pointer-events-none"></div>

            <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
              {/* Optional Transit Connections */}
              {showTransitLines && (
                <>
                  <path 
                    d="M 20,35 L 25,55 L 30,75 L 48,70 L 75,45 L 80,25 L 90,15" 
                    fill="none" 
                    stroke={selectedMode === "transit" ? "#2dd4bf" : "#eab308"} 
                    strokeWidth={selectedMode === "transit" ? "1.5" : "0.8"}
                    strokeDasharray={selectedMode === "car" ? "2,2" : "0"}
                    className="transition-all duration-300"
                  />
                  {/* Outer Loop Line */}
                  <path 
                    d="M 20,35 Q 40,20 80,25 Q 90,60 75,45 Q 60,80 30,75 Z" 
                    fill="none" 
                    stroke="#475569" 
                    strokeWidth="0.5" 
                    strokeDasharray="4,4"
                  />
                </>
              )}

              {/* Draw Custom Routing Lane overlay */}
              {routingPoints.length > 0 && (
                <path
                  d={`M ${routingPoints.map(p => `${p.x},${p.y}`).join(" L ")}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-[dash_5s_linear_infinite]"
                  style={{ strokeDasharray: "4,2" }}
                />
              )}

              {/* Draw lines from current user active Itinerary stops */}
              {currentIpStopList.map((stop, index) => {
                const next = currentIpStopList[index + 1];
                if (!next) return null;
                return (
                  <line
                    key={index}
                    x1={stop.x}
                    y1={stop.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="#fbbf24"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Active station markers */}
              {activeNodes.map((node) => {
                const isSelectedStop = currentIpStopList.some(s => s.name === node.name);
                const hasTrafficAlert = node.status !== "Clear";
                
                return (
                  <g key={node.id} className="cursor-pointer group">
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelectedStop ? 3.5 : 2.2}
                      className={`transition-all duration-300 ${
                        hasTrafficAlert && showTrafficOverlay
                          ? "fill-rose-500 animate-pulse stroke-red-200 stroke-1" 
                          : isSelectedStop 
                            ? "fill-amber-400 stroke-slate-900 stroke-1"
                            : "fill-slate-600 hover:fill-teal-400"
                      }`}
                    />
                    {hasTrafficAlert && showTrafficOverlay && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="5"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="0.4"
                        className="animate-ping"
                      />
                    )}
                  </g>
                );
              })}

              {/* GPS Tracker indicator node */}
              <circle cx={gpsLocation.x} cy={gpsLocation.y} r="2" fill="#3b82f6" />
              <circle cx={gpsLocation.x} cy={gpsLocation.y} r="4.5" fill="none" stroke="#2563eb" strokeWidth="0.5" className="animate-ping" />
            </svg>

            {/* In-Map Controls & Legend Floating Panel */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[10px] space-y-1 backdrop-blur select-none max-w-[170px]">
              <div className="font-bold text-slate-200 mb-1 flex items-center gap-1 font-mono">
                <Layers className="w-3 h-3 text-teal-400" /> MAP KEY & OVERLAYS
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input 
                  type="checkbox" 
                  checked={showTrafficOverlay} 
                  onChange={(e) => setShowTrafficOverlay(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 accent-teal-500 text-teal-500" 
                />
                Traffic Alerts (Red Zone)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input 
                  type="checkbox" 
                  checked={showTransitLines} 
                  onChange={(e) => setShowTransitLines(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 accent-teal-500 text-teal-500" 
                />
                Primary Lines Overlay
              </label>
              <div className="pt-1.5 border-t border-slate-800 mt-1 flex flex-wrap gap-1.5 text-slate-400">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>Jam</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>Stop</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>GPS</span>
              </div>
            </div>

            {/* GPS Telemetry */}
            <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded text-[9px] font-mono text-slate-400 flex items-center gap-1">
              <Navigation className="w-2.5 h-2.5 text-blue-400 animate-spin" /> GPS SYNCED: XP: {gpsLocation.x}% YP: {gpsLocation.y}%
            </div>
          </div>

          {/* Quick Routing Action Controls */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-200 font-sans">
                Quickest Route Optimizer
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculate live transit schedules skipping jams instantly.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={calculateQuickestRoute}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refactor Shortest Route
              </button>
            </div>
          </div>

          {/* Route Output Response message banner */}
          <AnimatePresence>
            {routeMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-teal-950/40 border border-teal-800/60 p-4 rounded-xl text-teal-300 text-xs flex items-start gap-2.5"
              >
                <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-teal-200 uppercase tracking-wide mr-1.5 text-[10px] bg-teal-900 border border-teal-700 rounded px-1">Route Calculated</span>
                  {routeMessage}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Node Management & Stops Creator */}
        <div className="space-y-4">
          {/* Quick interactive stops list */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Choose Map Nodes to Add
            </h3>
            <div className="space-y-2 max-h-[178px] overflow-y-auto pr-1">
              {activeNodes.map((node) => {
                const isSelected = currentIpStopList.some(s => s.name === node.name);
                return (
                  <div 
                    key={node.id} 
                    className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg flex items-center justify-between text-xs hover:border-slate-700 transition"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{node.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <span className="font-mono text-[9px] bg-slate-800 px-1 py-0.5 rounded leading-none">{node.line}</span>
                        {node.status !== "Clear" && (
                          <span className="text-red-400 flex items-center gap-0.5 font-sans font-medium">
                            <AlertTriangle className="w-2.5 h-2.5" /> {node.status} Alert
                          </span>
                        )}
                      </p>
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] font-medium text-amber-400 bg-amber-950/40 border border-amber-900/60 rounded px-1.5 py-0.5 flex items-center gap-1">
                        Added to Stops
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          const newStop: ItineraryStop = {
                            id: "station-" + node.id,
                            name: node.name,
                            latitude: 35.6 + (node.y / 1000),
                            longitude: 139.7 + (node.x / 1000),
                            x: node.x,
                            y: node.y,
                            arrivalTime: "10:00 AM",
                            notes: "Stopover node route element."
                          };
                          onAddStopToItinerary(newStop);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white p-1 rounded transition"
                        title="Add node to current itinerary list"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick custom spot plotter */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-teal-400" /> Manual Custom Spot Plotter
            </h3>
            <form onSubmit={handleCreateCustomStop} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Spot / Landmark Name</label>
                <input
                  type="text"
                  value={customStopName}
                  onChange={(e) => setCustomStopName(e.target.value)}
                  placeholder="e.g. Park Bench, Cafe, Hideout"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Map X Coordinate (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={customStopX}
                    onChange={(e) => setCustomStopX(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Map Y Coordinate (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={customStopY}
                    onChange={(e) => setCustomStopY(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 rounded-lg transition"
              >
                Add Custom Node to Map
              </button>
            </form>
          </div>

          {/* Current Active stops route card */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Active Waypoints ({currentIpStopList.length})</span>
              {currentIpStopList.length > 1 && (
                <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5">
                  Connected path <ArrowRight className="w-2.5 h-2.5" />
                </span>
              )}
            </h3>
            {currentIpStopList.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-2">
                No active stops in this itinerary segment. Click "+" on stations above to construct yours.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {currentIpStopList.map((stop, ix) => (
                  <div key={stop.id} className="bg-slate-900/90 py-1.5 px-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-400 text-[10px] font-bold flex items-center justify-center font-mono">
                        {ix + 1}
                      </span>
                      <div className="truncate max-w-[130px]">
                        <p className="font-semibold text-slate-200 truncate">{stop.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">Arrive: {stop.arrivalTime || "TBD"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveStop(stop.id)}
                      className="text-slate-500 hover:text-rose-400 transition p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
