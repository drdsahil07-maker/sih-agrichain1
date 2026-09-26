import { Request, Response } from 'express';
import { state } from '../data/store';
import { SEED_TRANSPORTERS, SEED_SERVICE_PROVIDERS } from '../../../shared/data/seedData';

export const getAdminMetrics = (_req: Request, res: Response) => {
  res.json({
    success: true,
    metrics: {
      totalFarmers: 420,
      activeHarvestsToday: state.harvests.length,
      activeConsignmentPools: state.pools.length,
      activeTransporters: SEED_TRANSPORTERS.length,
      availableReturnTrucks: state.backhaulTrips.filter(t => t.status === 'open').length,
      activeBuyerDemands: state.buyerDemands.length,
      averageFarmerNetValue: 14.20,
      traditionalMandiNet: 11.00,
      farmerNetGainPercentage: 29.1,
      averageLogisticsCostPerKg: 1.20,
      estimatedWastageAvoidedKg: 4250,
      completedTransactionsCount: 148,
      totalGrossVolumeInr: 1285000,
      verifiedServiceProviders: SEED_SERVICE_PROVIDERS.length,
      activeTrustAlertsCount: 0
    }
  });
};
