const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL.replace(/^=/, ''), 
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verify() {
  console.log("Checking transport_trips...");
  const { data: trips, error: tripsErr } = await supabase.from('transport_trips').select('id').limit(1);
  if (tripsErr) console.error("Trips Error:", tripsErr.message);
  else console.log("transport_trips exists.");

  console.log("Checking pools.trip_id...");
  const { data: pools, error: poolsErr } = await supabase.from('pools').select('trip_id').limit(1);
  if (poolsErr) console.error("Pools Error:", poolsErr.message);
  else console.log("pools.trip_id exists.");
}

verify();
