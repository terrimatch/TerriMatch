import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { supabase } from '../src/config/supabaseClient.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default app;
