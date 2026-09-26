const { createClient } = require('@supabase/supabase-js');
let url = process.env.VITE_SUPABASE_URL;
while(url.startsWith('=')) url = url.slice(1);
let key = process.env.VITE_SUPABASE_ANON_KEY;
while(key.startsWith('=')) key = key.slice(1);
const supabase = createClient(url, key);

async function test() {
  const email = `drdsahil07+${Date.now()}@gmail.com`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
    options: {
      data: {
        role: 'farmer',
        full_name: 'Test Farmer'
      }
    }
  });
  if (error) {
    console.error("Sign up failed:", error);
    return;
  }
  
  console.log(data.session?.access_token);
}
test();
