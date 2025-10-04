const mongoose = require('mongoose');

const approverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sequence: {
    type: Number,
    required: true
  }
}, { _id: false });

const approvalRuleSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  // Determines if the flow is sequential (true) or parallel (false)
  isSequential: {
    type: Boolean,
    default: false
  },
  // If true, the expense submitter's manager is the first approver
  isManagerDefaultApprover: {
    type: Boolean,
    default: false
  },
  // Approval rule type: 'all' (all must approve), 'percentage' (X% must approve), 'specific' (specific person), 'hybrid' (combination)
  approvalType: {
    type: String,
    enum: ['all', 'percentage', 'specific', 'hybrid'],
    default: 'all'
  },
  // For percentage-based approval conditions
  percentageRequired: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  // For specific approver rule - if this person approves, auto-approve
  specificApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // The list of designated approvers
  approvers: [approverSchema],
  // The rule applies to expenses greater than or equal to this amount
  amountThreshold: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);
