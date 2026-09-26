import { Request, Response } from 'express';
import { SEED_SERVICE_PROVIDERS } from '../../../shared/data/seedData';

export const getServiceProviders = (_req: Request, res: Response) => {
  res.json({ success: true, count: SEED_SERVICE_PROVIDERS.length, providers: SEED_SERVICE_PROVIDERS });
};
