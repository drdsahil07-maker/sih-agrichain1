import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as poolService from '../services/pool.service';

export const getPools = async (req: AuthRequest, res: Response) => {
  try {
    const pools = await poolService.getPools(req, req.query);
    res.json({ success: true, count: pools.length, pools });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const getPoolById = async (req: AuthRequest, res: Response) => {
  try {
    const pool = await poolService.getPoolById(req, req.params.id);
    if (!pool) return res.status(404).json({ success: false, error: { message: 'Pool not found' }});
    res.json({ success: true, pool });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const suggestPools = async (req: AuthRequest, res: Response) => {
  try {
    const suggestions = await poolService.suggestPools(req, req.body);
    res.json({ success: true, count: suggestions.length, suggestions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const createPool = async (req: AuthRequest, res: Response) => {
  try {
    const newPool = await poolService.createPoolWithMembers(req, req.body);
    res.json({ success: true, pool: newPool });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const addHarvest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await poolService.addHarvestToPool(req, req.params.id, req.body.harvestId, req.body.quantityKg);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const removeHarvest = async (req: AuthRequest, res: Response) => {
  try {
    const result = await poolService.removeHarvestFromPool(req, req.params.id, req.params.harvestId);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    const result = await poolService.updatePoolStatus(req, req.params.id, req.body.status);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const recalculateSavings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await poolService.recalculateSavings(req, req.params.id);
    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};
