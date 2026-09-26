import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Info, 
  Calendar, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle,
  BarChart3,
  Sliders,
  DollarSign
} from 'lucide-react';
import { CROP_PRICE_HISTORIES, CropPriceHistory } from '../../../shared/data/priceTrends';

interface HistoricalPriceTrendChartProps {
  selectedCrop: string;
  minAcceptablePrice?: number;
}

export const HistoricalPriceTrendChart: React.FC<HistoricalPriceTrendChartProps> = ({
  selectedCrop,
  minAcceptablePrice,
}) => {
  const [timeRange, setTimeRange] = useState<'7D' | '14D' | '30D'>('14D');
  const [showVolume, setShowVolume] = useState<boolean>(false);
  const [showTraderOffer, setShowTraderOffer] = useState<boolean>(true);
  const [showMandiBand, setShowMandiBand] = useState<boolean>(true);

  // Fallback to Tomato if crop not recognized
  const cropData: CropPriceHistory = CROP_PRICE_HISTORIES[selectedCrop] || CROP_PRICE_HISTORIES['Tomato'];

  // Slice data according to timeRange
  const fullData = cropData.data;
  let chartData = fullData;
  if (timeRange === '7D') {
    chartData = fullData.slice(-5);
  } else if (timeRange === '14D') {
    chartData = fullData.slice(-9);
  } else {
    chartData = fullData;
  }

  // Calculate statistics for current slice
  const mandiPrices = chartData.map(d => d.mandiPrice);
  const maxPrice = Math.max(...chartData.map(d => Math.max(d.agriChainNet, d.mandiMax)));
  const minPrice = Math.min(...chartData.map(d => Math.min(d.traderOffer, d.mandiMin)));
  const avgMandiInView = (mandiPrices.reduce((a, b) => a + b, 0) / mandiPrices.length).toFixed(1);
  const latestPoint = chartData[chartData.length - 1];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      if (!dataPoint) return null;

      const netAdvantage = (dataPoint.agriChainNet - dataPoint.traderOffer).toFixed(2);
      const netAdvantagePct = (((dataPoint.agriChainNet - dataPoint.traderOffer) / dataPoint.traderOffer) * 100).toFixed(1);

      return (
        <div className="bg-slate-950 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-2 min-w-[210px] animate-in fade-in-50 duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-mono text-[11px] text-slate-400">
            <span className="font-semibold text-slate-200">{dataPoint.date}</span>
            <span>{dataPoint.fullDate}</span>
          </div>

          <div className="space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                AgriChain Net (FNV):
              </span>
              <span>₹{dataPoint.agriChainNet.toFixed(2)}/kg</span>
            </div>

            <div className="flex items-center justify-between text-blue-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                APMC Mandi Modal:
              </span>
              <span>₹{dataPoint.mandiPrice.toFixed(2)}/kg</span>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>&nbsp;&nbsp;Mandi Range (Min-Max):</span>
              <span>₹{dataPoint.mandiMin} - ₹{dataPoint.mandiMax}</span>
            </div>

            <div className="flex items-center justify-between text-rose-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                Village Trader Spot:
              </span>
              <span>₹{dataPoint.traderOffer.toFixed(2)}/kg</span>
            </div>

            {showVolume && dataPoint.arrivalVolumeQtl && (
              <div className="flex items-center justify-between text-amber-300 text-[11px] pt-1 border-t border-slate-800">
                <span>Mandi Arrivals:</span>
                <span>{dataPoint.arrivalVolumeQtl} Qtl</span>
              </div>
            )}
          </div>

          <div className="bg-emerald-950/80 border border-emerald-500/30 rounded-lg p-2 mt-2 text-[11px] flex items-center justify-between">
            <span className="text-emerald-300 font-medium">Compiler Advantage:</span>
            <span className="font-bold text-emerald-400 font-mono">
              +₹{netAdvantage} ({netAdvantagePct}%)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
            </div>
            <h2 className="text-base font-bold text-slate-900 font-display">
              Historical Price Trends & Volatility Analysis
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
              {cropData.crop} ({cropData.hindiName})
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <span>Market Benchmark: <strong>{cropData.primaryMandi}</strong></span>
            <span>&bull;</span>
            <span>Modal Price & Net Realization Log</span>
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {(['7D', '14D', '30D'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {range === '7D' ? '7 Days' : range === '14D' ? '14 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Analytical KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: AgriChain Net */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
          <div className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>AgriChain Net (FNV)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-900 font-display">
            ₹{latestPoint.agriChainNet.toFixed(2)}
            <span className="text-xs font-normal text-slate-500 font-sans">/kg</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            +{cropData.netAdvantagePercent}% above local trader
          </span>
        </div>

        {/* Card 2: APMC Mandi Modal */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Mandi Modal Price</span>
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-display">
            ₹{latestPoint.mandiPrice.toFixed(2)}
            <span className="text-xs font-normal text-slate-500 font-sans">/kg</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Range: ₹{latestPoint.mandiMin} - ₹{latestPoint.mandiMax}
          </span>
        </div>

        {/* Card 3: Village Trader Spot */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Village Trader Spot</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-slate-700 font-display">
            ₹{latestPoint.traderOffer.toFixed(2)}
            <span className="text-xs font-normal text-slate-500 font-sans">/kg</span>
          </div>
          <span className="text-[11px] text-rose-600 font-medium block">
            -₹{(latestPoint.agriChainNet - latestPoint.traderOffer).toFixed(2)}/kg trader discount
          </span>
        </div>

        {/* Card 4: 14D Trend & Volatility */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>14D Momentum</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-display flex items-center gap-1">
            <span>+{cropData.changePercent14d}%</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <span className="text-[11px] text-slate-500 block">
            Volatility: <strong>{cropData.volatilityRating}</strong>
          </span>
        </div>
      </div>

      {/* Chart Control Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-4 text-slate-700 font-medium">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Layers:</span>
          
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>AgriChain Net</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showMandiBand}
              onChange={(e) => setShowMandiBand(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
            <span>APMC Mandi Modal</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTraderOffer}
              onChange={(e) => setShowTraderOffer(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
            <span>Village Trader Spot</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showVolume}
              onChange={(e) => setShowVolume(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
            />
            <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
            <span>Mandi Arrivals (Qtl)</span>
          </label>
        </div>

        {minAcceptablePrice && minAcceptablePrice > 0 && (
          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Your Min Target: ₹{minAcceptablePrice.toFixed(2)}/kg</span>
          </div>
        )}
      </div>

      {/* Main Recharts Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorAgriChain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorMandi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            
            <YAxis 
              yAxisId="price"
              domain={['auto', 'auto']}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
            />

            {showVolume && (
              <YAxis 
                yAxisId="volume"
                orientation="right"
                domain={[0, 'auto']}
                tick={{ fontSize: 10, fill: '#f59e0b' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}q`}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            {/* Min Acceptable Price Reference Line */}
            {minAcceptablePrice && minAcceptablePrice > 0 && (
              <ReferenceLine 
                yAxisId="price"
                y={minAcceptablePrice} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ 
                  value: `Min Target: ₹${minAcceptablePrice}`, 
                  fill: '#b45309', 
                  fontSize: 10, 
                  position: 'insideBottomRight' 
                }} 
              />
            )}

            {/* Arrival Volume Bar */}
            {showVolume && (
              <Bar 
                yAxisId="volume"
                dataKey="arrivalVolumeQtl" 
                name="Mandi Arrivals (Qtl)" 
                fill="#fde68a" 
                radius={[4, 4, 0, 0]}
                opacity={0.7}
              />
            )}

            {/* APMC Mandi Modal Area */}
            {showMandiBand && (
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="mandiPrice"
                name="APMC Mandi Modal"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMandi)"
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 5 }}
              />
            )}

            {/* Village Trader Spot Line */}
            {showTraderOffer && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="traderOffer"
                name="Village Trader Spot"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 2.5, fill: '#f43f5e' }}
              />
            )}

            {/* AgriChain Net Value Area (Primary) */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="agriChainNet"
              name="AgriChain Net (FNV)"
              stroke="#059669"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAgriChain)"
              dot={{ r: 4, fill: '#059669', stroke: '#ffffff', strokeWidth: 1.5 }}
              activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Selling Recommendation Banner */}
      <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-emerald-900">
            Market Intelligence & Recommendation for {cropData.crop}
          </p>
          <p className="text-emerald-800 leading-relaxed text-[11px]">
            {cropData.optimalSellingRecommendation} Notice how village trader spot prices drop whenever Mandi arrivals surge, while AgriChain&apos;s compiled backhaul routes maintain steady ₹{latestPoint.agriChainNet.toFixed(2)}/kg net realization.
          </p>
        </div>
      </div>

    </div>
  );
};
