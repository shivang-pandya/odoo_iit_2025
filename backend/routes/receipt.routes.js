const express = require('express');
const router = express.Router();
const { getReceipt } = require('../controllers/expense.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:expenseId', protect, getReceipt);

module.exports = router;
