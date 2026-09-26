const { createClient } = require('@supabase/supabase-js');
let url = process.env.VITE_SUPABASE_URL;
while(url.startsWith('=')) url = url.slice(1);
let key = process.env.VITE_SUPABASE_ANON_KEY;
while(key.startsWith('=')) key = key.slice(1);
const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.from('harvests').select('*').limit(1);
  console.log("Harvests query:", error || 'Table exists');
}
test();
