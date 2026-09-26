import { Request, Response } from 'express';
import { state } from '../data/store';

export const getBuyers = (_req: Request, res: Response) => {
  res.json({ success: true, count: state.buyerDemands.length, demands: state.buyerDemands });
};
