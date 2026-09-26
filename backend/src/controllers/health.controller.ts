import { Request, Response } from 'express';

export const checkHealth = (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "AgriChain Compiler",
    tagline: "WE DON'T ELIMINATE PEOPLE. WE ELIMINATE FORCED DEPENDENCY.",
    serverTime: new Date().toISOString(),
  });
};
