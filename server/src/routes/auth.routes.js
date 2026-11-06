import { Router } from 'express';
import { validate } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { login, me } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
