import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as offerService from '../services/offer.service';

export const getOffers = async (req: AuthRequest, res: Response) => {
  try {
    const harvestId = req.query.harvestId as string | undefined;
    const offers = await offerService.getOffers(req, harvestId);
    res.json({ success: true, count: offers.length, offers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const createOffer = async (req: AuthRequest, res: Response) => {
  try {
    const newOffer = await offerService.createOffer(req, req.body);
    res.json({ success: true, offer: newOffer });
  } catch (err: any) {
    if (err.message.includes("Authenticated user required") || err.message.includes("Cannot create offer")) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: err.message } });
    }
    if (err.message.includes("Missing required fields")) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
    }
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const updateOfferStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Status is required' } });
    }
    const updatedOffer = await offerService.updateOfferStatus(req, id, status);
    res.json({ success: true, offer: updatedOffer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};
