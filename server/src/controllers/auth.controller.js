import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase(), activo: true });
  if (!user) return res.status(401).json({ message: 'Credenciales invalidas' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Credenciales invalidas' });

  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: '12h',
  });

  res.json({
    token,
    user: { id: user._id, email: user.email, nombre: user.nombre, rol: user.rol },
  });
}

export async function me(req, res) {
  const { _id, email, nombre, rol } = req.user;
  res.json({ id: _id, email, nombre, rol });
}
