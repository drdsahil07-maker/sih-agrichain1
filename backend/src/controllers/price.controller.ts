import { Request, Response } from 'express';
import { SEED_PRICE_BENCHMARKS } from '../../../shared/data/seedData';
import { fetchLiveMandiPrices } from '../services/mandi.service';
import { PriceBenchmark } from '../../../shared/types';

export const getBenchmarks = async (_req: Request, res: Response) => {
  try {
    const liveMandi = await fetchLiveMandiPrices({ limit: 100 });

    if (liveMandi.available && liveMandi.records.length > 0) {
      // Build dynamic benchmarks from live mandi records
      const benchmarks: Record<string, PriceBenchmark> = {};

      for (const record of liveMandi.records) {
        const cropName = record.commodity;
        const minKg = record.min_price_per_kg || 15;
        const maxKg = record.max_price_per_kg || 25;
        const modalKg = record.modal_price_per_kg || ((minKg + maxKg) / 2);

        // Typical local trader offers are ~15-20% below modal market price
        const traderOffer = Number((modalKg * 0.82).toFixed(2));
        const bargainingGap = Number((modalKg - traderOffer).toFixed(2));

        benchmarks[cropName] = {
          crop: cropName,
          location: record.market ? `${record.market}, ${record.district || 'Indore'}` : 'Indore (Choithram APMC)',
          mandiBenchmarkMin: minKg,
          mandiBenchmarkMax: maxKg,
          enamModalPrice: modalKg,
          currentTraderOffer: traderOffer,
          suggestedFairBandMin: minKg,
          suggestedFairBandMax: maxKg,
          potentialBargainingGap: bargainingGap,
          lastUpdated: record.arrival_date || liveMandi.lastUpdated || new Date().toISOString(),
          source: 'data.gov.in AGMARKNET',
          isDemoData: false
        };
      }

      // Also ensure standard baseline crops are available if missing from the specific response batch
      for (const [key, baseBenchmark] of Object.entries(SEED_PRICE_BENCHMARKS)) {
        if (!benchmarks[key]) {
          benchmarks[key] = baseBenchmark;
        }
      }

      return res.json({
        success: true,
        source: 'Live data.gov.in Mandi Feed',
        count: Object.keys(benchmarks).length,
        benchmarks
      });
    }
  } catch (e) {
    console.error('[PriceController] Error obtaining live Mandi data for benchmarks:', e);
  }

  // Fallback to DEMO/SEED data if live feed unavailable
  return res.json({
    success: true,
    source: 'Seed/Benchmark Baseline',
    count: Object.keys(SEED_PRICE_BENCHMARKS).length,
    benchmarks: SEED_PRICE_BENCHMARKS
  });
};
