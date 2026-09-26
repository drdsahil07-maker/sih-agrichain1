import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as harvestService from '../services/harvest.service';

export const getHarvests = async (req: AuthRequest, res: Response) => {
  try {
    const harvests = await harvestService.getHarvests(req);
    res.json({ success: true, count: harvests.length, harvests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const createHarvest = async (req: AuthRequest, res: Response) => {
  try {
    const newHarvest = await harvestService.createHarvest(req, req.body);
    res.json({ success: true, harvest: newHarvest });
  } catch (err: any) {
    if (err.message.includes("Authenticated user required") || err.message.includes("Cannot create harvest for another farmer")) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: err.message } });
    }
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};
