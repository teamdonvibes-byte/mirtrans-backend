import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { verifyTelegramInitData } from '../telegramAuth.js';

const router = express.Router();

router.post('/auth', (req, res) => {
  const { initData } = req.body;
  const maxAge = parseInt(process.env.INIT_DATA_MAX_AGE_SECONDS || '3600', 10);
  const tgUser = verifyTelegramInitData(initData, process.env.BOT_TOKEN, maxAge);

  if (!tgUser) return res.status(401).json({ error: 'invalid_init_data' });

  db.prepare(
    `INSERT INTO users (telegram_id, username) VALUES (?, ?)
     ON CONFLICT(telegram_id) DO UPDATE SET username = excluded.username`
  ).run(tgUser.id, tgUser.username || null);

  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(tgUser.id);

  const token = jwt.sign(
    { userId: user.id, telegramId: user.telegram_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const isAdmin = String(user.telegram_id) === String(process.env.ADMIN_TELEGRAM_ID);
  res.json({ token, user: { id: user.id, username: user.username }, isAdmin });
});

export default router;
