import { supabase } from '../lib/supabase';
import { authService } from '../auth/authService';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(options.headers || {});
  
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  } else {
    const curUser = authService.getCurrentUser();
    if (curUser?.token) {
      headers.set('Authorization', `Bearer ${curUser.token}`);
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
