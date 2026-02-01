import express from 'express';
import {
  getCandidateById,
  updateCandidateStatus,
  bulkUpdateCandidates,
  processInterviewRecording,
  sendEmailToCandidate
} from '../controllers/candidates.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/:candidateId', getCandidateById);
router.patch('/:candidateId/status', updateCandidateStatus);
router.post('/bulk-update', bulkUpdateCandidates);
router.post('/:candidateId/interview-recording', processInterviewRecording);
router.post('/:candidateId/send-email', sendEmailToCandidate);

export default router;
