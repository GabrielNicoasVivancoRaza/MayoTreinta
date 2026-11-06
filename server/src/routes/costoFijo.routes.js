import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { costoFijoCreateSchema, costoFijoUpdateSchema } from '../schemas/costoFijo.schema.js';
import { activoSchema } from '../schemas/shared.schema.js';
import controller from '../controllers/costoFijo.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', validate(costoFijoCreateSchema), asyncHandler(controller.create));
router.put('/:id', validate(costoFijoUpdateSchema), asyncHandler(controller.update));
router.patch('/:id/activo', validate(activoSchema), asyncHandler(controller.setActivo));

export default router;
