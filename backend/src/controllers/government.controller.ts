import { Response } from 'express';
import { AuthRequest, getScopedClient } from '../middleware/auth';

export const getGovernmentOverview = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);

    // Get active pools count
    const { count: activePools } = await supabase
      .from('pools')
      .select('id', { count: 'exact', head: true })
      .in('status', ['forming', 'ready', 'matched', 'dispatched']);

    // Get active transport trips
    const { count: activeTransports } = await supabase
      .from('transport_trips')
      .select('id', { count: 'exact', head: true })
      .in('status', ['AVAILABLE', 'MATCHED', 'ASSIGNED', 'IN_TRANSIT']);

    // Get users count by role
    const { data: users } = await supabase.from('profiles').select('role');
    const roleCounts = {
      farmer: 0,
      distributor: 0,
      transporter: 0,
      consumer: 0
    };
    if (users) {
      users.forEach(u => {
        if (roleCounts.hasOwnProperty(u.role)) {
          roleCounts[u.role as keyof typeof roleCounts]++;
        }
      });
    }

    // Since we don't have all data yet, we might return some placeholders for non-existent tables
    res.json({
      success: true,
      data: {
        registeredFarmers: roleCounts.farmer,
        activeTransporters: roleCounts.transporter,
        activePools: activePools || 0,
        ordersInTransit: activeTransports || 0,
        // The following are estimations or placeholders since exact tables don't exist yet
        totalQuantityMoved: 'Calculation Pending', 
        averageFarmerNetValue: 'Calculation Pending',
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getSupplyDemand = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    // Simple supply demand aggregation
    const { data: harvests } = await supabase.from('harvests').select('crop, quantity_kg');
    const { data: demands } = await supabase.from('buyer_demands').select('crop, required_quantity_kg');

    const aggregated: Record<string, { supply: number; demand: number }> = {};
    
    if (harvests) {
      harvests.forEach(h => {
        if (!aggregated[h.crop]) aggregated[h.crop] = { supply: 0, demand: 0 };
        aggregated[h.crop].supply += h.quantity_kg || 0;
      });
    }

    if (demands) {
      demands.forEach(d => {
        if (!aggregated[d.crop]) aggregated[d.crop] = { supply: 0, demand: 0 };
        aggregated[d.crop].demand += d.required_quantity_kg || 0;
      });
    }

    const results = Object.keys(aggregated).map(crop => ({
      crop,
      supplyQuantity: aggregated[crop].supply,
      demandQuantity: aggregated[crop].demand,
      gap: aggregated[crop].supply - aggregated[crop].demand
    }));

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getPools = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    const { data: pools, error } = await supabase.from('pools').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    res.json({ success: true, data: pools });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getLogistics = async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getScopedClient(req);
    const { data: trips, error } = await supabase.from('transport_trips').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    res.json({ success: true, data: trips });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
