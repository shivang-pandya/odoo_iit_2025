const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Travel', 'Food', 'Accommodation', 'Transport', 'Office Supplies', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  receipt: {
    data: Buffer,
    contentType: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvalFlow: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sequence: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    comments: String,
    actionDate: Date
  }],
  currentApprovalStep: {
    type: Number,
    default: 1
  },
  appliedRule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalRule'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
