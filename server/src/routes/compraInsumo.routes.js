import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { compraInsumoCreateSchema } from '../schemas/compraInsumo.schema.js';
import * as controller from '../controllers/compraInsumo.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', validate(compraInsumoCreateSchema), asyncHandler(controller.create));

export default router;
