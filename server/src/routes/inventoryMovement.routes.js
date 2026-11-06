import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { movimientoManualCreateSchema } from '../schemas/inventoryMovement.schema.js';
import * as controller from '../controllers/inventoryMovement.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(controller.list));
router.post('/', validate(movimientoManualCreateSchema), asyncHandler(controller.createManual));

export default router;
