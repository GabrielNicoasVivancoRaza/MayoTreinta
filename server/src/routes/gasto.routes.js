import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { gastoCreateSchema, gastoUpdateSchema } from '../schemas/gasto.schema.js';
import controller from '../controllers/gasto.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', validate(gastoCreateSchema), asyncHandler(controller.create));
router.put('/:id', validate(gastoUpdateSchema), asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

export default router;
