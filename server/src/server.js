import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedAdmin } from './utils/seedAdmin.js';
import { seedEventosEstacionales } from './utils/seedEventosEstacionales.js';

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();
  await seedAdmin();
  await seedEventosEstacionales();
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Error al iniciar el servidor', err);
  process.exit(1);
});
