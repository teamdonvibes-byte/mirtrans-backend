import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import serviceRoutes from './routes/services.js';
import requestRoutes from './routes/requests.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', serviceRoutes);
app.use('/api', requestRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend listening on :${port}`));
