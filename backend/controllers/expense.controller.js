const Expense = require('../models/Expense');
const User = require('../models/User');
const { convertCurrency } = require('../utils/currency');
const ApprovalRule = require('../models/ApprovalRule');

// @desc    Submit expense
// @route   POST /api/expenses
// @access  Private (Employee)
exports.createExpense = async (req, res) => {
  try {
    const { amount, currency, category, description, date } = req.body;

    const employee = await User.findById(req.user.id).populate('manager');
    
    // Find the most specific approval rule
    const applicableRule = await ApprovalRule.findOne({
      company: req.user.company,
      isActive: true,
      amountThreshold: { $lte: amount }
    }).sort({ amountThreshold: -1 });

    let approvalFlow = [];
    let currentApprovalStep = 0;

    if (applicableRule) {
      let sequence = 1;

      // Add manager as the first approver if required
      if (applicableRule.isManagerDefaultApprover && employee.manager) {
        approvalFlow.push({
          approver: employee.manager._id,
          sequence: sequence,
          status: 'Pending'
        });
        if (applicableRule.isSequential) sequence++;
      }

      // Add the other approvers from the rule
      applicableRule.approvers.forEach(approver => {
        approvalFlow.push({
          approver: approver.user,
          sequence: applicableRule.isSequential ? sequence++ : sequence,
          status: 'Pending'
        });
      });
    } else if (employee.manager) {
      // FALLBACK: If no approval rule is found, assign to the employee's manager
      approvalFlow.push({
        approver: employee.manager._id,
        sequence: 1,
        status: 'Pending'
      });
    }

    // If a flow exists, set the initial step
    if (approvalFlow.length > 0) {
      currentApprovalStep = 1;
    }

    const expense = await Expense.create({
      employee: req.user.id,
      company: req.user.company,
      amount,
      currency,
      category,
      description,
      date,
      receipt: req.file ? { data: req.file.buffer, contentType: req.file.mimetype } : undefined,
      approvalFlow,
      appliedRule: applicableRule?._id,
      currentApprovalStep,
      // If no approval flow is defined, default to 'Pending' and assign to manager or an Admin.
      // This prevents auto-approval.
      status: 'Pending'
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('employee', 'name email')
      .populate('approvalFlow.approver', 'name email role');

    res.status(201).json({
      success: true,
      expense: populatedExpense
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all expenses for the logged-in user (MY expenses only)
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    // ALL users (Employee, Manager, Admin) see ONLY their own submitted expenses
    const expenses = await Expense.find({ employee: req.user.id })
      .populate('employee', 'name email')
      .populate('approvalFlow.approver', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employee', 'name email')
      .populate('approvalFlow.approver', 'name email role')
      .populate('appliedRule');

    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    res.json({
      success: true,
      expense
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Approve/Reject expense
// @route   PUT /api/expenses/:id/approve
// @access  Private (Manager/Admin)
exports.approveExpense = async (req, res) => {
  try {
    const { action, comments } = req.body; // action: 'approve' or 'reject'

    const expense = await Expense.findById(req.params.id)
      .populate('approvalFlow.approver')
      .populate('appliedRule');

    if (!expense) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expense not found' 
      });
    }

    // Find current approval step for this approver
    const currentStep = expense.approvalFlow.find(
      step => step.approver._id.toString() === req.user.id.toString() && 
              step.sequence === expense.currentApprovalStep
    );

    if (!currentStep) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to approve this expense at this stage' 
      });
    }

    // Update approval step
    currentStep.status = action === 'approve' ? 'Approved' : 'Rejected';
    currentStep.comments = comments;
    currentStep.actionDate = new Date();

    if (action === 'reject') {
      expense.status = 'Rejected';
    } else {
      const rule = expense.appliedRule;
      
      // Check for specific approver rule - if this specific person approves, auto-approve
      if (rule && rule.approvalType === 'specific' && rule.specificApprover) {
        if (req.user.id.toString() === rule.specificApprover.toString()) {
          expense.status = 'Approved';
          await expense.save();
          const updatedExpense = await Expense.findById(expense._id)
            .populate('employee', 'name email')
            .populate('approvalFlow.approver', 'name email role');
          return res.json({ success: true, expense: updatedExpense });
        }
      }
      
      // Check for hybrid rule - specific approver OR percentage
      if (rule && rule.approvalType === 'hybrid' && rule.specificApprover) {
        if (req.user.id.toString() === rule.specificApprover.toString()) {
          expense.status = 'Approved';
          await expense.save();
          const updatedExpense = await Expense.findById(expense._id)
            .populate('employee', 'name email')
            .populate('approvalFlow.approver', 'name email role');
          return res.json({ success: true, expense: updatedExpense });
        }
      }
      
      // Check if this is the last approval step for sequential flow
      const nextStep = expense.approvalFlow.find(
        step => step.sequence === expense.currentApprovalStep + 1
      );

      if (nextStep && rule && rule.isSequential) {
        expense.currentApprovalStep += 1;
      } else {
        // Check percentage-based approval
        const totalApprovers = expense.approvalFlow.length;
        const approvedCount = expense.approvalFlow.filter(s => s.status === 'Approved').length;
        const approvalPercentage = (approvedCount / totalApprovers) * 100;

        if (rule && (rule.approvalType === 'percentage' || rule.approvalType === 'hybrid')) {
          if (approvalPercentage >= rule.percentageRequired) {
            expense.status = 'Approved';
          }
        } else if (!nextStep) {
          // For 'all' type, all must approve
          expense.status = 'Approved';
        }
      }
    }

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id)
      .populate('employee', 'name email')
      .populate('approvalFlow.approver', 'name email role');

    res.json({
      success: true,
      expense: updatedExpense
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get expenses pending approval for current user
// @route   GET /api/expenses/pending-approval
// @access  Private (Manager/Admin)
exports.getPendingApprovals = async (req, res) => {
  try {
    const manager = await User.findById(req.user.id);

    const expenses = await Expense.find({
      'approvalFlow': {
        $elemMatch: {
          approver: req.user.id,
          status: 'Pending'
        }
      },
      status: 'Pending'
    })
    .populate('employee', 'name email')
    .populate('approvalFlow.approver', 'name email role')
    .sort({ createdAt: -1 });

    // Filter to only show expenses where it's the user's turn
    let pendingForUser = expenses.filter(expense => {
      const userStep = expense.approvalFlow.find(
        step => step.approver._id.toString() === req.user.id.toString()
      );
      return userStep && userStep.sequence === expense.currentApprovalStep;
    });

    // Convert amounts to manager's currency
    if (manager.currency) {
      pendingForUser = await Promise.all(pendingForUser.map(async (expense) => {
        const convertedAmount = await convertCurrency(expense.amount, expense.currency, manager.currency);
        return {
          ...expense.toObject(),
          convertedAmount,
          managerCurrency: manager.currency
        };
      }));
    }

    res.json({
      success: true,
      count: pendingForUser.length,
      expenses: pendingForUser
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get receipt for an expense
// @route   GET /api/receipts/:expenseId
// @access  Private
exports.getReceipt = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.expenseId).populate('employee');

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (!expense.receipt || !expense.receipt.data) {
      return res.status(404).json({ success: false, message: 'No receipt attached to this expense' });
    }

    // Authorization check
    const isEmployee = req.user.id.toString() === expense.employee._id.toString();
    const isAdmin = req.user.role === 'Admin' && req.user.company.toString() === expense.company.toString();
    const isManagerInFlow = expense.approvalFlow && expense.approvalFlow.some(step => step.approver && step.approver.toString() === req.user.id.toString());

    if (!isEmployee && !isAdmin && !isManagerInFlow) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this receipt' });
    }

    res.set('Content-Type', expense.receipt.contentType);
    res.send(expense.receipt.data);
  } catch (error) {
    console.error('Receipt fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
