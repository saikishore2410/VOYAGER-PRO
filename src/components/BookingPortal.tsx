import React, { useState } from "react";
import { 
  Building, Star, Search, ShieldCheck, CreditCard, Calendar, User, Key, CheckCircle2, 
  Trash2, Compass, Eye, ShieldAlert, ArrowRight, Bookmark, X
} from "lucide-react";
import { DirectBooking, UserBooking } from "../types";

interface BookingPortalProps {
  accommodations: DirectBooking[];
  userBookings: UserBooking[];
  onBookHotel: (hotelId: string, details: { checkInDate: string; guestName: string; passportNumberSecret?: string; durationDays: number }) => Promise<void>;
  onCancelBooking: (bookingId: string) => Promise<void>;
  isBiometricAuthenticated: boolean;
  onPromptBiometrics: () => Promise<boolean>;
}

export default function BookingPortal({
  accommodations,
  userBookings,
  onBookHotel,
  onCancelBooking,
  isBiometricAuthenticated,
  onPromptBiometrics
}: BookingPortalProps) {
  const [searchCity, setSearchCity] = useState("Tokyo");
  const [selectedHotel, setSelectedHotel] = useState<DirectBooking | null>(null);
  
  // Checkout Booking State
  const [checkoutGuestName, setCheckoutGuestName] = useState("");
  const [checkoutCheckIn, setCheckoutCheckIn] = useState("2026-07-10");
  const [checkoutPassport, setCheckoutPassport] = useState("");
  const [checkoutDuration, setCheckoutDuration] = useState(4);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security reveal state
  const [revealedPassportId, setRevealedPassportId] = useState<string | null>(null);

  const filteredHotels = accommodations.filter(h => 
    h.city.toLowerCase().includes(searchCity.toLowerCase())
  );

  const handleOpenCheckout = (hotel: DirectBooking) => {
    setSelectedHotel(hotel);
    setCheckoutSuccess(false);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel || !checkoutGuestName) return;

    setIsSubmitting(true);
    
    // Simulate quick network handshake
    setTimeout(async () => {
      await onBookHotel(selectedHotel.id, {
        checkInDate: checkoutCheckIn,
        guestName: checkoutGuestName,
        passportNumberSecret: checkoutPassport || undefined,
        durationDays: checkoutDuration
      });

      setIsSubmitting(false);
      setCheckoutSuccess(true);
      setCheckoutGuestName("");
      setCheckoutPassport("");
      // Auto close after 2 seconds
      setTimeout(() => {
        setSelectedHotel(null);
        setCheckoutSuccess(false);
      }, 2200);
    }, 1000);
  };

  const revealPassportSecret = async (bookingId: string) => {
    if (!isBiometricAuthenticated) {
      const authorized = await onPromptBiometrics();
      if (!authorized) return;
    }
    setRevealedPassportId(bookingId === revealedPassportId ? null : bookingId);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl" id="direct_accommodation_system">
      {/* Booking Portal header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6 font-sans">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Voyager Accommodations Direct Portal
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Book top-rated, certified hotel deals instantly. Integrates seamless secure payment processing.
          </p>
        </div>

        {/* Quick Destination quick tabs */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {["Tokyo", "Paris", "Berlin"].map((dest) => (
            <button
              key={dest}
              onClick={() => setSearchCity(dest)}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                searchCity.toLowerCase() === dest.toLowerCase()
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {dest} Match
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Area: Hotel Catalogs Grid */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Compass className="w-4 h-4 text-indigo-400" /> Available Lodgings in {searchCity}
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Found {filteredHotels.length} matches</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHotels.length === 0 ? (
              <div className="col-span-2 text-center p-12 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-slate-500 text-sm">
                No properties matching "{searchCity}" currently configured in accommodations dataset.
              </div>
            ) : (
              filteredHotels.map((hotel) => (
                <div 
                  key={hotel.id} 
                  className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col group"
                >
                  {/* Hotel Banner Image */}
                  <div className="relative aspect-[16/9] bg-slate-800 overflow-hidden">
                    <img 
                      src={hotel.imageUrl} 
                      alt={hotel.hotelName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-2.5 right-2.5 bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-indigo-300 flex items-center gap-1 backdrop-blur-sm">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {hotel.rating} / 5
                    </div>
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 text-[9px] px-2 py-0.5 rounded text-white font-sans font-medium uppercase tracking-wide">
                      {hotel.city}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 line-clamp-1">{hotel.hotelName}</h4>
                      <p className="text-xs text-indigo-300 mt-1 font-mono font-semibold">
                        ${hotel.pricePerNightUSD} <span className="text-[10px] text-slate-500 font-normal">/ Night USD</span>
                      </p>

                      {/* Amenities Icons Row */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {hotel.amenities.map((am) => (
                          <span 
                            key={am} 
                            className="bg-slate-900 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-800/80"
                          >
                            {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenCheckout(hotel)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg mt-4 transition-all flex items-center justify-center gap-1 shadow"
                    >
                      Book Room Directly <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Active Bookings ledger info */}
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col h-full min-h-[400px]">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest mb-3 flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="flex items-center gap-1"><Bookmark className="w-4 h-4 text-indigo-400" /> Booking Passbook</span>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 font-mono px-1.5 rounded">{userBookings.length} Active</span>
            </h3>

            <div className="space-y-2 overflow-y-auto max-h-[464px] pr-1">
              {userBookings.length === 0 ? (
                <div className="text-center italic py-20 text-xs text-slate-500">
                  No direct lodging reservations booked yet. Choose a property to buy.
                </div>
              ) : (
                userBookings.map((b) => (
                  <div 
                    key={b.id} 
                    className={`p-3 rounded-lg border text-xs space-y-2 transition ${
                      b.status === "Cancelled" 
                        ? "bg-rose-950/20 border-rose-950/50 opacity-60" 
                        : b.status === "Pending" 
                          ? "bg-slate-900/70 border-amber-900/40" 
                          : "bg-slate-900 border-slate-850"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="truncate">
                        <p className="font-bold text-slate-200 truncate">{b.booking.hotelName}</p>
                        <p className="text-[9px] text-slate-400">{b.booking.city} · {b.booking.roomType}</p>
                      </div>
                      <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 rounded ${
                        b.status === "Confirmed" 
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-900" 
                          : b.status === "Pending" 
                            ? "bg-amber-950 text-amber-500 border border-amber-900" 
                            : "bg-rose-950 text-rose-450"
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-1.5 rounded text-[10px] font-mono text-slate-400">
                      <div>
                        <span className="text-[8px] block text-slate-500">CHECK-IN</span>
                        {b.checkInDate}
                      </div>
                      <div>
                        <span className="text-[8px] block text-slate-500">STAY DURATION</span>
                        {b.booking.durationDays} Nights
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <p className="text-slate-400 truncate max-w-[110px]">
                        Guest: <span className="font-medium text-slate-200">{b.guestName}</span>
                      </p>

                      {/* Decrypting Private Passports */}
                      {b.passportNumberSecret && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => revealPassportSecret(b.id)}
                            className="bg-indigo-950 hover:bg-indigo-900 text-[8px] text-indigo-400 px-1 rounded transition duration-200 border border-indigo-900 flex items-center gap-0.5"
                          >
                            <Eye className="w-2.5 h-2.5" /> 
                            {revealedPassportId === b.id ? b.passportNumberSecret : "Show ID"}
                          </button>
                        </div>
                      )}
                    </div>

                    {b.status === "Confirmed" && (
                      <div className="pt-2 border-t border-slate-900 flex justify-end">
                        <button
                          onClick={() => onCancelBooking(b.id)}
                          className="text-[10px] text-rose-400 hover:text-rose-350 transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Checkout Booking Modal Drawer overlay */}
      {selectedHotel && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[9px] bg-indigo-950/80 text-indigo-400 font-mono font-bold px-2 py-0.5 rounded border border-indigo-800">SECURE DIRECT VOUCHER</span>
                <h3 className="text-base font-bold text-slate-100 font-sans mt-1.5">Direct checkout booking</h3>
              </div>
              <button 
                onClick={() => setSelectedHotel(null)} 
                className="text-slate-500 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-emerald-400">Voucher Reserved Successfully!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Your reservation to <span className="text-slate-200 font-semibold">{selectedHotel.hotelName}</span> has been confirmed. Added to the expense ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                
                {/* Hotel Pricing info summary */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 space-y-1">
                  <p className="font-bold text-slate-200 leading-tight">{selectedHotel.hotelName}</p>
                  <p className="text-[10px] text-slate-400">{selectedHotel.city} · {selectedHotel.roomType}</p>
                  <div className="flex justify-between text-[11px] font-mono text-slate-200 pt-2 border-t border-slate-900 mt-2">
                    <span>${selectedHotel.pricePerNightUSD} x {checkoutDuration} nights</span>
                    <span className="font-bold text-indigo-400">${selectedHotel.pricePerNightUSD * checkoutDuration} USD</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Lead Guest Name (Matching ID)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={checkoutGuestName}
                        onChange={(e) => setCheckoutGuestName(e.target.value)}
                        placeholder="Sarah Connor"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Check-In Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="date"
                          required
                          value={checkoutCheckIn}
                          onChange={(e) => setCheckoutCheckIn(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-9 pr-2.5 text-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Duration Days</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={checkoutDuration}
                        onChange={(e) => setCheckoutDuration(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-slate-300 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] text-slate-400">Passport / Travel Document (For Hotel Sync)</label>
                      <span className="text-[8px] bg-slate-950 px-1 rounded text-emerald-400 font-mono flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Biometrics Shielded
                      </span>
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={checkoutPassport}
                        onChange={(e) => setCheckoutPassport(e.target.value)}
                        placeholder="e.g. Passport P1248035"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1">
                      Passport details will be tightly stored and encrypted, only revealable after biometric verification.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" /> 
                    {isSubmitting ? "authorizing with gateway..." : "Pay & Book Accommodations"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
