import express from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/services', requireAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY id').all());
});

router.post('/services', requireAuth, requireAdmin, (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'title_required' });
  const info = db.prepare('INSERT INTO services (title, description) VALUES (?, ?)').run(title, description || null);
  res.json({ id: info.lastInsertRowid });
});

router.patch('/services/:id', requireAuth, requireAdmin, (req, res) => {
  const { active } = req.body;
  db.prepare('UPDATE services SET active = ? WHERE id = ?').run(active ? 1 : 0, req.params.id);
  res.json({ ok: true });
});

export default router;
