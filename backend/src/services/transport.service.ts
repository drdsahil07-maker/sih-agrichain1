import { AuthRequest, getScopedClient } from '../middleware/auth';

export const getTrips = async (req: AuthRequest, query: any) => {
  const supabase = getScopedClient(req);
  let dbQuery = supabase.from('transport_trips').select('*').order('created_at', { ascending: false });
  
  if (query.status) {
    dbQuery = dbQuery.eq('status', query.status);
  }
  if (query.transporterId) {
    dbQuery = dbQuery.eq('transporter_id', query.transporterId);
  }
  
  const { data, error } = await dbQuery;
  if (error) throw new Error(error.message);
  return data.map(mapTripResponse);
};

export const getTripById = async (req: AuthRequest, id: string) => {
  const supabase = getScopedClient(req);
  const { data, error } = await supabase.from('transport_trips').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return mapTripResponse(data);
};

export const createTrip = async (req: AuthRequest, payload: any) => {
  const supabase = getScopedClient(req);
  
  const insertPayload = {
    transporter_id: req.user?.id,
    vehicle_type: payload.vehicleType,
    capacity_kg: payload.capacityKg,
    available_capacity_kg: payload.capacityKg,
    origin: payload.origin,
    destination: payload.destination,
    primary_route: payload.primaryRoute || `${payload.origin} -> ${payload.destination}`,
    return_route: payload.returnRoute || `${payload.destination} -> ${payload.origin}`,
    departure_time: payload.departureTime,
    trip_type: payload.tripType || 'PRIMARY',
    standard_rate_per_trip: payload.standardRatePerTrip || 0,
    discounted_backhaul_rate: payload.discountedBackhaulRate || 0,
    saving_estimate: payload.savingEstimate || 0,
    status: 'AVAILABLE'
  };

  const { data, error } = await supabase.from('transport_trips').insert(insertPayload).select().single();
  if (error) throw new Error(error.message);
  return mapTripResponse(data);
};

export const updateTripStatus = async (req: AuthRequest, tripId: string, status: string) => {
  const supabase = getScopedClient(req);
  const { data, error } = await supabase.from('transport_trips').update({ status }).eq('id', tripId).select().single();
  if (error) throw new Error(error.message);
  return mapTripResponse(data);
};

export const matchOptions = async (req: AuthRequest, poolId: string) => {
  const supabase = getScopedClient(req);
  
  // 1. Fetch Pool
  const { data: pool, error: poolErr } = await supabase.from('pools').select('*').eq('id', poolId).single();
  if (poolErr || !pool) throw new Error('Pool not found');
  
  if (!['ready', 'locked', 'forming'].includes(pool.status.toLowerCase())) {
     // Allow checking matches while forming, but typically done at ready
     // We won't block querying options based on status strictly unless assigned
  }

  // 2. Fetch available trips
  const { data: trips, error: tripsErr } = await supabase.from('transport_trips').select('*').eq('status', 'AVAILABLE');
  if (tripsErr) throw new Error(tripsErr.message);

  const poolOrigin = pool.cluster_name;
  const poolDest = pool.destination;
  const requiredQty = pool.current_quantity_kg;

  // 3. Score matching
  const options = [];
  
  for (const trip of trips) {
    if (Number(trip.available_capacity_kg) < Number(requiredQty)) continue; // Must have capacity
    
    let score = 50; // base score
    
    // Origin/Destination match
    const isOriginMatch = trip.origin.toLowerCase().includes(poolOrigin.toLowerCase()) || poolOrigin.toLowerCase().includes(trip.origin.toLowerCase());
    const isDestMatch = trip.destination.toLowerCase().includes(poolDest.toLowerCase()) || poolDest.toLowerCase().includes(trip.destination.toLowerCase());
    
    if (isOriginMatch) score += 15;
    if (isDestMatch) score += 15;
    
    if (trip.trip_type === 'BACKHAUL') score += 10;
    if (Number(trip.available_capacity_kg) === Number(requiredQty)) score += 10;
    
    // Very basic distance/cost estimation
    const costEstimate = trip.trip_type === 'BACKHAUL' ? 
      (trip.discounted_backhaul_rate || requiredQty * 2) : 
      (trip.standard_rate_per_trip || requiredQty * 4);

    options.push({
      trip: mapTripResponse(trip),
      matchScore: Math.min(score, 100),
      estimatedCost: costEstimate,
      estimatedSavings: trip.saving_estimate || (requiredQty * 4 - costEstimate), // standard minus actual
      isBackhaul: trip.trip_type === 'BACKHAUL',
      scoreBreakdown: {
        route: (isOriginMatch && isDestMatch) ? 30 : (isOriginMatch || isDestMatch) ? 15 : 0,
        capacity: Number(trip.available_capacity_kg) === Number(requiredQty) ? 20 : 10,
        backhaul: trip.trip_type === 'BACKHAUL' ? 10 : 0
      }
    });
  }
  
  options.sort((a, b) => b.matchScore - a.matchScore);
  return options;
};

export const assignTransport = async (req: AuthRequest, poolId: string, tripId: string) => {
  const supabase = getScopedClient(req);
  
  // Call the secure RPC function to atomically lock, validate, and assign
  const { data, error } = await supabase.rpc('assign_transport_trip_safely', {
    p_pool_id: poolId,
    p_trip_id: tripId
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: 'Transport assigned successfully', assignment: data };
};

function mapTripResponse(t: any) {
  return {
    id: t.id,
    transporterId: t.transporter_id,
    vehicleType: t.vehicle_type,
    capacityKg: Number(t.capacity_kg),
    availableCapacityKg: Number(t.available_capacity_kg),
    origin: t.origin,
    destination: t.destination,
    primaryRoute: t.primary_route,
    returnRoute: t.return_route,
    departureTime: t.departure_time,
    tripType: t.trip_type,
    status: t.status,
    standardRatePerTrip: Number(t.standard_rate_per_trip),
    discountedBackhaulRate: Number(t.discounted_backhaul_rate),
    savingEstimate: Number(t.saving_estimate),
    createdAt: t.created_at
  };
}

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
