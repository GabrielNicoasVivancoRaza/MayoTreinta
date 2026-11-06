import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { simuladorSchema } from '../schemas/puntoEquilibrio.schema.js';
import { obtener, simular } from '../controllers/puntoEquilibrio.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(obtener));
router.post('/simular', validate(simuladorSchema), asyncHandler(simular));

export default router;
