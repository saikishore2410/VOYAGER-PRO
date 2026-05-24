import React, { useState } from "react";
import { 
  Users, Share2, ThumbsUp, Send, Link, Check, QrCode, Copy, Compass, 
  MapPin, Plus, ArrowUpRight, MessageSquare
} from "lucide-react";
import { SocialPost } from "../types";

interface SocialHubProps {
  feed: SocialPost[];
  onAddPost: (post: { author: string; destination: string; itinerarySummary: string; content: string }) => Promise<void>;
  selectedCity: string;
  onCloneItineraryStops: (destination: string) => void;
  onShowToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function SocialHub({
  feed,
  onAddPost,
  selectedCity,
  onCloneItineraryStops,
  onShowToast
}: SocialHubProps) {
  const [authorName, setAuthorName] = useState("");
  const [postContent, setPostContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItineraryCode, setSelectedItineraryCode] = useState("voyager-tokyo-66x9");
  const [wasCopiedCode, setWasCopiedCode] = useState(false);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    await onAddPost({
      author: authorName.trim() || "Independent Voyager",
      destination: selectedCity,
      itinerarySummary: `Active ${selectedCity} route mapping containing custom waypoints.`,
      content: postContent.trim()
    });

    setPostContent("");
    setAuthorName("");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`https://voyage-route.app/itinerary/import?code=${selectedItineraryCode}`);
    setWasCopiedCode(true);
    setTimeout(() => setWasCopiedCode(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl" id="social_sharing_hub">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5 font-sans">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Co-Traveler Hub & Social Shareboard
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Publish live updates, compile vector QR codes, and load shared itineraries seamlessly.
          </p>
        </div>

        {/* QR Code generator */}
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-850">
          <div className="bg-white p-1 rounded-md flex-shrink-0">
            {/* Embedded custom mock mini QR using small canvas vectors */}
            <svg width="34" height="34" viewBox="0 0 29 29" className="text-slate-900">
              <path d="M0,0 h9 v9 h-9 z M2,2 v5 h5 v-5 z" fill="currentColor" />
              <path d="M20,0 h9 v9 h-9 z M22,2 v5 h5 v-5 z" fill="currentColor" />
              <path d="M0,20 h9 v9 h-9 z M2,22 v5 h5 v-5 z" fill="currentColor" />
              <rect x="4" y="4" width="1" height="1" fill="currentColor" />
              <rect x="24" y="4" width="1" height="1" fill="currentColor" />
              <rect x="4" y="24" width="1" height="1" fill="currentColor" />
              <rect x="12" y="12" width="5" height="5" fill="currentColor" />
              <rect x="14" y="14" width="1" height="1" fill="white" />
              <rect x="11" y="2" width="2" height="4" fill="currentColor" />
              <rect x="15" y="22" width="3" height="3" fill="currentColor" />
              <path d="M20,20 h9 v9 h-9 z M22,22 v5 h5 v-5 z" fill="currentColor" />
            </svg>
          </div>
          <div className="text-left select-none">
            <p className="text-[10px] font-bold text-slate-350">SHARE INSTANT ROAD-PASS</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-mono text-indigo-400">{selectedItineraryCode}</span>
              <button 
                onClick={handleCopyCode} 
                className="text-slate-400 hover:text-white transition"
                title="Copy itinerary importer link"
              >
                {wasCopiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Share form update */}
        <div className="space-y-4">
          
          {/* Post custom updates form */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Share2 className="w-4 h-4 text-indigo-400" /> Share Live Trip Update
            </h3>
            <form onSubmit={handleSubmitPost} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Your Name / Handle</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Marcus Aurelius"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Active Destination</label>
                <div className="bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-300 select-none">
                  📍 {selectedCity}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Travel Update Content</label>
                <textarea
                  required
                  rows={3}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Tell buddies about traffic, downloaded maps, food, or delays..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1 shadow"
              >
                <Send className="w-3.5 h-3.5" /> Publish to feed
              </button>
            </form>
          </div>

          {/* Social media direct simulation */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <p className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[10px] tracking-widest">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin" /> Cross-platform Sync
            </p>
            <p className="text-[11px] leading-relaxed">
              Enable auto-posting updates directly to external social feeds (X, Facebook, WhatsApp travel channels) with automatic translation based on active locale configuration.
            </p>
            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => {
                  if (onShowToast) {
                    onShowToast("Successfully simulated itinerary sync to Instagram Stories!", "success");
                  } else {
                    alert("Successfully simulated itinerary sync to Instagram Stories!");
                  }
                }}
                className="flex-1 bg-gradient-to-tr from-yellow-600 via-pink-600 to-indigo-600 hover:scale-[1.02] text-white text-[9px] font-bold py-1 px-2 rounded transition-all pointer-events-auto cursor-pointer"
              >
                Share Story
              </button>
              <button 
                onClick={() => {
                  if (onShowToast) {
                    onShowToast("WhatsApp broadcast code exported along with active waypoint stops!", "success");
                  } else {
                    alert("WhatsApp broadcast code exported along with active waypoint stops!");
                  }
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold py-1 px-2 rounded transition-all pointer-events-auto cursor-pointer"
              >
                Ping WhatsApp Group
              </button>
            </div>
          </div>

        </div>

        {/* Center & Right column: Live social scroll feed */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-400 animate-bounce" /> Live Community Feeds
            </h3>
            <span className="text-slate-500 font-mono">Real-time coordinated</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[464px] pr-1">
            {feed.map((post) => (
              <div 
                key={post.id} 
                className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-800 transition space-y-2.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs">{post.author}</h4>
                    <span className="text-[9px] text-slate-500 font-mono">{post.timestamp}</span>
                  </div>

                  <span className="bg-indigo-950/40 border border-indigo-900/60 text-indigo-400 font-bold text-[9px] px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                    📍 {post.destination}
                  </span>
                </div>

                <p className="text-[11px] text-slate-350 leading-relaxed">
                  {post.content}
                </p>

                {/* Shared Stop attachment info card with cloning triggers! */}
                {post.itinerarySummary && (
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[8px] bg-amber-950/60 text-amber-500 font-mono font-bold px-1.5 rounded uppercase mr-1.5">Shared Route Map</span>
                      <span className="text-[10px] text-slate-400 truncate">{post.itinerarySummary}</span>
                    </div>

                    <button
                      onClick={() => onCloneItineraryStops(post.destination)}
                      className="bg-teal-650 hover:bg-teal-600 border border-teal-850 hover:border-teal-700 text-teal-400 font-bold text-[9px] whitespace-nowrap py-1 px-2 rounded-md transition"
                      title="Clone entire path stops layout to active list"
                    >
                      Clone Route Stops
                    </button>
                  </div>
                )}

                {/* Feedback line actions */}
                <div className="flex gap-4 pt-1 border-t border-slate-900/60 text-[10px] text-slate-400 font-mono">
                  <button className="flex items-center gap-1 hover:text-indigo-400 transition">
                    <ThumbsUp className="w-3 h-3 text-slate-500 hover:text-indigo-400" /> {post.likes} Likes
                  </button>
                  <span>{post.shares} Shares</span>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
