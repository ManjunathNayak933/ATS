import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJobStatus,
  deleteJob
} from '../controllers/jobs.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getJobs);
router.get('/:jobId', getJobById);
router.post('/', createJob);
router.patch('/:jobId', updateJobStatus);
router.delete('/:jobId', deleteJob);

export default router;
