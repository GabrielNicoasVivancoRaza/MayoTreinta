import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { obtener } from '../controllers/proyeccion.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(obtener));

export default router;
