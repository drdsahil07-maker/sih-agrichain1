const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL.replace(/^=/, ''), 
  process.env.VITE_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
  console.log("exec_sql:", data, error?.message);
}
check();
