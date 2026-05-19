import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/leadController';
import { authenticate, authorize } from '../middleware/auth';
import {
  createLeadValidator,
  updateLeadValidator,
  leadFiltersValidator,
} from '../validators';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/export', exportLeadsCSV);
router.get('/stats', getLeadStats);
router.get('/', leadFiltersValidator, validate, getLeads);
router.get('/:id', getLeadById);
router.post('/', createLeadValidator, validate, createLead);
router.put('/:id', updateLeadValidator, validate, updateLead);
router.delete('/:id', authorize('admin'), deleteLead);

export default router;
