import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.activo) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
}
