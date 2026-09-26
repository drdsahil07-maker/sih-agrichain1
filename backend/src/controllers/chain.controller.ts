import { Request, Response } from 'express';
import { compileSupplyChains, evaluateCounterfactual } from '../../../shared/services/chainCompiler';
import { QualityGrade } from '../../../shared/types';
import { getScopedClient, AuthRequest } from '../middleware/auth';

export const compileChain = async (req: AuthRequest, res: Response) => {
  try {
    const {
      crop = 'Tomato',
      quantityKg = 100,
      location = 'Sanwer, Indore',
      harvestDate = '2026-09-10',
      minAcceptablePrice = 12,
      qualityGrade = 'Grade A',
      preferredBuyerType = 'Restaurant',
      harvestId
    } = req.body;

    let offers: any[] = [];
    if (harvestId) {
       const supabase = getScopedClient(req);
       const { data, error } = await supabase
         .from('buyer_offers')
         .select('*')
         .eq('harvest_id', harvestId)
         .eq('status', 'ACTIVE');
       
       if (!error && data) {
         offers = data.map(o => ({
           id: o.id,
           buyerId: o.buyer_id,
           buyerName: o.buyer_name,
           harvestId: o.harvest_id,
           crop: o.crop,
           quantityKg: Number(o.quantity_kg),
           offeredPrice: Number(o.offered_price),
           destination: o.destination,
           pickupTerms: o.pickup_terms,
           status: o.status,
         }));
       }
    }

    const chains = compileSupplyChains({
      crop,
      quantityKg: Number(quantityKg),
      location,
      harvestDate,
      minAcceptablePrice: Number(minAcceptablePrice),
      qualityGrade: qualityGrade as QualityGrade,
      preferredBuyerType,
      offers
    });

    res.json({
      success: true,
      chains
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

type ScenarioType = 'replace_distributor' | 'replace_trader' | 'enable_backhaul' | 'full_optimal';

export const getCounterfactual = (req: Request, res: Response) => {
  try {
    const scenarioQuery = req.query.scenario as string;
    
    // Default to a valid key if not provided
    const validScenario: ScenarioType = 
      ['replace_distributor', 'replace_trader', 'enable_backhaul', 'full_optimal'].includes(scenarioQuery)
        ? (scenarioQuery as ScenarioType)
        : 'full_optimal';

    const result = evaluateCounterfactual(validScenario);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
