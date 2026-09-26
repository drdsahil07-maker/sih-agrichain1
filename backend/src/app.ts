import express from 'express';
import apiRoutes from './routes';

const app = express();

app.use(express.json({ limit: '10mb' }));

// Mount all API routes
app.use('/api', apiRoutes);

export default app;
