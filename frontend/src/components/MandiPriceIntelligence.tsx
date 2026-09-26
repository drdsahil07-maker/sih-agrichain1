import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  Search, 
  MapPin, 
  Building2,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Tag,
  Store,
  Layers,
  CheckCircle2,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { authService } from '../auth/authService';

export interface MandiPriceRecord {
  commodity: string;
  variety: string;
  state: string;
  district: string;
  market: string;
  min_price: number | string;
  max_price: number | string;
  modal_price: number | string;
  min_price_per_kg?: number;
  max_price_per_kg?: number;
  modal_price_per_kg?: number;
  arrival_date?: string;
}

interface MandiPriceIntelligenceProps {
  initialCommodity?: string;
  initialState?: string;
  initialDistrict?: string;
  initialMarket?: string;
  onPriceSelect?: (record: MandiPriceRecord) => void;
  compact?: boolean;
}

export const MandiPriceIntelligence: React.FC<MandiPriceIntelligenceProps> = ({
  initialCommodity,
  initialState,
  initialDistrict,
  initialMarket,
  onPriceSelect,
  compact = false
}) => {
  // Location Cascading State
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);

  // Selected Filters
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');

  // Data & Status State
  const [records, setRecords] = useState<MandiPriceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [source, setSource] = useState<string>('Government of India Agmarknet');
  const [totalCount, setTotalCount] = useState<number>(0);

  // Parse default locations from user profile
  const resolveProfileLocation = useCallback(() => {
    const user = authService.getCurrentUser();
    const profile = authService.getCombinedProfile();

    let defState = initialState || '';
    let defDistrict = initialDistrict || '';
    let defMarket = initialMarket || '';
    let defCrop = initialCommodity || '';

    // Check user details
    if (user?.details) {
      if (user.details.state && !defState) defState = user.details.state;
      if (user.details.district && !defDistrict) defDistrict = user.details.district;
      if (user.details.city && !defDistrict) defDistrict = user.details.city;
      if (user.details.village && !defMarket) defMarket = user.details.village;
      if (Array.isArray(user.details.crops) && user.details.crops.length > 0 && !defCrop) {
        const cropStr = user.details.crops[0];
        defCrop = cropStr.split('(')[0].trim();
      }
    }

    // Check profile
    if (profile?.farmer) {
      if (profile.farmer.state && !defState) defState = profile.farmer.state;
      if (profile.farmer.district && !defDistrict) defDistrict = profile.farmer.district;
      if (profile.farmer.village && !defMarket) defMarket = profile.farmer.village;
      if (Array.isArray(profile.farmer.crops) && profile.farmer.crops.length > 0 && !defCrop) {
        defCrop = profile.farmer.crops[0].split('(')[0].trim();
      }
    }

    // Parse location string if state/district still empty
    if ((!defState || !defDistrict) && user?.location) {
      const parts = user.location.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        if (!defState) defState = parts[parts.length - 1];
        if (!defDistrict) defDistrict = parts[parts.length - 2];
      } else if (parts.length === 1) {
        if (!defDistrict) defDistrict = parts[0];
      }
    }

    // If still empty, default fallback
    if (!defState) defState = 'Madhya Pradesh';
    if (!defCrop) defCrop = 'Tomato';

    return { defState, defDistrict, defMarket, defCrop };
  }, [initialCommodity, initialState, initialDistrict, initialMarket]);

  // Load Mandi Prices for current selections
  const executeSearch = async (
    overrideState?: string,
    overrideDistrict?: string,
    overrideMarket?: string,
    overrideCommodity?: string
  ) => {
    const sState = overrideState !== undefined ? overrideState : selectedState;
    const sDistrict = overrideDistrict !== undefined ? overrideDistrict : selectedDistrict;
    const sMarket = overrideMarket !== undefined ? overrideMarket : selectedMarket;
    const sCommodity = overrideCommodity !== undefined ? overrideCommodity : selectedCommodity;

    if (!sState) {
      setErrorMessage('Please select a State to fetch Mandi price records.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.getMandiPrices({
        state: sState || undefined,
        district: sDistrict || undefined,
        market: sMarket || undefined,
        commodity: sCommodity || undefined,
      });

      setAvailable(res.available);
      if (res.records && res.records.length > 0) {
        setRecords(res.records);
        setTotalCount(res.count || res.records.length);
        setLastUpdated(res.lastUpdated || new Date().toLocaleTimeString('en-IN'));
        if (res.source) setSource(res.source);
      } else {
        setRecords([]);
        setTotalCount(0);
      }

      if (!res.available) {
        setErrorMessage(res.message || 'Live government mandi feed currently unavailable. Displaying verified cached APMC benchmarks.');
      }
    } catch (err: any) {
      console.error('[MandiPriceIntelligence] Fetch failed:', err);
      setAvailable(false);
      setErrorMessage('Government mandi feed unavailable: connection error. Displaying cached benchmark data.');
    } finally {
      setLoading(false);
    }
  };

  // Initial Load: bootstrap directory & pre-populate from profile
  useEffect(() => {
    let isMounted = true;

    async function initLocations() {
      setLoadingLocations(true);
      try {
        const { defState, defDistrict, defMarket, defCrop } = resolveProfileLocation();
        
        // Fetch all states and initial cascading info
        const locRes = await api.getMandiLocations({ state: defState, district: defDistrict });
        
        if (isMounted && locRes.success) {
          setStates(locRes.states || []);
          setDistricts(locRes.districts || []);
          setMarkets(locRes.markets || []);
          setCommodities(locRes.commodities || []);

          setSelectedState(defState);
          setSelectedDistrict(defDistrict);
          setSelectedMarket(defMarket);
          setSelectedCommodity(defCrop);

          // Trigger initial price fetch
          executeSearch(defState, defDistrict, defMarket, defCrop);
        }
      } catch (err) {
        console.error('Error initializing Mandi locations:', err);
      } finally {
        if (isMounted) setLoadingLocations(false);
      }
    }

    initLocations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle State Change: Cascading Reset
  const handleStateChange = async (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict('');
    setSelectedMarket('');
    setDistricts([]);
    setMarkets([]);

    if (newState) {
      try {
        const locRes = await api.getMandiLocations({ state: newState });
        if (locRes.success) {
          setDistricts(locRes.districts || []);
          setMarkets(locRes.markets || []);
        }
      } catch (e) {
        console.warn('Error fetching districts for state:', newState, e);
      }
    }
  };

  // Handle District Change: Cascading Reset
  const handleDistrictChange = async (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setSelectedMarket('');
    setMarkets([]);

    if (selectedState && newDistrict) {
      try {
        const locRes = await api.getMandiLocations({ state: selectedState, district: newDistrict });
        if (locRes.success) {
          setMarkets(locRes.markets || []);
        }
      } catch (e) {
        console.warn('Error fetching markets for district:', newDistrict, e);
      }
    }
  };

  // Calculate Modal Average
  const avgModalPrice = records.length > 0
    ? (records.reduce((sum, r) => sum + (Number(r.modal_price_per_kg) || (Number(r.modal_price) / 100) || 0), 0) / records.length).toFixed(2)
    : '0.00';

  return (
    <section className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
      
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <h2 className="text-xl font-black text-slate-900 font-display flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Mandi Price Intelligence
            </h2>
            {available === true && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE / Agmarknet APMC Feed
              </span>
            )}
            {available === false && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Verified APMC Benchmarks (Cached)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
            <span>Official APMC Wholesale Market Data</span>
            <span>&bull;</span>
            <span>Resource: 9ef84268-d588-465a-a308-a864a43d0070</span>
            {lastUpdated && (
              <>
                <span>&bull;</span>
                <span>Last updated: {lastUpdated}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => executeSearch()}
            disabled={loading || !selectedState}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Cascading Location Filter Toolbar */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/80 space-y-3">
        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Location &amp; Commodity Selection (Cascading Indian APMC Feeds)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* 1. STATE SELECT (Mandatory dropdown) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                disabled={loadingLocations}
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer disabled:bg-slate-100"
              >
                <option value="">Select State</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. DISTRICT SELECT (Cascading based on State) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              District
            </label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                disabled={!selectedState || districts.length === 0}
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">All Districts ({districts.length})</option>
                {districts.map((dst) => (
                  <option key={dst} value={dst}>
                    {dst}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. MARKET / MANDI SELECT (Cascading based on District) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Market / Mandi
            </label>
            <div className="relative">
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                disabled={!selectedState || markets.length === 0}
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">All Mandis ({markets.length})</option>
                {markets.map((mkt) => (
                  <option key={mkt} value={mkt}>
                    {mkt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. COMMODITY SELECT */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Commodity
            </label>
            <div className="relative">
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
              >
                <option value="">All Commodities</option>
                {commodities.map((cmd) => (
                  <option key={cmd} value={cmd}>
                    {cmd}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 5. SEARCH BUTTON */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => executeSearch()}
              disabled={loading || !selectedState}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[38px]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Searching...' : 'Search Prices'}</span>
            </button>
          </div>

        </div>

        {/* Selected Location Summary Breadcrumbs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 pt-1">
          <span className="font-semibold text-slate-500">Active Location Path:</span>
          <span className="bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 font-bold text-slate-800">
            {selectedState || 'All States'}
          </span>
          <span className="text-slate-400">&gt;</span>
          <span className="bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 font-bold text-slate-800">
            {selectedDistrict || 'All Districts'}
          </span>
          <span className="text-slate-400">&gt;</span>
          <span className="bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 font-bold text-slate-800">
            {selectedMarket || 'All APMC Mandis'}
          </span>
          {selectedCommodity && (
            <>
              <span className="text-slate-400">&gt;</span>
              <span className="bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 font-bold text-emerald-800">
                {selectedCommodity}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      {records.length > 0 && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Quotes Found</span>
            <div className="text-lg font-black text-slate-900 font-display mt-0.5">{totalCount} Mandi Quotes</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Modal Price</span>
            <div className="text-lg font-black text-emerald-700 font-display mt-0.5">₹{avgModalPrice} <span className="text-xs font-normal text-slate-500">/ kg</span></div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Commodity</span>
            <div className="text-lg font-black text-slate-800 font-display mt-0.5 truncate">{selectedCommodity || 'All Produce'}</div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Data Source</span>
            <div className="text-xs font-bold text-slate-700 font-display mt-1 truncate">{source}</div>
          </div>
        </div>
      )}

      {/* Main Table / Records Area */}
      <div className="p-4 sm:p-6">
        
        {/* Loading Spinner */}
        {loading && (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Fetching official APMC mandi rates for {selectedState || 'selected region'}...</p>
          </div>
        )}

        {/* Status Notice Banner when Live Feed is using Cached Data */}
        {!loading && available === false && (
          <div className="mb-5 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900">
                  Government Mandi Feed Status
                </div>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {errorMessage || 'Upstream APMC government gateway returned cached status. Displaying verified APMC mandi rate benchmarks.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => executeSearch()}
              className="px-3.5 py-1.5 bg-amber-900 text-white text-xs font-bold rounded-xl hover:bg-amber-800 transition-colors cursor-pointer shrink-0"
            >
              Retry Live Sync
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && records.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">No Mandi records found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try selecting a different state, district, or commodity to view official APMC auction benchmarks.
            </p>
          </div>
        )}

        {/* Records Table */}
        {!loading && records.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50/80">
                  <th className="py-3.5 px-4 font-bold">Commodity</th>
                  <th className="py-3.5 px-4 font-bold">Variety</th>
                  <th className="py-3.5 px-4 font-bold">State</th>
                  <th className="py-3.5 px-4 font-bold">District</th>
                  <th className="py-3.5 px-4 font-bold">Mandi Yard</th>
                  <th className="py-3.5 px-4 font-bold">Min Price</th>
                  <th className="py-3.5 px-4 font-bold">Max Price</th>
                  <th className="py-3.5 px-4 font-bold bg-emerald-50/50 text-emerald-900">Modal Benchmark</th>
                  <th className="py-3.5 px-4 font-bold">Arrival Date</th>
                  {onPriceSelect && <th className="py-3.5 px-4 font-bold text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {records.map((record, index) => {
                  const minKg = record.min_price_per_kg || (Number(record.min_price) / 100);
                  const maxKg = record.max_price_per_kg || (Number(record.max_price) / 100);
                  const modalKg = record.modal_price_per_kg || (Number(record.modal_price) / 100);

                  return (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {record.commodity}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {record.variety || 'Standard'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {record.state}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {record.district}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {record.market}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        ₹{Number(record.min_price).toLocaleString('en-IN')} <span className="text-[10px] text-slate-400">/qtl</span>
                        <span className="block text-[11px] font-semibold text-slate-600">₹{minKg.toFixed(2)}/kg</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        ₹{Number(record.max_price).toLocaleString('en-IN')} <span className="text-[10px] text-slate-400">/qtl</span>
                        <span className="block text-[11px] font-semibold text-slate-600">₹{maxKg.toFixed(2)}/kg</span>
                      </td>
                      <td className="py-3.5 px-4 text-emerald-800 font-bold font-mono bg-emerald-50/30">
                        <span className="text-emerald-900 font-black text-sm">₹{Number(record.modal_price).toLocaleString('en-IN')}</span> <span className="text-[10px] text-emerald-700">/qtl</span>
                        <span className="block text-xs font-black text-emerald-700">₹{modalKg.toFixed(2)}/kg</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {record.arrival_date || 'Today'}
                      </td>
                      {onPriceSelect && (
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onPriceSelect(record)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Select
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </section>
  );
};
