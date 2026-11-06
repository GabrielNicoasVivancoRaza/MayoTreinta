import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { estadoResultados, estadoResultadosCsv, ventasCsv } from '../controllers/reportes.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/estado-resultados', asyncHandler(estadoResultados));
router.get('/estado-resultados/csv', asyncHandler(estadoResultadosCsv));
router.get('/ventas/csv', asyncHandler(ventasCsv));

export default router;
