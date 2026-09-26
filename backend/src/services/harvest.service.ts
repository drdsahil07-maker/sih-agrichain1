import { AuthRequest, getScopedClient } from '../middleware/auth';
import { QualityGrade } from '../../../shared/types';
import { state } from '../data/store';

export const getHarvests = async (req: AuthRequest) => {
  const supabase = getScopedClient(req);
  
  const { data, error } = await supabase
    .from('harvests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') {
       throw new Error("Table 'harvests' does not exist. Please run migration 001_create_harvests.sql");
    }
    throw new Error(error.message);
  }

  return data.map(h => ({
    id: h.id,
    farmerId: h.farmer_id,
    farmerName: h.farmer_name || 'Ramesh Patel (Farmer)',
    crop: h.crop,
    quantityKg: Number(h.quantity_kg),
    location: h.location,
    harvestDate: h.harvest_date,
    sellingWindow: h.selling_window,
    minAcceptablePrice: Number(h.min_acceptable_price),
    qualityGrade: h.quality_grade as QualityGrade,
    status: h.status,
    createdAt: h.created_at
  }));
};

export const createHarvest = async (req: AuthRequest, data: any) => {
  const supabase = getScopedClient(req);
  
  if (!req.user || !req.user.id) {
    throw new Error("Authenticated user required to create a harvest");
  }

  const farmerId = req.user.id;
  
  // If the frontend passed farmerId, ensure it matches the authenticated user
  if (data.farmerId && data.farmerId !== farmerId) {
    throw new Error("Cannot create harvest for another farmer.");
  }

  // Fetch the farmer's profile to get their real name if not provided
  let farmerName = data.farmerName;
  if (!farmerName) {
     const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', farmerId).single();
     farmerName = profile?.full_name || req.user.name || 'Ramesh Patel (Farmer)';
  }

  const {
    crop,
    quantityKg,
    location,
    minAcceptablePrice,
    qualityGrade = 'Grade A',
    sellingWindow = 'Tomorrow Morning',
    harvestDate = new Date().toISOString().split('T')[0]
  } = data;

  const baseInsertData: any = {
    farmer_id: farmerId,
    crop,
    quantity_kg: Number(quantityKg),
    location,
    harvest_date: harvestDate,
    selling_window: sellingWindow,
    min_acceptable_price: Number(minAcceptablePrice),
    quality_grade: qualityGrade,
    status: 'compiled'
  };

  let result: any = null;
  let insertError: any = null;

  // Try inserting with farmer_name first
  const tryWithName = await supabase
    .from('harvests')
    .insert({ ...baseInsertData, farmer_name: farmerName })
    .select()
    .single();

  if (tryWithName.error && tryWithName.error.message.includes('farmer_name')) {
    // Column farmer_name does not exist on table yet, insert without it
    const tryWithoutName = await supabase
      .from('harvests')
      .insert(baseInsertData)
      .select()
      .single();
    result = tryWithoutName.data;
    insertError = tryWithoutName.error;
  } else {
    result = tryWithName.data;
    insertError = tryWithName.error;
  }

  if (insertError) {
    if (insertError.code === '42P01') {
       throw new Error("Table 'harvests' does not exist. Please run migration 001_create_harvests.sql");
    }
    throw new Error(insertError.message);
  }

  return {
    id: result.id,
    farmerId: result.farmer_id,
    farmerName: result.farmer_name || farmerName || 'Unknown Farmer',
    crop: result.crop,
    quantityKg: Number(result.quantity_kg),
    location: result.location,
    harvestDate: result.harvest_date,
    sellingWindow: result.selling_window,
    minAcceptablePrice: Number(result.min_acceptable_price),
    qualityGrade: result.quality_grade as QualityGrade,
    status: result.status,
    createdAt: result.created_at
  };
};
