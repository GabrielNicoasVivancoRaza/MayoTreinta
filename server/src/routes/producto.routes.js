import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { productoCreateSchema, productoUpdateSchema } from '../schemas/producto.schema.js';
import { variantCreateSchema, variantUpdateSchema } from '../schemas/variant.schema.js';
import { activoSchema } from '../schemas/shared.schema.js';
import * as productoController from '../controllers/producto.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', asyncHandler(productoController.list));
router.get('/:id', asyncHandler(productoController.getById));
router.post('/', validate(productoCreateSchema), asyncHandler(productoController.create));
router.put('/:id', validate(productoUpdateSchema), asyncHandler(productoController.update));
router.patch(
  '/:id/activo',
  validate(activoSchema),
  asyncHandler(productoController.setActivo)
);

router.get('/:productoId/variantes', asyncHandler(productoController.listVariantes));
router.post(
  '/:productoId/variantes',
  validate(variantCreateSchema),
  asyncHandler(productoController.createVariante)
);
router.put(
  '/:productoId/variantes/:varianteId',
  validate(variantUpdateSchema),
  asyncHandler(productoController.updateVariante)
);
router.patch(
  '/:productoId/variantes/:varianteId/activo',
  validate(activoSchema),
  asyncHandler(productoController.setActivoVariante)
);

export default router;
