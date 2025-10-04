const ApprovalRule = require('../models/ApprovalRule');

// @desc    Create approval rule
// @route   POST /api/approval-rules
// @access  Private (Admin)
exports.createApprovalRule = async (req, res) => {
  try {
    const { name, amountThreshold, isSequential, isManagerDefaultApprover, approvalType, percentageRequired, specificApprover, approvers } = req.body;

    console.log('Creating approval rule:', { name, amountThreshold, isSequential, isManagerDefaultApprover, approvalType, percentageRequired, specificApprover, approvers });

    const rule = await ApprovalRule.create({
      company: req.user.company,
      name,
      amountThreshold,
      isSequential,
      isManagerDefaultApprover,
      approvalType,
      percentageRequired,
      specificApprover: specificApprover || null,
      approvers
    });

    const populatedRule = await ApprovalRule.findById(rule._id)
      .populate('approvers.user', 'name email role')
      .populate('specificApprover', 'name email role');

    console.log('Approval rule created successfully:', populatedRule);

    res.status(201).json({
      success: true,
      rule: populatedRule
    });
  } catch (error) {
    console.error('Error creating approval rule:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all approval rules for company
// @route   GET /api/approval-rules
// @access  Private (Admin)
exports.getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find({ company: req.user.company })
      .populate('approvers.user', 'name email role')
      .populate('specificApprover', 'name email role')
      .sort({ amountThreshold: 1 });

    res.json({
      success: true,
      count: rules.length,
      rules
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single approval rule
// @route   GET /api/approval-rules/:id
// @access  Private (Admin)
exports.getApprovalRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findById(req.params.id)
      .populate('approvers.user', 'name email role')
      .populate('specificApprover', 'name email role');

    if (!rule) {
      return res.status(404).json({ 
        success: false, 
        message: 'Approval rule not found' 
      });
    }

    res.json({
      success: true,
      rule
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update approval rule
// @route   PUT /api/approval-rules/:id
// @access  Private (Admin)
exports.updateApprovalRule = async (req, res) => {
  try {
    const { name, amountThreshold, isSequential, isManagerDefaultApprover, approvalType, percentageRequired, specificApprover, approvers, isActive } = req.body;

    let rule = await ApprovalRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ 
        success: false, 
        message: 'Approval rule not found' 
      });
    }

    rule.name = name;
    rule.amountThreshold = amountThreshold;
    rule.isSequential = isSequential;
    rule.isManagerDefaultApprover = isManagerDefaultApprover;
    rule.approvalType = approvalType;
    rule.percentageRequired = percentageRequired;
    rule.specificApprover = specificApprover || null;
    rule.approvers = approvers;
    rule.isActive = isActive !== undefined ? isActive : rule.isActive;

    await rule.save();

    rule = await ApprovalRule.findById(rule._id)
      .populate('approvers.user', 'name email role')
      .populate('specificApprover', 'name email role');

    res.json({
      success: true,
      rule
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete approval rule
// @route   DELETE /api/approval-rules/:id
// @access  Private (Admin)
exports.deleteApprovalRule = async (req, res) => {
  try {
    const rule = await ApprovalRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ 
        success: false, 
        message: 'Approval rule not found' 
      });
    }

    await rule.deleteOne();

    res.json({
      success: true,
      message: 'Approval rule deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
