import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import ExpenseForm from '../components/ExpenseForm';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await api.get('/expenses');
        setExpenses(data.expenses);
      } catch (err) {
        setError('Failed to fetch expenses');
      }
      setLoading(false);
    };
    fetchExpenses();
  }, []);

  const handleExpenseCreated = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
  };

  const handleViewReceipt = async (expenseId) => {
    try {
      const response = await api.get(`/receipts/${expenseId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      alert('Failed to load receipt: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Expenses</h1>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
        >
          + New Expense
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit New Expense">
        <ExpenseForm onExpenseCreated={handleExpenseCreated} closeModal={() => setIsModalOpen(false)} />
      </Modal>

      {expenses.length === 0 ? (
        <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-400 text-lg mb-4">You haven't submitted any expenses yet.</p>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Submit Your First Expense
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {expenses.map(expense => (
            <ExpenseCard key={expense._id} expense={expense} onViewReceipt={handleViewReceipt} />
          ))}
        </div>
      )}
    </div>
  );
};

const ExpenseCard = ({ expense, onViewReceipt }) => (
  <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
        <p className="text-xl font-bold text-white">{expense.description}</p>
        <p className="text-gray-300">{expense.category}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-white">{`${expense.amount} ${expense.currency}`}</p>
        <StatusBadge status={expense.status} />
      </div>
    </div>
    {expense.receipt && (
      <button 
        onClick={() => onViewReceipt(expense._id)} 
        className="text-indigo-400 hover:text-indigo-300 transition duration-300 underline"
      >
        View Receipt
      </button>
    )}
    <StatusTimeline expense={expense} />
  </div>
);

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Pending: 'bg-yellow-500/20 text-yellow-400',
    Approved: 'bg-green-500/20 text-green-400',
    Rejected: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-3 py-1 text-sm font-semibold leading-tight rounded-full ${statusStyles[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
};

const StatusTimeline = ({ expense }) => {
  const { status, approvalFlow, currentApprovalStep } = expense;

  if (status === 'Rejected') {
    const rejectedStep = approvalFlow.find(step => step.status === 'Rejected');
    return (
      <div className="pt-4 border-t border-gray-700">
        <p className="text-red-400 font-bold">Rejected</p>
        {rejectedStep && <p className="text-sm text-gray-400">by {rejectedStep.approver.name} - "{rejectedStep.comments}"</p>}
      </div>
    );
  }

  const steps = ['Submitted', 'Waiting for Approval', 'Approved'];
  const activeStep = status === 'Approved' ? 2 : (status === 'Pending' ? 1 : 0);

  return (
    <div className="flex items-center pt-4 border-t border-gray-700">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${index <= activeStep ? 'bg-indigo-500' : 'bg-gray-600'}`}>
            {(index < activeStep || status === 'Approved') && (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            )}
          </div>
          <p className={`ml-3 text-sm font-medium ${index <= activeStep ? 'text-white' : 'text-gray-500'}`}>{step}</p>
          {index < steps.length - 1 && (
            <div className={`flex-auto border-t-2 mx-4 ${index < activeStep ? 'border-indigo-500' : 'border-gray-600'}`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExpensesPage;
