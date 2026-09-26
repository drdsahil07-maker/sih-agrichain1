import express from "express";
import { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import app from "./src/app";

dotenv.config();

// Sanitize any malformed environment variables injected with leading '=' or quotes
if (process.env.VITE_SUPABASE_URL) {
  let cleaned = process.env.VITE_SUPABASE_URL.trim();
  while (cleaned.startsWith('=')) cleaned = cleaned.slice(1).trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) cleaned = cleaned.slice(1, -1).trim();
  process.env.VITE_SUPABASE_URL = cleaned;
} else {
  process.env.VITE_SUPABASE_URL = 'https://abjhusvnynwvjbiwtxho.supabase.co';
}
if (process.env.VITE_SUPABASE_ANON_KEY) {
  let cleaned = process.env.VITE_SUPABASE_ANON_KEY.trim();
  while (cleaned.startsWith('=')) cleaned = cleaned.slice(1).trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) cleaned = cleaned.slice(1, -1).trim();
  process.env.VITE_SUPABASE_ANON_KEY = cleaned;
} else {
  process.env.VITE_SUPABASE_ANON_KEY = 'sb_publishable_JA52E1ro6ibUVSm5Bb3G1Q_mqRuKJ6l';
}

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // ==========================================
  // VITE OR STATIC FRONTEND SERVING
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // In Express v4
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AgriChain] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start AgriChain server:", err);
  process.exit(1);
});
