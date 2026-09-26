import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, DollarSign, Wallet, RefreshCw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const EscrowSettlementView: React.FC = () => {
  const [isSettled, setIsSettled] = useState(false);
  const [settling, setSettling] = useState(false);

  const handleReleaseEscrow = () => {
    setSettling(true);
    setTimeout(() => {
      setSettling(false);
      setIsSettled(true);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}
    }, 1200);
  };

  const handleReset = () => {
    setIsSettled(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Escrow Architecture Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PROGRAMMABLE SMART ESCROW & UPI DISBURSEMENTS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Transparent Digital Settlement Engine
        </h1>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          Traditional mandi payouts take 7 to 45 days through arthiya credit books, leaving farmers trapped in working capital debt. AgriChain pre-funds buyer payments into digital escrow and splits disbursements instantly upon cryptographic delivery verification.
        </p>
      </div>

      {/* Flagship Escrow Vault Box */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> ESCROW VAULT #ESC-MP-2026-9041
              </span>
              <span className="text-xs text-slate-400 font-mono">Consignment #AC-POOL-1024</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display mt-2">
              Buyer Deposit: Shreemaya Hotel & Restaurants
            </h2>
            <p className="text-xs text-slate-400">
              510 kg Grade A Tomatoes &bull; Gross Contract Landed Rate: ₹18.00 / kg
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-right shrink-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Vault Capital</div>
            <div className="text-3xl font-black text-emerald-400 font-display mt-0.5">₹9,180.00</div>
            <div className="text-xs text-slate-300 mt-0.5">
              Status: {isSettled ? <strong className="text-emerald-400">Disbursed via NPCI/UPI</strong> : 'Locked in Escrow'}
            </div>
          </div>
        </div>

        {/* Itemized Split Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Automated Smart Contract Distribution Splits</span>
            <span>Split Amount</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {/* Ramesh Patel */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Ramesh Patel (Smallholder Farmer)</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-sans font-bold">
                    Primary Producer
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  100 kg Tomatoes @ ₹14.20/kg FNV &bull; VPA: ramesh.patel@upi
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-emerald-400 font-display">₹1,420.00</span>
                <div className="text-[10px] text-slate-400">
                  {isSettled ? '✓ UTR: 629104829103' : 'Pending OTP verification'}
                </div>
              </div>
            </div>

            {/* Other 4 Farmers Pooled */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Remaining 4 Pool Farmers (Suresh, Kailash, Anita, Dinesh)</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-sans font-bold">
                    Virtual Consignment
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  410 kg Tomatoes @ ₹14.20/kg FNV &bull; Direct Bank IMPS/Aadhaar Bridge
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-emerald-400 font-display">₹5,822.00</span>
                <div className="text-[10px] text-slate-400">
                  {isSettled ? '✓ Batch UTR Disbursed' : 'Escrow Protected'}
                </div>
              </div>
            </div>

            {/* Jagdish Yadav Transporter */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Jagdish Yadav (Transporter)</span>
                  <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-sans font-bold">
                    Logistics Partner
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Tata Ace MP-09-AB-4210 Backhaul fee &bull; VPA: jagdish.yadav@paytm
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-indigo-400 font-display">₹816.00</span>
                <div className="text-[10px] text-slate-400">
                  {isSettled ? '✓ Toll & Fuel Credit Released' : 'Held till geo-fence entry'}
                </div>
              </div>
            </div>

            {/* Sharma Krishi Aggregator */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Sharma Krishi Seva (Aggregator)</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded font-sans font-bold">
                    Verified Service
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Aggregation & Crating service fee @ ₹1.00/kg &bull; VPA: sharmakrishi@okhdfcbank
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-amber-400 font-display">₹510.00</span>
                <div className="text-[10px] text-slate-400">
                  {isSettled ? '✓ Service Fee Paid' : 'Audited Service'}
                </div>
              </div>
            </div>

            {/* Platform & Quality Buffer */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">AgriChain Platform & Escrow Buffer</span>
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] px-2 py-0.5 rounded font-sans font-bold">
                    Fixed Protocol Fee
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                  AI Optical Certification + Settlement Gateway (₹0.10 + ₹1.10 buffer)
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-purple-400 font-display">₹612.00</span>
                <div className="text-[10px] text-slate-400">
                  {isSettled ? '✓ Zero Hidden Arbitrage' : 'Audit Logged'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            {isSettled ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> All payments settled in 2.3 seconds with zero human delay.
              </span>
            ) : (
              <span>Simulate buyer entering OTP upon physical inspection at Indore central kitchen.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isSettled && (
              <button
                onClick={handleReset}
                className="text-slate-400 hover:text-white text-xs font-semibold px-3 py-2 cursor-pointer"
              >
                Reset Demo
              </button>
            )}

            <button
              id="btn-release-escrow"
              onClick={handleReleaseEscrow}
              disabled={isSettled || settling}
              className={`font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50 ${
                isSettled
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{settling ? 'Executing UPI Rail...' : isSettled ? 'Escrow Released ✓' : 'Simulate Delivery & Release Escrow'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
