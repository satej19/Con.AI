import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/authenticate';
import * as aiController from '../controllers/ai.controller';

const router = Router();

router.use(authenticate);

router.post('/chat', asyncHandler(aiController.chat));

export default router;
