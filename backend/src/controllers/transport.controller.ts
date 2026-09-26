import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as transportService from '../services/transport.service';

export const getTrips = async (req: AuthRequest, res: Response) => {
  try {
    const trips = await transportService.getTrips(req, req.query);
    res.json({ success: true, count: trips.length, backhaulTrips: trips, trips }); // Return both for backwards compatibility during migration
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const getTripById = async (req: AuthRequest, res: Response) => {
  try {
    const trip = await transportService.getTripById(req, req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: { message: 'Trip not found' }});
    res.json({ success: true, trip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const newTrip = await transportService.createTrip(req, req.body);
    res.json({ success: true, trip: newTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const updateTripStatus = async (req: AuthRequest, res: Response) => {
  try {
    const result = await transportService.updateTripStatus(req, req.params.id, req.body.status);
    res.json({ success: true, trip: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const matchOptions = async (req: AuthRequest, res: Response) => {
  try {
    const options = await transportService.matchOptions(req, req.params.poolId);
    res.json({ success: true, count: options.length, options });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const assignTransport = async (req: AuthRequest, res: Response) => {
  try {
    const result = await transportService.assignTransport(req, req.params.poolId, req.body.tripId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'DATABASE_ERROR', message: err.message } });
  }
};

export const getTransportAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await transportService.getTransportAnalytics(req);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(err.message === 'Unauthorized' ? 403 : 500).json({ success: false, error: { message: err.message } });
  }
};
