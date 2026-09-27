import express from 'express';
import apiRoutes from './routes';
import { requestLogger, errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Mount all API routes
app.use('/api', apiRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
