const fs = require('fs');

// Add analytics method to service
let serviceCode = fs.readFileSync('backend/src/services/transport.service.ts', 'utf-8');
const analyticsMethod = `
export const getTransportAnalytics = async (req: AuthRequest) => {
  const supabase = getScopedClient(req);
  
  // Basic check for role here (RLS will also protect underlying data, but good to ensure only authorized can hit this)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', req.user?.id).single();
  if (profile?.role !== 'government_admin' && profile?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  // Fetch all trips using government admin RLS visibility
  const { data: trips, error } = await supabase.from('transport_trips').select('*');
  if (error) throw new Error(error.message);

  const stats = {
    totalActiveTrips: trips.length,
    availableCapacityKg: trips.reduce((acc, t) => acc + Number(t.available_capacity_kg), 0),
    assignedTrips: trips.filter(t => t.status === 'ASSIGNED').length,
    inTransitTrips: trips.filter(t => t.status === 'IN_TRANSIT').length,
    completedTrips: trips.filter(t => t.status === 'COMPLETED').length,
    backhaulOpportunities: trips.filter(t => t.trip_type === 'BACKHAUL').length,
    estimatedLogisticsSavings: trips.reduce((acc, t) => acc + Number(t.saving_estimate || 0), 0),
  };

  return stats;
};
`;
serviceCode = serviceCode + analyticsMethod;
fs.writeFileSync('backend/src/services/transport.service.ts', serviceCode);

// Add to controller
let controllerCode = fs.readFileSync('backend/src/controllers/transport.controller.ts', 'utf-8');
const controllerMethod = `
export const getTransportAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await transportService.getTransportAnalytics(req);
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(err.message === 'Unauthorized' ? 403 : 500).json({ success: false, error: { message: err.message } });
  }
};
`;
controllerCode = controllerCode + controllerMethod;
fs.writeFileSync('backend/src/controllers/transport.controller.ts', controllerCode);

// Add to routes
let routesCode = fs.readFileSync('backend/src/routes/transport.routes.ts', 'utf-8');
routesCode = routesCode.replace(/assignTransport\n\} from '\.\.\/controllers\/transport\.controller';/, "assignTransport,\n  getTransportAnalytics\n} from '../controllers/transport.controller';");
routesCode = routesCode.replace(/export default router;/, "router.get('/analytics', requireAuth, getTransportAnalytics);\n\nexport default router;");
fs.writeFileSync('backend/src/routes/transport.routes.ts', routesCode);

