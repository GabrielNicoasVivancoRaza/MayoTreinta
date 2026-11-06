import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export async function seedAdmin() {
  const existing = await User.countDocuments();
  if (existing > 0) return;

  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn(
      'No hay usuarios y faltan ADMIN_EMAIL/ADMIN_PASSWORD en .env: no se creo ningun admin.'
    );
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    nombre: ADMIN_NOMBRE || 'Administrador',
    rol: 'admin',
  });
  console.log(`Admin inicial creado: ${ADMIN_EMAIL}`);
}
