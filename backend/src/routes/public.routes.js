import express from 'express';
import { getApplicationForm, submitApplication } from '../controllers/public.controller.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/form/:formUrl', getApplicationForm);
router.post('/apply/:formUrl', submitApplication);

export default router;
