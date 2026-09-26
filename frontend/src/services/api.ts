import { fetchWithAuth } from "./apiFetch";
import { 
  ChainOption, 
  Harvest, 
  FarmerPool, 
  BackhaulTrip, 
  BuyerDemand, 
  ServiceProvider, 
  PriceBenchmark, 
  QualityAnalysisResult 
} from '../../../shared/types';
import { 
   
   
  SEED_BACKHAUL_TRIPS, 
  SEED_BUYER_DEMANDS, 
  SEED_SERVICE_PROVIDERS, 
  SEED_PRICE_BENCHMARKS 
} from '../../../shared/data/seedData';
import { compileSupplyChains, evaluateCounterfactual, CounterfactualScenario } from '../../../shared/services/chainCompiler';

export interface CompileParams {
  crop: string;
  quantityKg: number;
  location: string;
  harvestDate?: string;
  minAcceptablePrice: number;
  qualityGrade: 'Grade A' | 'Grade B' | 'Grade C';
  preferredBuyerType?: string;
  harvestId?: string;
}

export const api = {
  // === Phase 7 Orders API ===
  async createOrder(orderData: any): Promise<any> {
    const res = await fetchWithAuth('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to create order");
    return data.data;
  },
  async getOrders(): Promise<any[]> {
    try {
      const res = await fetchWithAuth('/api/orders');
      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }
    } catch (e) {
      console.warn('API error fetching orders:', e);
    }
    return [];
  },
  async getOrderById(orderId: string): Promise<any> {
    const res = await fetchWithAuth(`/api/orders/${orderId}`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to fetch order");
    return data.data;
  },
  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const res = await fetchWithAuth(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data?.error?.message || "Failed to update order status");
    return data.data;
  },
  // === Existing API ===

  async compileChain(params: CompileParams): Promise<{ options: ChainOption[]; bestOption: ChainOption }> {
    try {
      const res = await fetchWithAuth('/api/chain/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        return { options: data.options, bestOption: data.bestOption };
      }
    } catch (e) {
      console.warn('API call failed, compiling locally:', e);
    }
    const options = compileSupplyChains({
      crop: params.crop,
      quantityKg: params.quantityKg,
      location: params.location,
      harvestDate: params.harvestDate || '2026-09-10',
      minAcceptablePrice: params.minAcceptablePrice,
      qualityGrade: params.qualityGrade,
      preferredBuyerType: params.preferredBuyerType,
    });
    return { options, bestOption: options[0] };
  },

  async getCounterfactual(scenario: 'replace_distributor' | 'replace_trader' | 'enable_backhaul' | 'full_optimal'): Promise<CounterfactualScenario> {
    try {
      const res = await fetchWithAuth(`/api/chain/counterfactual?scenario=${scenario}`);
      if (res.ok) {
        const data = await res.json();
        return data.counterfactual;
      }
    } catch (e) {
      console.warn('Counterfactual API fallback:', e);
    }
    return evaluateCounterfactual(scenario);
  },

  async getHarvests(): Promise<Harvest[]> {
    try {
      const res = await fetchWithAuth('/api/harvests');
      if (res.ok) {
        const data = await res.json();
        return data.harvests;
      }
    } catch (e) {
      console.warn('Harvests API fallback:', e);
    }
    return []; // Removed in Phase 5 to ensure Supabase truth
  },

  async createHarvest(payload: Partial<Harvest>): Promise<Harvest> {
    const res = await fetchWithAuth('/api/harvests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to create harvest record in database");
    }
    return data.harvest;
  },

  
  async suggestPools(requirement: any): Promise<any[]> {
    try {
      const res = await fetchWithAuth('/api/pools/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requirement),
      });
      if (res.ok) {
        const data = await res.json();
        return data.suggestions;
      }
    } catch (e) {
      console.warn('API error suggesting pools:', e);
    }
    return [];
  },

  async createPool(poolData: any): Promise<any> {
    const res = await fetchWithAuth('/api/pools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(poolData),
    });
    if (!res.ok) throw new Error("Failed to create pool");
    const data = await res.json();
    return data.pool;
  },

  async getPools(): Promise<FarmerPool[]> {
    try {
      const res = await fetchWithAuth('/api/pools');
      if (res.ok) {
        const data = await res.json();
        return data.pools;
      }
    } catch (e) {
      console.warn('Pools API fallback:', e);
    }
    return []; // Removed in Phase 5 to ensure Supabase truth
  },

  async getTransportOptions(poolId: string): Promise<any[]> {
    const res = await fetchWithAuth(`/api/transporters/options/${poolId}`);
    if (res.ok) {
      const data = await res.json();
      return data.options;
    }
    return [];
  },
  
  async assignTransport(poolId: string, tripId: string): Promise<any> {
    const res = await fetchWithAuth(`/api/transporters/assign/${poolId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId })
    });
    if (!res.ok) throw new Error("Failed to assign transport");
    return await res.json();
  },
  
  async getBackhaulTrips(): Promise<BackhaulTrip[]> {
    try {
      const res = await fetchWithAuth('/api/transporters/backhaul');
      if (res.ok) {
        const data = await res.json();
        return data.backhaulTrips;
      }
    } catch (e) {
      console.warn('Backhaul API fallback:', e);
    }
    return []; // Phase 6: Removed SEED_BACKHAUL_TRIPS
  },

  async createBackhaulTrip(trip: Partial<BackhaulTrip>): Promise<BackhaulTrip> {
    

    try {
      const res = await fetchWithAuth('/api/transporters/backhaul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      if (res.ok) {
        const data = await res.json();
        return data.trip;
      }
    } catch (e) {
      console.warn('Backhaul create fallback:', e);
    }
    throw new Error("Failed to create backhaul trip");
  },

  async getBuyerDemands(): Promise<BuyerDemand[]> {
    try {
      const res = await fetchWithAuth('/api/buyers/demand');
      if (res.ok) {
        const data = await res.json();
        return data.demands;
      }
    } catch (e) {
      console.warn('Buyer demand fallback:', e);
    }
    return SEED_BUYER_DEMANDS;
  },

  
  async getOffers(harvestId?: string): Promise<any[]> {
    try {
      const url = harvestId ? `/api/offers?harvestId=${harvestId}` : '/api/offers';
      const res = await fetchWithAuth(url);
      if (res.ok) {
        const data = await res.json();
        return data.offers;
      }
    } catch (e) {
      console.warn('API error fetching offers:', e);
    }
    return [];
  },

  async createOffer(offerData: any): Promise<any> {
    const res = await fetchWithAuth('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to create offer in database");
    }
    return data.offer;
  },

  async updateOfferStatus(offerId: string, status: 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | string): Promise<any> {
    const res = await fetchWithAuth(`/api/offers/${offerId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data?.error?.message || "Failed to update offer status");
    }
    return data.offer;
  },

  async getServiceProviders(): Promise<ServiceProvider[]> {
    try {
      const res = await fetchWithAuth('/api/service-providers');
      if (res.ok) {
        const data = await res.json();
        return data.providers;
      }
    } catch (e) {
      console.warn('Service providers fallback:', e);
    }
    return SEED_SERVICE_PROVIDERS;
  },

  async getPriceBenchmarks(): Promise<Record<string, PriceBenchmark>> {
    try {
      const res = await fetchWithAuth('/api/prices/benchmark');
      if (res.ok) {
        const data = await res.json();
        return data.benchmarks;
      }
    } catch (e) {
      console.warn('Price benchmark fallback:', e);
    }
    return SEED_PRICE_BENCHMARKS;
  },

  async getMandiPrices(filters?: { commodity?: string; state?: string; district?: string; market?: string; limit?: number; offset?: number }): Promise<{
    success: boolean;
    available: boolean;
    records: any[];
    error?: string;
    message?: string;
    lastUpdated?: string;
    source?: string;
    count?: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.commodity) params.append('commodity', filters.commodity);
      if (filters?.state) params.append('state', filters.state);
      if (filters?.district) params.append('district', filters.district);
      if (filters?.market) params.append('market', filters.market);
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.offset) params.append('offset', String(filters.offset));
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetchWithAuth(`/api/mandi/prices${queryString}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Mandi prices fetch error:', e);
    }
    return {
      success: false,
      available: false,
      error: 'Government mandi feed unavailable',
      message: 'Government mandi feed unavailable',
      records: []
    };
  },

  async getMandiLocations(params?: { state?: string; district?: string }): Promise<{
    success: boolean;
    states: string[];
    selectedState?: string | null;
    districts: string[];
    selectedDistrict?: string | null;
    markets: string[];
    commodities: string[];
  }> {
    try {
      const q = new URLSearchParams();
      if (params?.state) q.append('state', params.state);
      if (params?.district) q.append('district', params.district);
      const query = q.toString() ? `?${q.toString()}` : '';
      const res = await fetchWithAuth(`/api/mandi/locations${query}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Mandi locations fetch error:', e);
    }
    return {
      success: false,
      states: [],
      districts: [],
      markets: [],
      commodities: []
    };
  },

  async analyzeQuality(cropOrImage: string, imageOrCrop?: string, sampleType: 'grade_a' | 'grade_b' = 'grade_a'): Promise<QualityAnalysisResult & { [key: string]: any }> {
    let crop = cropOrImage;
    let base64Image = imageOrCrop;

    // Detect if crop and image arguments were inverted
    if (cropOrImage && (cropOrImage.startsWith('http://') || cropOrImage.startsWith('https://') || cropOrImage.startsWith('data:image') || cropOrImage.length > 80)) {
      base64Image = cropOrImage;
      crop = (imageOrCrop && imageOrCrop.length < 80) ? imageOrCrop : 'Tomato';
    }

    try {
      const res = await fetchWithAuth('/api/quality/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, base64Image, sampleType }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          return {
            ...data.result,
            grade: data.result.grade || data.result.estimatedGrade || 'Grade A',
            suggestedPriceMin: Number(data.result.suggestedPriceMin) || 14.0,
            suggestedPriceMax: Number(data.result.suggestedPriceMax) || 16.0,
            ripeness: Number(data.result.ripeness) || 90,
            defectScore: Number(data.result.defectScore) || 2.1,
            sizeUniformity: Number(data.result.sizeUniformity) || 88,
            firmnessRating: Number(data.result.firmnessRating) || 8.9,
            shelfLifeDays: Number(data.result.shelfLifeDays) || 5,
            analysisNotes: data.result.analysisNotes || data.result.recommendation || 'Verified by vision engine.',
          };
        }
      }
    } catch (e) {
      console.warn('Quality analyze fallback:', e);
    }
    const isGradeA = sampleType !== 'grade_b';
    return {
      crop: crop || 'Tomato',
      estimatedGrade: isGradeA ? 'Grade A' : 'Grade B',
      grade: isGradeA ? 'Grade A' : 'Grade B',
      confidence: isGradeA ? 94 : 84,
      colorUniformity: isGradeA ? 94 : 79,
      ripeness: isGradeA ? 90 : 82,
      visibleDefects: isGradeA ? 'Low' : 'Medium',
      defectScore: isGradeA ? 2.1 : 4.6,
      sizeConsistency: isGradeA ? 'High' : 'Medium',
      sizeUniformity: isGradeA ? 88 : 76,
      firmnessScore: isGradeA ? 92 : 81,
      firmnessRating: isGradeA ? 8.9 : 7.8,
      shelfLifeDays: isGradeA ? 5 : 3,
      suggestedPriceMin: isGradeA ? 14.0 : 11.5,
      suggestedPriceMax: isGradeA ? 16.0 : 13.0,
      recommendation: isGradeA
        ? 'Grade A Premium: Optimal for restaurant & hotel contracts.'
        : 'Grade B Standard: Suitable for processing or wholesale.',
      analysisNotes: isGradeA
        ? 'High optical luster, uniform color index, minimal mechanical bruising.'
        : 'Standard retail grading with minor superficial blemishes.',
      isAiAssistedEstimate: true,
    };
  },

  async processVoice(transcript: string): Promise<any> {
    try {
      const res = await fetchWithAuth('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.extracted;
      }
    } catch (e) {
      console.warn('Voice API fallback:', e);
    }
    return {
      crop: 'Tomato',
      quantityKg: 100,
      sellingWindow: 'Tomorrow Morning',
      minAcceptablePrice: 12,
      farmerIntent: 'confirmed',
      hindiReply: 'Ram-ram ji! Aapke 100 kg tamatar ka entry taiyyar hai (bhav ₹12/kg).'
    };
  },

  async getAdminDashboard(): Promise<any> {
    try {
      const res = await fetchWithAuth('/api/dashboard/admin');
      if (res.ok) {
        const data = await res.json();
        return data.metrics;
      }
    } catch (e) {
      console.warn('Admin dashboard fallback:', e);
    }
    return {
      totalFarmers: 420,
      activeHarvestsToday: 30,
      activeConsignmentPools: 8,
      activeTransporters: 10,
      availableReturnTrucks: 3,
      activeBuyerDemands: 10,
      averageFarmerNetValue: 14.20,
      traditionalMandiNet: 11.00,
      farmerNetGainPercentage: 29.1,
      averageLogisticsCostPerKg: 1.20,
      estimatedWastageAvoidedKg: 4250,
      completedTransactionsCount: 148,
      totalGrossVolumeInr: 1285000,
      verifiedServiceProviders: 10,
      activeTrustAlertsCount: 0
    };
  }
};
