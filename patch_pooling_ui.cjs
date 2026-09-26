const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/DynamicPoolingView.tsx', 'utf-8');

// Add states for transport matching
code = code.replace(
  /const \[isLoading, setIsLoading\] = useState\(true\);/,
  `const [isLoading, setIsLoading] = useState(true);
  const [matchingPoolId, setMatchingPoolId] = useState<string | null>(null);
  const [transportOptions, setTransportOptions] = useState<any[]>([]);`
);

// Add handlers
code = code.replace(
  /const handleConfirmPool = async \(suggestion: any\) => \{/,
  `const handleFindTransport = async (poolId: string) => {
    setMatchingPoolId(poolId);
    try {
      const options = await api.getTransportOptions(poolId);
      setTransportOptions(options);
    } catch (e: any) {
      alert("Failed to find transport: " + e.message);
    }
  };

  const handleAssignTransport = async (poolId: string, tripId: string) => {
    try {
      await api.assignTransport(poolId, tripId);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setMatchingPoolId(null);
      setTransportOptions([]);
      fetchData();
    } catch (e: any) {
      alert("Failed to assign transport: " + e.message);
    }
  };

  const handleConfirmPool = async (suggestion: any) => {`
);

// Add button to pools list
code = code.replace(
  /<span className="font-bold flex items-center gap-1 text-emerald-400">\s*<ShieldCheck className="w-4 h-4" \/> 100% \{pool\.crop\} Grade A\s*<\/span>\s*<\/div>\s*<\/div>/,
  `<span className="font-bold flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" /> 100% {pool.crop} Grade A
                      </span>
                    </div>
                  </div>
                  {(pool.status === 'ready' || pool.status === 'locked' || pool.status === 'forming') && !pool.tripId && (
                     <button onClick={() => handleFindTransport(pool.id)} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                        <Truck className="w-4 h-4" /> Find Transport Match
                     </button>
                  )}
                  {matchingPoolId === pool.id && (
                    <div className="mt-4 bg-purple-50 p-4 rounded-xl border border-purple-200">
                       <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold text-purple-900">Compatible Transport Options</h4>
                         <button onClick={() => setMatchingPoolId(null)} className="text-purple-700 text-xs hover:underline cursor-pointer">Cancel</button>
                       </div>
                       {transportOptions.length === 0 ? (
                         <div className="text-sm text-purple-700">No options found. Try later.</div>
                       ) : (
                         <div className="space-y-3">
                           {transportOptions.map(opt => (
                             <div key={opt.trip.id} className="bg-white p-3 rounded-lg border border-purple-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                               <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900">{opt.trip.vehicleType}</span>
                                    {opt.isBackhaul && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Backhaul Opportunity</span>}
                                 </div>
                                 <div className="text-xs text-slate-500">{opt.trip.primaryRoute}</div>
                                 <div className="text-xs font-medium text-purple-700 mt-1">Match Score: {opt.matchScore}/100 • Savings: ₹{opt.estimatedSavings}</div>
                               </div>
                               <button onClick={() => handleAssignTransport(pool.id, opt.trip.id)} className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">
                                 Assign Trip
                               </button>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  )}`
);

fs.writeFileSync('frontend/src/components/DynamicPoolingView.tsx', code);
