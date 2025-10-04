const express = require('express');
const router = express.Router();
const { 
  createExpense, 
  getExpenses, 
  getExpense, 
  approveExpense,
  getPendingApprovals 
} = require('../controllers/expense.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/fileUpload');

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(upload.single('receipt'), createExpense);

router.get('/pending-approval', authorize('Manager', 'Admin'), getPendingApprovals);

router.route('/:id')
  .get(getExpense);

router.put('/:id/approve', authorize('Manager', 'Admin'), approveExpense);

module.exports = router;
