import { Request, Response } from 'express';
import { 
  fetchLiveMandiPrices, 
  getMandiStates, 
  getMandiDistricts, 
  getMandiMarkets, 
  getMandiCommodities 
} from '../services/mandi.service';

/**
 * GET /api/mandi/prices
 * Query params: commodity, state, district, market, limit, offset
 */
export const getMandiPrices = async (req: Request, res: Response) => {
  const commodity = req.query.commodity ? String(req.query.commodity) : undefined;
  const state = req.query.state ? String(req.query.state) : undefined;
  const district = req.query.district ? String(req.query.district) : undefined;
  const market = req.query.market ? String(req.query.market) : undefined;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
  const offset = req.query.offset ? parseInt(String(req.query.offset), 10) : 0;

  try {
    const result = await fetchLiveMandiPrices({
      commodity,
      state,
      district,
      market,
      limit,
      offset
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[MandiController] Error getting prices:', error);
    return res.status(200).json({
      success: false,
      available: false,
      error: 'Government mandi feed unavailable',
      message: 'Government mandi feed unavailable: internal service error',
      resourceId: '9ef84268-d588-465a-a308-a864a43d0070',
      records: []
    });
  }
};

/**
 * GET /api/mandi/locations
 * Query params: state, district
 * Returns available states, districts for state, markets for district, and commodities
 */
export const getMandiLocations = async (req: Request, res: Response) => {
  const state = req.query.state ? String(req.query.state) : undefined;
  const district = req.query.district ? String(req.query.district) : undefined;

  try {
    const states = getMandiStates();
    const districts = state ? getMandiDistricts(state) : [];
    const markets = state ? getMandiMarkets(state, district) : [];
    const commodities = getMandiCommodities();

    return res.status(200).json({
      success: true,
      states,
      selectedState: state || null,
      districts,
      selectedDistrict: district || null,
      markets,
      commodities
    });
  } catch (error: any) {
    console.error('[MandiController] Error getting locations:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve mandi locations'
    });
  }
};

/**
 * GET /api/mandi/states
 */
export const getStates = async (_req: Request, res: Response) => {
  try {
    const states = getMandiStates();
    return res.status(200).json({ success: true, states });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
