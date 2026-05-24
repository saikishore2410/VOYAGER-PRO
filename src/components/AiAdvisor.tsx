import React, { useState } from "react";
import { 
  Sparkles, Bot, AlertCircle, Check, Loader2, ArrowRight, DollarSign, Clock, 
  MapPin, Utensils, Compass, HelpCircle, RefreshCw
} from "lucide-react";
import { GeminiRecommendation } from "../types";

interface AiAdvisorProps {
  selectedCity: string;
  onAddActivityStop: (name: string, costUSD: number, timeDesc: string) => void;
  isOfflineMode: boolean;
}

const INTERESTS_PRESETS = [
  "Traditional Culture", "Museums", "Modern Tech", "Anime & Gaming", 
  "Beaches & Waterfront", "Mountain Hiking", "Coffee Shop Hopping", "Nightlife"
];

const DIETARY_PRESETS = [
  "Vegan", "Gluten-free", "Vegetarian", "Halal", "Kosher", "Peanut-free"
];

export default function AiAdvisor({
  selectedCity,
  onAddActivityStop,
  isOfflineMode
}: AiAdvisorProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Traditional Culture", "Modern Tech"]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(["Gluten-free"]);
  const [budgetTier, setBudgetTier] = useState("Moderate");
  
  // Status hooks
  const [isLoading, setIsLoading] = useState(false);
  const [errorMess, setErrorMess] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<GeminiRecommendation | null>(null);
  const [isCachedMock, setIsCachedMock] = useState(false);

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter(i => i !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  const toggleDietary = (pref: string) => {
    if (selectedDietary.includes(pref)) {
      setSelectedDietary(selectedDietary.filter(d => d !== pref));
    } else {
      setSelectedDietary([...selectedDietary, pref]);
    }
  };

  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    setErrorMess(null);

    try {
      const response = await fetch("/api/gemini/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: selectedCity,
          interests: selectedInterests,
          dietaryPrefs: selectedDietary,
          budgetTier,
          transitMode: "Public Transit / Trains"
        })
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setRecommendation(resData.data);
        setIsCachedMock(!!resData.isMock);
      } else {
        throw new Error(resData.message || "Generic recommendations service error.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMess(err.message || "Failed to reach Voyager AI server. Try checking your internet toggle.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl" id="ai_advisor_panel">
      {/* Top Title Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5 font-sans">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Voyager AI Personalized Co-Pilot
            </h2>
            <p className="text-xs text-slate-400">
              Custom curated regional guides based on your exact digital interest tags.
            </p>
          </div>
        </div>

        <span className="text-[10px] bg-teal-950 text-teal-400 border border-teal-800 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
          <Bot className="w-3.5 h-3.5 text-teal-400" /> GEMINI-3.5-FLASH ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Preference Selection Column */}
        <div className="space-y-4">
          
          {/* Interests presets selector */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest mb-2.5 flex items-center gap-1">
              <Compass className="w-4 h-4 text-teal-400" /> Select Travel Interests
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {INTERESTS_PRESETS.map((tag) => {
                const isSelected = selectedInterests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`text-[10px] py-1 px-2.5 rounded-full transition-all border ${
                      isSelected 
                        ? "bg-teal-950/80 border-teal-500 text-teal-400 font-bold" 
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {isSelected && "✓ "}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary restriction choices */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest mb-2.5 flex items-center gap-1">
              <Utensils className="w-4 h-4 text-emerald-405 text-emerald-450" /> Dietary Considerations
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_PRESETS.map((pref) => {
                const isSelected = selectedDietary.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => toggleDietary(pref)}
                    className={`text-[10px] py-1 px-2.5 rounded-full transition-all border ${
                      isSelected 
                        ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold" 
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {isSelected && "✓ "}
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget option setting */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-300">Target Budget Tier:</span>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-1 rounded"
            >
              <option value="Backpacker Economy">Backpacker Economy</option>
              <option value="Moderate Casual">Moderate Casual</option>
              <option value="Luxury Leisure">Premium Luxury</option>
            </select>
          </div>

          {/* Trigger button */}
          <button
            onClick={handleGenerateRecommendations}
            disabled={isLoading || isOfflineMode && !recommendation}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-800 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-200" />
                Querying Voyager Co-Pilot...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze AI Insights in {selectedCity}
              </>
            )}
          </button>

          {isOfflineMode && (
            <p className="text-[10px] text-center text-slate-500 italic mt-1">
              Caution: Co-Pilot server access requires an active simulated internet state.
            </p>
          )}
        </div>

        {/* Center & Right Column: Generated AI Outputs Display Area */}
        <div className="lg:col-span-2">
          
          {errorMess && (
            <div className="bg-rose-950/40 border border-rose-900 text-rose-350 p-4 rounded-xl text-xs flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{errorMess}</p>
            </div>
          )}

          {!recommendation && !isLoading && (
            <div className="bg-slate-950/50 rounded-xl border border-dashed border-slate-800 p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full min-h-[300px]">
              <Sparkles className="w-10 h-10 text-slate-650 text-slate-700 mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-400">Generate Travel Review Map</p>
              <p className="text-xs max-w-sm mt-1">
                Click the generate button to parse a complete custom guide of culinary targets and optimized activities for <span className="text-slate-300 font-semibold">{selectedCity}</span>.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="bg-slate-950/50 rounded-xl p-12 border border-slate-800 text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[300px] space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
              <p className="text-sm font-semibold font-sans animate-pulse">Consulting Voyager Knowledge Sync...</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Meticulously tailoring transit speeds, finding dishes compatible with {selectedDietary.join(", ") || "open profiles"}, and organizing sightseeing waypoints.
              </p>
            </div>
          )}

          {recommendation && !isLoading && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              
              {/* Co-Pilot text summary block */}
              <div className="bg-teal-950/30 border border-teal-900/60 p-4 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 bg-teal-500/5 blur-3xl rounded-full"></div>
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-1.5 flex items-center gap-1 font-mono">
                  <Bot className="w-4 h-4 text-teal-400" /> Executive Route Analysis
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {recommendation.summary}
                </p>
                {isCachedMock && (
                  <span className="inline-block text-[8px] bg-slate-900/70 text-slate-400 font-mono py-0.5 px-2 rounded-full mt-2.5 border border-slate-800">
                    Offline Fallback Cache Active
                  </span>
                )}
              </div>

              {/* Sub grid for Activities and Culinary Delicacies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Activities Column list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-teal-400" /> Matched Waypoints
                  </h4>
                  {recommendation.activities?.map((act, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-950 p-3 rounded-lg border border-slate-850 hover:border-slate-700 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-bold text-slate-200 text-xs">{act.title}</p>
                          <span className="text-[10px] text-teal-400 font-mono font-bold whitespace-nowrap bg-teal-950/80 px-1 py-0.5 rounded leading-none">
                            ${act.estimatedCostUSD}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                          {act.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-900">
                        <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {act.recommendedTime}
                        </span>
                        
                        <button
                          onClick={() => onAddActivityStop(act.title, act.estimatedCostUSD, act.recommendedTime)}
                          className="text-[10px] text-teal-400 hover:text-white hover:bg-teal-700 transition-all font-semibold py-0.5 px-1.5 rounded bg-teal-950 border border-teal-900"
                        >
                          + Add to Route halts
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Culinary Highlights column list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-emerald-400" /> Culinary Highlights
                  </h4>
                  {recommendation.culinaryHighlights?.map((dish, index) => (
                    <div 
                      key={index} 
                      className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col justify-between h-full min-h-[120px]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-bold text-slate-200 text-xs">{dish.dishName}</p>
                          {dish.dietFriendly && (
                            <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-mono p-0.5 whitespace-nowrap leading-none font-bold uppercase">
                              Safe Choice
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {dish.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-900 text-[10px]">
                        <span className="text-slate-500 block uppercase text-[8px] tracking-wide mb-1 font-semibold">Suggested eateries:</span>
                        <div className="flex flex-wrap gap-1">
                          {dish.suggestedPlaces?.map((pl, i) => (
                            <span key={i} className="bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px] font-medium leading-none">
                              {pl}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
