const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL.replace(/^=/, ''), 
  process.env.VITE_SUPABASE_ANON_KEY
);

async function verify() {
  const { data: roleData, error: roleErr } = await supabase.rpc('exec_sql', { sql: 'SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = \'public.profiles\'::regclass AND conname LIKE \'%role%\'' });
  if (roleErr) console.error("Role Error:", roleErr.message);
  else console.log("Role Constraints:", roleData);
}

verify();
