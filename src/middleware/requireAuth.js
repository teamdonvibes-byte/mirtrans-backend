import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing_token' });

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET); // { userId, telegramId }
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

export function requireAdmin(req, res, next) {
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  if (!adminId || String(req.auth.telegramId) !== String(adminId)) {
    return res.status(403).json({ error: 'admin_only' });
  }
  next();
}
