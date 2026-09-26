import { 
  SEED_HARVESTS, 
  SEED_POOLS, 
  SEED_BACKHAUL_TRIPS, 
  SEED_BUYER_DEMANDS 
} from '../../../shared/data/seedData';
import { Harvest, FarmerPool, BackhaulTrip, BuyerDemand } from '../../../shared/types';

// In-memory state holding arrays for prototype / Phase 1
export const state = {
  harvests: [...SEED_HARVESTS] as Harvest[],
  pools: [...SEED_POOLS] as FarmerPool[],
  backhaulTrips: [...SEED_BACKHAUL_TRIPS] as BackhaulTrip[],
  buyerDemands: [...SEED_BUYER_DEMANDS] as BuyerDemand[]
};
