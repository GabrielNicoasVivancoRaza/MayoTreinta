import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ventaCreateSchema, ventaUpdateSchema, pagoCreateSchema } from '../schemas/venta.schema.js';
import * as controller from '../controllers/venta.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', validate(ventaCreateSchema), asyncHandler(controller.create));
router.put('/:id', validate(ventaUpdateSchema), asyncHandler(controller.update));
router.post('/:id/pagos', validate(pagoCreateSchema), asyncHandler(controller.addPago));
router.post('/:id/cancelar', asyncHandler(controller.cancelar));

export default router;
