import React, { useState } from "react";
import { 
  Lock, Unlock, ShieldAlert, FileText, Plus, Eye, EyeOff, KeyRound, 
  Trash2, ShieldCheck, Fingerprint, RefreshCw, Smartphone, Download
} from "lucide-react";
import { TravelDocument } from "../types";

interface BiometricVaultProps {
  documents: TravelDocument[];
  onAddDocument: (doc: Omit<TravelDocument, "id">) => void;
  onRemoveDocument: (docId: string) => void;
  isBiometricAuthenticated: boolean;
  onSetBiometricAuth: (val: boolean) => void;
}

export default function BiometricVault({
  documents,
  onAddDocument,
  onRemoveDocument,
  isBiometricAuthenticated,
  onSetBiometricAuth
}: BiometricVaultProps) {
  const [docType, setDocType] = useState<TravelDocument["type"]>("Passport");
  const [docTitle, setDocTitle] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [docExpiry, setDocExpiry] = useState("2030-12-31");
  const [docNotes, setDocNotes] = useState("");
  
  // Biometric visual overlay states
  const [isScanning, setIsScanning] = useState(false);
  const [scanPercentage, setScanPercentage] = useState(0);
  const [showAddNewForm, setShowAddNewForm] = useState(false);
  const [visibleDocIds, setVisibleDocIds] = useState<string[]>([]);

  const handleSimulateBiometricScan = () => {
    if (isBiometricAuthenticated) {
      // Toggle back to locked status instantly
      onSetBiometricAuth(false);
      setVisibleDocIds([]);
      return;
    }

    setIsScanning(true);
    setScanPercentage(15);

    const interval = setInterval(() => {
      setScanPercentage(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            onSetBiometricAuth(true);
          }, 300);
          return 100;
        }
        return prev + 17;
      });
    }, 120);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docNumber.trim()) return;

    onAddDocument({
      type: docType,
      title: docTitle.trim(),
      docNumber: docNumber.trim(),
      expiryDate: docExpiry,
      notes: docNotes.trim() || undefined
    });

    setDocTitle("");
    setDocNumber("");
    setDocNotes("");
    setShowAddNewForm(false);
  };

  const toggleRevealDocNumber = (id: string) => {
    if (!isBiometricAuthenticated) {
      // Prompt scanning first!
      handleSimulateBiometricScan();
      return;
    }
    if (visibleDocIds.includes(id)) {
      setVisibleDocIds(visibleDocIds.filter(i => i !== id));
    } else {
      setVisibleDocIds([...visibleDocIds, id]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl" id="biometric_vault_system">
      {/* Title block */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-5 font-sans">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              SafePass Vault (Shielded Biometrics)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-trust container storage for sensitive boarding passes and passports.
          </p>
        </div>

        {/* Lock / Unlock biometric state indicator */}
        <button
          onClick={handleSimulateBiometricScan}
          disabled={isScanning}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
            isBiometricAuthenticated 
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-900/10" 
              : "bg-indigo-950 border-indigo-700 text-indigo-300 hover:bg-indigo-900"
          }`}
        >
          {isBiometricAuthenticated ? (
            <>
              <Unlock className="w-3.5 h-3.5" /> VAULT SECURED / ACTIVE
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" /> SECURE LOCK ENGAGED
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Authentic security visual prompt */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center space-y-4">
          
          {isScanning ? (
            <div className="space-y-3 w-full py-4 flex flex-col items-center">
              {/* Spinning scanning node graphic */}
              <div className="relative w-20 h-20 bg-indigo-950/50 rounded-full flex items-center justify-center border border-indigo-500/30 overflow-hidden">
                <Fingerprint className="w-10 h-10 text-indigo-400 animate-pulse" />
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-indigo-500/20 transition-all duration-300"
                  style={{ height: `${scanPercentage}%` }}
                ></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyan-400 animate-[bounce_2s_infinite]"></div>
              </div>
              <p className="text-xs font-mono font-bold text-indigo-300 animate-pulse">
                SCANNERS RE-INDEXING: {scanPercentage}%
              </p>
              <p className="text-[10px] text-slate-500">
                Verifying secure hardware biometric keychains...
              </p>
            </div>
          ) : isBiometricAuthenticated ? (
            <div className="space-y-3 py-6">
              <div className="w-16 h-16 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">Biometric Keychain Clear</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Sensitive documents are fully decrypted and read-enabled. Locks automatically on window close or reload.
                </p>
              </div>
              <button 
                onClick={() => onSetBiometricAuth(false)}
                className="text-[10px] text-rose-400 font-mono underline hover:text-rose-350 transition"
              >
                Manually Lock Vault Immediately
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-3">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-350">Secure Lockout Activated</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click the simulated fingerprint below to perform virtual biometric verification (FaceID / TouchID).
                </p>
              </div>

              {/* Fingerprint Button scanner simulation */}
              <button
                onClick={handleSimulateBiometricScan}
                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white rounded-full flex items-center justify-center border-2 border-indigo-400/40 shadow-lg mx-auto"
                title="Authenticate to decrypt passes"
              >
                <Fingerprint className="w-7 h-7" />
              </button>
              <p className="text-[9px] text-slate-500">Touch to Unlock SafePass</p>
            </div>
          )}

        </div>

        {/* Center & Right areas: Document storage ledger lists */}
        <div className="md:col-span-2 space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <FileText className="w-4 h-4 text-indigo-400" /> Vault Document Ledger
            </h3>

            <button
              onClick={() => setShowAddNewForm(!showAddNewForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1 px-3 rounded-lg flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> 
              {showAddNewForm ? "Dismiss Form" : "Insert Safe Credential"}
            </button>
          </div>

          {showAddNewForm && (
            <form onSubmit={handleSaveDocument} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 animate-in fade-in duration-205">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Credential Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Passport">Passport</option>
                    <option value="Visa">Visa Entry Slip</option>
                    <option value="DriverLicense">International License</option>
                    <option value="Insurance">Travel Insurance Policy</option>
                    <option value="Ticket">Boarding Pass Barcode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Document Label / Name</label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. US Passport Premium, Schengen Entry"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Document ID / Number (Protected)</label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. Z159820-EX"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={docExpiry}
                    onChange={(e) => setDocExpiry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Secure Notes (Optional)</label>
                <input
                  type="text"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="e.g. Emergency support hotline phone numbers"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg transition"
              >
                Safe-Store Encrypted Credential
              </button>
            </form>
          )}

          {/* List layout of sensitive vouchers */}
          <div className="space-y-2">
            {documents.length === 0 ? (
              <div className="text-center italic py-16 bg-slate-950/20 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                No sensitive travel vouchers loaded in hardware keyrings. Clear locks above to insert one.
              </div>
            ) : (
              documents.map((doc) => {
                const isRevealed = visibleDocIds.includes(doc.id);
                return (
                  <div 
                    key={doc.id} 
                    className="bg-slate-950 p-3 rounded-xl border border-slate-850 hover:border-slate-800 transition flex items-start justify-between gap-3"
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {doc.type}
                        </span>
                        <p className="font-bold text-slate-200 text-xs truncate">{doc.title}</p>
                      </div>

                      <div className="mt-2 text-xs font-mono flex items-center gap-2">
                        <span className="text-slate-500 text-[10px]">ID NUMBER:</span>
                        <span className="text-slate-300">
                          {isRevealed && isBiometricAuthenticated
                            ? doc.docNumber 
                            : btoa(doc.docNumber).substring(0, 6).replaceAll(/=/g, "9") + "****** (SHIELDED)"}
                        </span>
                      </div>

                      {doc.notes && (
                        <p className="text-[10px] text-slate-500 italic mt-1.5">
                          Note: {doc.notes}
                        </p>
                      )}

                      <p className="text-[9px] text-slate-500 mt-1">Expiry: {doc.expiryDate}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleRevealDocNumber(doc.id)}
                        className={`p-1 rounded text-slate-500 transition ${
                          isRevealed ? "hover:text-amber-400" : "hover:text-indigo-400"
                        }`}
                        title="Reveal shielded document secrets"
                      >
                        {isRevealed && isBiometricAuthenticated ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => onRemoveDocument(doc.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                        title="Wipe credential from vault storage memory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
