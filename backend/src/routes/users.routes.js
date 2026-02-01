import express from 'express';
import {
  getCompany,
  updateCompany,
  getTeam,
  addTeamMember,
  removeTeamMember
} from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/company', getCompany);
router.patch('/company', updateCompany);
router.get('/team', getTeam);
router.post('/team', addTeamMember);
router.delete('/team/:userId', removeTeamMember);

export default router;
