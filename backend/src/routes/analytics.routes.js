import express from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboardAnalytics);

export default router;
