const fs = require('fs');
let code = fs.readFileSync('backend/src/services/transport.service.ts', 'utf-8');

const regex = /export const assignTransport = async \([^)]*\) => \{[\s\S]*?(?=function mapTripResponse)/;

const newCode = `export const assignTransport = async (req: AuthRequest, poolId: string, tripId: string) => {
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

`;

code = code.replace(regex, newCode);

fs.writeFileSync('backend/src/services/transport.service.ts', code);
