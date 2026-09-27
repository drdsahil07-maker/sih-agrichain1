import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || 'https://abjhusvnynwvjbiwtxho.supabase.co').replace(/^=+/, '').trim();
  const supabaseAnonKey = (process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JA52E1ro6ibUVSm5Bb3G1Q_mqRuKJ6l').replace(/^=+/, '').trim();

  return {
    root: '.',
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
  };
});
