const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL.replace(/^=/, ''), 
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verify() {
  console.log("Checking RPC...");
  const { data: rpc, error: rpcErr } = await supabase.rpc('assign_transport_trip_safely', {
    p_pool_id: '00000000-0000-0000-0000-000000000000',
    p_trip_id: '00000000-0000-0000-0000-000000000000'
  });
  if (rpcErr) console.error("RPC Error:", rpcErr.message);
  else console.log("RPC exists.");
}

verify();
