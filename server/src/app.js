import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import insumoRoutes from './routes/insumo.routes.js';
import productoRoutes from './routes/producto.routes.js';
import costoFijoRoutes from './routes/costoFijo.routes.js';
import expenseCategoryRoutes from './routes/expenseCategory.routes.js';
import disenoRoutes from './routes/diseno.routes.js';
import gastoRoutes from './routes/gasto.routes.js';
import compraInsumoRoutes from './routes/compraInsumo.routes.js';
import inventoryMovementRoutes from './routes/inventoryMovement.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import reportesRoutes from './routes/reportes.routes.js';
import puntoEquilibrioRoutes from './routes/puntoEquilibrio.routes.js';
import proyeccionRoutes from './routes/proyeccion.routes.js';
import eventoEstacionalRoutes from './routes/eventoEstacional.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/insumos', insumoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/costos-fijos', costoFijoRoutes);
app.use('/api/categorias-gasto', expenseCategoryRoutes);
app.use('/api/disenos', disenoRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/compras-insumo', compraInsumoRoutes);
app.use('/api/movimientos-inventario', inventoryMovementRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/punto-equilibrio', puntoEquilibrioRoutes);
app.use('/api/proyecciones', proyeccionRoutes);
app.use('/api/eventos-estacionales', eventoEstacionalRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
