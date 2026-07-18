import express from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';
import { notifyAdmin } from '../telegramNotify.js';

const router = express.Router();

router.post('/requests', requireAuth, (req, res) => {
  const { serviceId, route, cargoDetails, phone } = req.body;
  if (!serviceId || !route || !phone) {
    return res.status(400).json({ error: 'service_route_phone_required' });
  }
  const service = db.prepare('SELECT id, title FROM services WHERE id = ? AND active = 1').get(serviceId);
  if (!service) return res.status(404).json({ error: 'service_not_found' });

  const info = db
    .prepare(`INSERT INTO requests (user_id, service_id, route, cargo_details, phone) VALUES (?, ?, ?, ?, ?)`)
    .run(req.auth.userId, serviceId, route, cargoDetails || null, phone);

  const lines = [
    '🔔 Новая заявка',
    `Услуга: ${service.title}`,
    `Направление: ${route}`,
    `Телефон: ${phone}`,
  ];
  if (cargoDetails) lines.push(`Груз: ${cargoDetails}`);
  notifyAdmin(lines.join('\n'));

  res.json({ id: info.lastInsertRowid, status: 'new' });
});

router.get('/requests/mine', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.*, s.title AS service_title
       FROM requests r JOIN services s ON s.id = r.service_id
       WHERE r.user_id = ? ORDER BY r.created_at DESC`
    )
    .all(req.auth.userId);
  res.json(rows);
});

router.get('/requests', requireAuth, requireAdmin, (req, res) => {
  const rows = db
    .prepare(
      `SELECT r.*, u.username, s.title AS service_title
       FROM requests r
       JOIN users u ON u.id = r.user_id
       JOIN services s ON s.id = r.service_id
       ORDER BY r.created_at DESC`
    )
    .all();
  res.json(rows);
});

router.patch('/requests/:id', requireAuth, requireAdmin, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE requests SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

export default router;
