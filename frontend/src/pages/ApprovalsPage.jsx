import { useState, useEffect } from 'react';
import api from '../services/api';
import Loading from '../components/Loading';

const ApprovalsPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/expenses/pending-approval');
      setExpenses(data.expenses);
    } catch (err) {
      setError('Failed to fetch expenses awaiting approval');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleApprovalAction = async (expenseId, action) => {
    let comments = '';
    if (action === 'reject') {
      comments = prompt('Please provide a reason for rejection:');
      if (comments === null) return; // User cancelled the prompt
    }

    try {
      await api.put(`/expenses/${expenseId}/approve`, { action, comments });
      // Refresh the list after action
      fetchPendingApprovals();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} expense`);
    }
  };

  const handleViewReceipt = async (expenseId) => {
    try {
      const response = await api.get(`/receipts/${expenseId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      alert('Failed to load receipt: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">Approvals to Review</h1>
      {expenses.length === 0 ? (
        <p className="text-gray-400">No expenses are currently waiting for your approval.</p>
      ) : (
        <div className="space-y-6">
          {expenses.map(expense => (
            <ApprovalCard key={expense._id} expense={expense} onAction={handleApprovalAction} onViewReceipt={handleViewReceipt} />
          ))}
        </div>
      )}
    </div>
  );
};

const ApprovalCard = ({ expense, onAction, onViewReceipt }) => (
  <div className="bg-gray-800 rounded-lg shadow-lg p-6 transition duration-300 hover:shadow-indigo-500/30">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <div>
        <p className="text-sm text-gray-400">{expense.employee.name}</p>
        <p className="text-xl font-bold text-white">{expense.description}</p>
        <p className="text-gray-300">{new Date(expense.date).toLocaleDateString()}</p>
        {expense.receipt && (
          <button 
            onClick={() => onViewReceipt(expense._id)} 
            className="text-indigo-400 hover:text-indigo-300 transition duration-300 underline text-sm mt-2"
          >
            View Receipt
          </button>
        )}
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-white">{`${expense.amount.toFixed(2)} ${expense.currency}`}</p>
        {expense.convertedAmount && (
          <p className="text-md text-indigo-400">{`~ ${expense.convertedAmount.toFixed(2)} ${expense.managerCurrency}`}</p>
        )}
      </div>
      <div className="flex justify-center md:justify-end space-x-4">
        <button onClick={() => onAction(expense._id, 'reject')} className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition">
          Reject
        </button>
        <button onClick={() => onAction(expense._id, 'approve')} className="px-6 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition">
          Approve
        </button>
      </div>
    </div>
  </div>
);

export default ApprovalsPage;
