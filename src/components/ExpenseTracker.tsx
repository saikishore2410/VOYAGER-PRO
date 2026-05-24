import React, { useState, useEffect } from "react";
import { 
  DollarSign, PieChart, PlusCircle, RefreshCw, Send, Users, Trash2, 
  ArrowRightLeft, AlertCircle, FileSpreadsheet, Percent, Wallet
} from "lucide-react";
import { Expense } from "../types";

interface ExpenseTrackerProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, "id" | "convertedAmountUSD">) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  exchangeRates: Record<string, number>;
  onForceSync: () => void;
  isOfflineMode: boolean;
}

export default function ExpenseTracker({
  expenses,
  onAddExpense,
  onDeleteExpense,
  exchangeRates,
  onForceSync,
  isOfflineMode
}: ExpenseTrackerProps) {
  const [activeCurrency, setActiveCurrency] = useState("USD");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCurrency, setExpenseCurrency] = useState("USD");
  const [expenseCategory, setExpenseCategory] = useState<Expense["category"]>("Transport");
  const [isGroupShared, setIsGroupShared] = useState(false);
  const [paidBy, setPaidBy] = useState("You");
  const [selectedSplitBuddies, setSelectedSplitBuddies] = useState<string[]>(["Sarah", "Marcus"]);
  
  // Standalone calculator state
  const [calcAmount, setCalcAmount] = useState("");
  const [calcFrom, setCalcFrom] = useState("USD");
  const [calcTo, setCalcTo] = useState("JPY");
  const [calcResult, setCalcResult] = useState<string | null>(null);

  // Group split metrics
  const [groupDebtSummary, setGroupDebtSummary] = useState<{ borrower: string; lender: string; debt: number }[]>([]);

  useEffect(() => {
    // Recount group debts based on splits
    recalculateDebts();
  }, [expenses, exchangeRates]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount || isNaN(Number(expenseAmount))) return;

    await onAddExpense({
      title: expenseTitle.trim(),
      amount: parseFloat(expenseAmount),
      currency: expenseCurrency,
      category: expenseCategory,
      date: new Date().toISOString().split('T')[0],
      isGroupShared,
      paidBy: isGroupShared ? paidBy : "You",
      splitWith: isGroupShared ? selectedSplitBuddies : []
    });

    setExpenseTitle("");
    setExpenseAmount("");
  };

  const calculateConversion = (val: number, from: string, to: string) => {
    const rates = exchangeRates;
    if (!rates[from] || !rates[to]) return val;
    // convert to USD base, then to target
    const usdBase = val / rates[from];
    return usdBase * rates[to];
  };

  const handleCalcConvert = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(calcAmount);
    if (isNaN(parsed) || parsed <= 0) {
      setCalcResult(null);
      return;
    }
    const res = calculateConversion(parsed, calcFrom, calcTo);
    setCalcResult(`${parsed.toLocaleString()} ${calcFrom} = ${res.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${calcTo}`);
  };

  const recalculateDebts = () => {
    const summary: Record<string, number> = {}; // records who owes who. Pos = You are owed, Neg = You owe.
    // Let's model a basic debt solver for three people: "You", "Sarah", "Marcus"
    // Each group shared expense is divided equally between payer + split list
    const names = ["You", "Sarah", "Marcus"];
    const balances: Record<string, number> = { "You": 0, "Sarah": 0, "Marcus": 0 };

    expenses.forEach(exp => {
      if (!exp.isGroupShared) return;
      const totalMembers = 1 + exp.splitWith.length;
      const share = exp.convertedAmountUSD / totalMembers;
      
      names.forEach(n => {
        if (exp.paidBy === n) {
          balances[n] += exp.convertedAmountUSD - share;
        } else if (exp.splitWith.includes(n)) {
          balances[n] -= share;
        }
      });
    });

    // Resolve simple debt flows
    const unresolved: { borrower: string; lender: string; debt: number }[] = [];
    if (balances["You"] < 0 && balances["Sarah"] > 0) {
      const debt = Math.min(Math.abs(balances["You"]), balances["Sarah"]);
      unresolved.push({ borrower: "You", lender: "Sarah", debt: parseFloat(debt.toFixed(2)) });
    }
    if (balances["You"] < 0 && balances["Marcus"] > 0) {
      const debt = Math.min(Math.abs(balances["You"]), balances["Marcus"]);
      unresolved.push({ borrower: "You", lender: "Marcus", debt: parseFloat(debt.toFixed(2)) });
    }
    if (balances["Sarah"] < 0 && balances["You"] > 0) {
      const debt = Math.min(Math.abs(balances["Sarah"]), balances["You"]);
      unresolved.push({ borrower: "Sarah", lender: "You", debt: parseFloat(debt.toFixed(2)) });
    }
    if (balances["Sarah"] < 0 && balances["Marcus"] > 0) {
      const debt = Math.min(Math.abs(balances["Sarah"]), balances["Marcus"]);
      unresolved.push({ borrower: "Sarah", lender: "Marcus", debt: parseFloat(debt.toFixed(2)) });
    }
    if (balances["Marcus"] < 0 && balances["You"] > 0) {
      const debt = Math.min(Math.abs(balances["Marcus"]), balances["You"]);
      unresolved.push({ borrower: "Marcus", lender: "You", debt: parseFloat(debt.toFixed(2)) });
    }
    if (balances["Marcus"] < 0 && balances["Sarah"] > 0) {
      const debt = Math.min(Math.abs(balances["Marcus"]), balances["Sarah"]);
      unresolved.push({ borrower: "Marcus", lender: "Sarah", debt: parseFloat(debt.toFixed(2)) });
    }

    setGroupDebtSummary(unresolved);
  };

  // Aggregated Category Metrics
  const totalUSD = expenses.reduce((prev, curr) => prev + curr.convertedAmountUSD, 0);

  const categoryTotalsUSD = expenses.reduce((prev, curr) => {
    prev[curr.category] = (prev[curr.category] || 0) + curr.convertedAmountUSD;
    return prev;
  }, {} as Record<string, number>);

  const toggleBuddy = (name: string) => {
    if (selectedSplitBuddies.includes(name)) {
      setSelectedSplitBuddies(selectedSplitBuddies.filter(b => b !== name));
    } else {
      setSelectedSplitBuddies([...selectedSplitBuddies, name]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl" id="budget_expense_system">
      {/* Top Ledger stats bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100 font-sans">
              Budget Ledger & Shared Group Expenses
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time split calculations with international currency routing.
          </p>
        </div>

        {/* Currency Display Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono">RENDER TOTALS IN:</span>
          <div className="bg-slate-800 p-1 rounded-lg flex gap-1 border border-slate-700">
            {["USD", "EUR", "JPY", "INR"].map((cur) => (
              <button
                key={cur}
                onClick={() => setActiveCurrency(cur)}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                  activeCurrency === cur 
                    ? "bg-emerald-600 text-white" 
                    : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {cur}
              </button>
            ))}
          </div>
          <button 
            onClick={onForceSync}
            className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs flex items-center justify-center border border-slate-755"
            title="Force synchronization with server cloud storage"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Add Expense & Conversions forms */}
        <div className="space-y-4">
          
          {/* Quick Expense Adder Form */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-400" /> Record Ledger Expense
            </h3>
            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. Metro Ticket, Dinner, Car Fuel"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 p-3 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-650"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">Amount Spent</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Currency</label>
                  <select
                    value={expenseCurrency}
                    onChange={(e) => setExpenseCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-1.5 text-xs text-slate-300 font-mono focus:outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="Transport">Transport</option>
                  <option value="Car Rental">Car Rental</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Food">Food</option>
                  <option value="Sightseeing">Sightseeing</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Group Shared toggle and options */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={isGroupShared}
                    onChange={(e) => setIsGroupShared(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 accent-emerald-500 text-emerald-500"
                  />
                  <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-teal-400" /> Share with Travel Group
                  </span>
                </label>

                {isGroupShared && (
                  <div className="bg-slate-900 p-2.5 rounded-lg space-y-2 mt-1 border border-slate-800/60 transition-all">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Who paid for this?</p>
                      <div className="grid grid-cols-3 gap-1 text-[10px]">
                        {["You", "Sarah", "Marcus"].map(name => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setPaidBy(name)}
                            className={`py-1 px-1.5 rounded transition ${
                              paidBy === name 
                                ? "bg-emerald-950/70 border border-emerald-800 text-emerald-400 font-bold" 
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-1">Split cost with:</p>
                      <div className="flex gap-2 text-[10px]">
                        {["You", "Sarah", "Marcus"].filter(n => n !== paidBy).map(name => {
                          const isSel = selectedSplitBuddies.includes(name);
                          return (
                            <button
                              key={name}
                              type="button"
                              onClick={() => toggleBuddy(name)}
                              className={`flex-1 py-1 px-1.5 rounded transition ${
                                isSel 
                                  ? "bg-teal-950/70 border border-teal-800 text-teal-400 font-bold" 
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg transition-all shadow-md mt-1"
              >
                Insert Expense Ledger File
              </button>
            </form>
          </div>

          {/* Quick Real-Time Currency converter of International payments */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Currency Converter
            </h3>
            <form onSubmit={handleCalcConvert} className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Convert value..."
                  required
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white font-mono focus:outline-none"
                />
                <select
                  value={calcFrom}
                  onChange={(e) => setCalcFrom(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-1 text-[10px] text-slate-300 font-mono"
                >
                  {Object.keys(exchangeRates).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                <span className="text-slate-500 self-center text-xs">to</span>
                <select
                  value={calcTo}
                  onChange={(e) => setCalcTo(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-1 text-[10px] text-slate-300 font-mono"
                >
                  {Object.keys(exchangeRates).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold py-1 px-2 rounded-md transition"
              >
                Perform Conversion
              </button>

              {calcResult && (
                <div className="mt-2 bg-emerald-950/30 border border-emerald-900/50 p-2 rounded text-center text-xs font-mono text-emerald-400">
                  {calcResult}
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Center column: Split Summary and Category metrics Chart */}
        <div className="space-y-4">
          
          {/* General totals card */}
          <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">TOTAL ACCUMULATED LEDGER</p>
              <h3 className="text-3xl font-extrabold text-slate-100 font-mono mt-1">
                {(calculateConversion(totalUSD, "USD", activeCurrency)).toLocaleString(undefined, {
                  style: "currency",
                  currency: activeCurrency,
                  maximumFractionDigits: 0
                })}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Based on <span className="font-mono">{expenses.length}</span> active line items.
              </p>
            </div>
            <div className="p-3.5 bg-emerald-900/20 text-emerald-400 rounded-full border border-emerald-800/40">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>

          {/* Group debt settlement status */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Travel Group Debt Settlings</span>
              <span className="text-[9px] text-emerald-400 bg-emerald-950 border border-emerald-900/60 rounded px-1.5 font-mono">AUTOMATED SPLITTER</span>
            </h3>
            
            {groupDebtSummary.length === 0 ? (
              <div className="bg-slate-900/40 p-4 rounded text-center text-xs text-slate-500 italic">
                All participant logs are fully settle balanced! No outstanding split debts.
              </div>
            ) : (
              <div className="space-y-2">
                {groupDebtSummary.map((debt, index) => (
                  <div 
                    key={index} 
                    className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs transition hover:border-slate-700"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-rose-300">{debt.borrower}</span>
                      <span className="text-slate-400 text-[10px]">owes</span>
                      <span className="font-semibold text-emerald-300">{debt.lender}</span>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <p className="font-bold text-slate-200">
                        {(calculateConversion(debt.debt, "USD", activeCurrency)).toLocaleString(undefined, {
                          style: "currency",
                          currency: activeCurrency,
                          maximumFractionDigits: 1
                        })}
                      </p>
                      <p className="text-[9px] text-slate-500">Base: ${debt.debt} USD</p>
                    </div>
                  </div>
                ))}
                
                <div className="p-2.5 bg-indigo-950/20 border border-indigo-900/50 rounded-lg text-[10px] text-indigo-300 flex items-start gap-1.5 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  We record all split ratios as weighted fractions of the total logged expense item. Settlements refresh in real-time.
                </div>
              </div>
            )}
          </div>

          {/* Visual SVG Category horizontal chart tracker */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Category Distribution Analysis</span>
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
            </h3>

            {totalUSD === 0 ? (
              <div className="text-center text-xs text-slate-500 italic py-6">
                No active metrics to compile. Input expenses to compile chart logs.
              </div>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(categoryTotalsUSD).map(([category, amt]) => {
                  const pct = Math.round((amt / totalUSD) * 100);
                  const convertedVal = calculateConversion(amt, "USD", activeCurrency);
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-300">{category}</span>
                        <span className="font-mono text-slate-400">
                          {convertedVal.toLocaleString(undefined, {
                            style: "currency",
                            currency: activeCurrency,
                            maximumFractionDigits: 0
                          })}{" "}
                          <span className="text-[10px] text-emerald-400">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right column: Interactive Expenses History Board Ledger */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col h-full max-h-[464px] overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Expense Registry Ledger
            </h3>
            {isOfflineMode && (
              <span className="text-[9px] bg-slate-900 px-1 rounded-full text-slate-500">
                LOCAL ONLY
              </span>
            )}
          </div>

          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {expenses.length === 0 ? (
              <div className="text-center italic text-xs text-slate-500 py-20">
                No purchases added yet to this ledger.
              </div>
            ) : (
              expenses.map((exp) => {
                const convertedDisplay = calculateConversion(exp.convertedAmountUSD, "USD", activeCurrency);
                return (
                  <div 
                    key={exp.id} 
                    className="bg-slate-900 p-3 rounded-lg border border-slate-850 hover:border-slate-700 transition flex items-start justify-between gap-2"
                  >
                    <div className="truncate">
                      <p className="font-bold text-slate-200 text-xs truncate" title={exp.title}>{exp.title}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded uppercase font-mono font-bold leading-none">
                          {exp.category}
                        </span>
                        {exp.isGroupShared ? (
                          <span className="text-[9px] bg-teal-950/80 text-teal-400 border border-teal-800 px-1 py-0.5 rounded leading-none flex items-center gap-0.5">
                            <Users className="w-2 h-2" /> Shared
                          </span>
                        ) : (
                          <span className="text-[9px] bg-indigo-950/80 text-indigo-400 border border-indigo-900 px-1 py-0.5 rounded leading-none">
                            Personal
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1 font-mono">
                        Payer: {exp.paidBy || "You"} · {exp.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 select-none">
                      <div className="text-right">
                        <p className="font-bold font-mono text-emerald-400 text-xs leading-none">
                          {convertedDisplay.toLocaleString(undefined, {
                            style: "currency",
                            currency: activeCurrency,
                            maximumFractionDigits: 1
                          })}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">
                          {exp.amount.toLocaleString()} {exp.currency}
                        </p>
                      </div>

                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="text-slate-600 hover:text-rose-400 transition p-1"
                        title="Delete expense line item from registry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
