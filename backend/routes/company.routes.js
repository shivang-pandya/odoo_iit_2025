const express = require('express');
const router = express.Router();
const { getCompany, updateCompany } = require('../controllers/company.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/:id')
  .get(getCompany)
  .put(authorize('Admin'), updateCompany);

module.exports = router;
