const express = require('express');
const router = express.Router();
const { 
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser,
  getManagers 
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Manager'), getUsers)
  .post(authorize('Admin', 'Manager'), createUser);

router.get('/managers', getManagers);

router.route('/:id')
  .get(getUser)
  .put(authorize('Admin'), updateUser)
  .delete(authorize('Admin'), deleteUser);

module.exports = router;
