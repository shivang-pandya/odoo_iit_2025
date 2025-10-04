const express = require('express');
const router = express.Router();
const { 
  createApprovalRule, 
  getApprovalRules, 
  getApprovalRule, 
  updateApprovalRule, 
  deleteApprovalRule 
} = require('../controllers/approvalRule.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('Admin'));

router.route('/')
  .get(getApprovalRules)
  .post(createApprovalRule);

router.route('/:id')
  .get(getApprovalRule)
  .put(updateApprovalRule)
  .delete(deleteApprovalRule);

module.exports = router;
