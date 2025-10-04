const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Create employee/manager
// @route   POST /api/users
// @access  Private (Admin/Manager)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, manager, isManagerApprover } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      company: req.user.company,
      manager,
      isManagerApprover: isManagerApprover || false
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        manager: user.manager,
        isManagerApprover: user.isManagerApprover
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all users in company
// @route   GET /api/users
// @access  Private (Admin/Manager)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ company: req.user.company })
      .select('-password')
      .populate('manager', 'name email role');

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('manager', 'name email role')
      .populate('company');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, manager, isManagerApprover } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    // Allow manager to be updated or removed (set to null)
    if (manager !== undefined) {
      user.manager = manager || null;
    }
    user.isManagerApprover = isManagerApprover !== undefined ? isManagerApprover : user.isManagerApprover;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        manager: user.manager,
        isManagerApprover: user.isManagerApprover
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get managers for dropdown
// @route   GET /api/users/managers
// @access  Private
exports.getManagers = async (req, res) => {
  try {
    const managers = await User.find({ 
      company: req.user.company,
      role: { $in: ['Manager', 'Admin'] }
    }).select('name email role');

    res.json({
      success: true,
      managers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
