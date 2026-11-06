import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { obtenerDashboard } from '../controllers/dashboard.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(obtenerDashboard));

export default router;
