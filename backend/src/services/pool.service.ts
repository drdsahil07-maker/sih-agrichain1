import { AuthRequest, getScopedClient } from '../middleware/auth';
import { QualityGrade } from '../../../shared/types';

export const suggestPools = async (req: AuthRequest, params: any) => {
  const supabase = getScopedClient(req);
  
  // 1. Fetch eligible harvests
  // We rely on RLS: we can see compiled/pending harvests.
  let query = supabase.from('harvests').select('*').in('status', ['compiled', 'pending']);
  if (params.crop) {
    query = query.eq('crop', params.crop);
  }
  const { data: harvests, error } = await query;
  if (error) throw new Error(error.message);

  // 2. Filter / Cluster / Calculate Compatibility
  const candidatePools: any[] = [];
  
  // Very simple deterministic clustering based on exact crop and quality match.
  // Group available harvests by location/quality.
  const groups: Record<string, any[]> = {};
  
  for (const h of harvests) {
    // Only match quality if requested, else group by quality
    const qGrade = params.qualityGrade || h.quality_grade;
    if (params.qualityGrade && h.quality_grade !== params.qualityGrade) continue;
    
    // Check selling window compatibility
    if (params.sellingWindow && h.selling_window !== params.sellingWindow) continue;

    const key = `${h.crop}_${qGrade}_${h.location}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(h);
  }

  const targetQty = params.quantityKg || 1000;

  for (const [key, groupHarvests] of Object.entries(groups)) {
    // Sort harvests by date descending or quantity descending
    groupHarvests.sort((a, b) => b.quantity_kg - a.quantity_kg);
    
    let currentQty = 0;
    const selectedMembers = [];
    
    for (const h of groupHarvests) {
      if (currentQty >= targetQty) break;
      
      const qtyToAdd = Math.min(Number(h.quantity_kg), targetQty - currentQty);
      selectedMembers.push({
        harvestId: h.id,
        farmerId: h.farmer_id,
        quantityKg: qtyToAdd,
        crop: h.crop,
        location: h.location,
        qualityGrade: h.quality_grade
      });
      currentQty += qtyToAdd;
    }
    
    if (selectedMembers.length > 0) {
      // Calculate match score
      let score = 50; // base score
      if (currentQty >= targetQty * 0.8) score += 20; // good quantity match
      if (currentQty === targetQty) score += 10;
      if (selectedMembers.every(m => m.qualityGrade === params.qualityGrade)) score += 20;
      
      // Transport savings estimate:
      // Say individual transport is 5 per kg, bulk is 2 per kg.
      const savings = 3; // Estimated savings per kg (e.g. 5 - 2)

      candidatePools.push({
        crop: params.crop || groupHarvests[0].crop,
        qualityGrade: params.qualityGrade || groupHarvests[0].quality_grade,
        targetQuantityKg: targetQty,
        currentQuantityKg: currentQty,
        destination: params.destination || 'Hub',
        clusterName: `Cluster-${groupHarvests[0].location}`,
        matchScore: Math.min(score, 100),
        estimatedSavings: savings,
        members: selectedMembers,
        requirementId: params.requirementId || null
      });
    }
  }

  return candidatePools;
};

export const createPoolWithMembers = async (req: AuthRequest, payload: any) => {
  const supabase = getScopedClient(req);
  const userRole = req.user?.role;
  
  if (!['distributor', 'buyer', 'aggregator', 'government_admin', 'admin'].includes(userRole)) {
    throw new Error('Unauthorized: Only authorized roles can create pools.');
  }

  // Generate a pool code
  const poolCode = `POOL-${Date.now().toString().slice(-6)}`;

  // 1. Create Pool
  const poolInsert = {
    pool_code: payload.poolCode || poolCode,
    requirement_id: payload.requirementId || null,
    created_by: req.user.id,
    crop: payload.crop,
    quality_grade: payload.qualityGrade,
    target_quantity_kg: payload.targetQuantityKg,
    current_quantity_kg: 0, // Will be updated by triggers
    cluster_name: payload.clusterName,
    destination: payload.destination,
    status: 'forming',
    estimated_savings: payload.estimatedSavings || 0,
    match_score: payload.matchScore || 0
  };

  const { data: pool, error: poolErr } = await supabase
    .from('pools')
    .insert(poolInsert)
    .select()
    .single();

  if (poolErr) throw new Error(`Pool creation failed: ${poolErr.message}`);

  // 2. Insert Pool Members
  if (payload.members && payload.members.length > 0) {
    const memberInserts = payload.members.map((m: any) => ({
      pool_id: pool.id,
      harvest_id: m.harvestId,
      committed_quantity_kg: m.quantityKg,
      status: 'active'
    }));

    const { error: membersErr } = await supabase
      .from('pool_members')
      .insert(memberInserts);

    if (membersErr) {
      // If a member fails (e.g. double booking idx_unique_active_harvest_pool or target quantity constraint),
      // we should rollback. Supabase REST doesn't support transactions easily, so we manually clean up.
      await supabase.from('pools').delete().eq('id', pool.id);
      throw new Error(`Failed to add members: ${membersErr.message}. Ensure harvest is not already in an active pool and target quantity is not exceeded.`);
    }
  }

  // 3. Return created pool
  return getPoolById(req, pool.id);
};

export const getPools = async (req: AuthRequest, query: any) => {
  const supabase = getScopedClient(req);
  let dbQuery = supabase.from('pools').select('*, pool_members(*)').order('created_at', { ascending: false });
  
  if (query.status) {
    dbQuery = dbQuery.eq('status', query.status);
  }
  
  const { data, error } = await dbQuery;
  if (error) throw new Error(error.message);
  
  return data.map(mapPoolResponse);
};

export const getPoolById = async (req: AuthRequest, id: string) => {
  const supabase = getScopedClient(req);
  const { data, error } = await supabase.from('pools').select('*, pool_members(*)').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(error.message);
  }
  return mapPoolResponse(data);
};

export const addHarvestToPool = async (req: AuthRequest, poolId: string, harvestId: string, quantityKg: number) => {
  const supabase = getScopedClient(req);
  
  // Must check if pool is locked
  const pool = await getPoolById(req, poolId);
  if (!pool) throw new Error('Pool not found');
  if (['locked', 'dispatched', 'completed', 'cancelled'].includes(pool.status)) {
    throw new Error(`Cannot add harvest. Pool status is ${pool.status}`);
  }
  
  if (pool.currentQuantityKg + quantityKg > pool.targetQuantityKg) {
    throw new Error('Adding this harvest exceeds the pool target quantity.');
  }

  const { error } = await supabase.from('pool_members').insert({
    pool_id: poolId,
    harvest_id: harvestId,
    committed_quantity_kg: quantityKg,
    status: 'active'
  });

  if (error) throw new Error(`Failed to add harvest: ${error.message}`);
  
  return getPoolById(req, poolId);
};

export const removeHarvestFromPool = async (req: AuthRequest, poolId: string, harvestId: string) => {
  const supabase = getScopedClient(req);
  const { error } = await supabase
    .from('pool_members')
    .update({ status: 'removed' })
    .eq('pool_id', poolId)
    .eq('harvest_id', harvestId)
    .eq('status', 'active');
    
  if (error) throw new Error(error.message);
  return getPoolById(req, poolId);
};

export const updatePoolStatus = async (req: AuthRequest, poolId: string, status: string) => {
  const supabase = getScopedClient(req);
  const { error } = await supabase.from('pools').update({ status }).eq('id', poolId);
  if (error) throw new Error(error.message);
  return getPoolById(req, poolId);
};

export const recalculateSavings = async (req: AuthRequest, poolId: string) => {
  const supabase = getScopedClient(req);
  const pool = await getPoolById(req, poolId);
  if (!pool) throw new Error('Pool not found');
  
  // Simple calculation: saving = currentQuantityKg * (individualRate - bulkRate)
  const savings = 3; // Estimated per kg 
  
  const { error } = await supabase.from('pools').update({ estimated_savings: savings }).eq('id', poolId);
  if (error) throw new Error(error.message);
  
  return getPoolById(req, poolId);
};

// Helper mapper to keep the frontend happy with camelCase
function mapPoolResponse(p: any) {
  return {
    id: p.id,
    poolCode: p.pool_code,
    requirementId: p.requirement_id,
    tripId: p.trip_id,
    createdBy: p.created_by,
    crop: p.crop,
    qualityGrade: p.quality_grade,
    targetQuantityKg: Number(p.target_quantity_kg),
    totalQuantityKg: Number(p.current_quantity_kg), // Alias for frontend
    farmerCount: (p.pool_members || []).length,
    currentQuantityKg: Number(p.current_quantity_kg),
    clusterName: p.cluster_name,
    destination: p.destination,
    status: p.status,
    estimatedSavings: Number(p.estimated_savings),
    matchScore: Number(p.match_score),
    createdAt: p.created_at,
    farmers: (p.pool_members || []).filter((m:any) => m.status === 'active').map((m: any) => ({
      memberId: m.id,
      harvestId: m.harvest_id,
      farmerId: m.farmer_id, // Not strictly needed if omitted in table but let's see
      quantityKg: Number(m.committed_quantity_kg),
      status: m.status
    }))
  };
}
