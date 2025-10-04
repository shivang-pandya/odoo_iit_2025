import { useState, useEffect } from 'react';
import api from '../services/api';

const ExpenseForm = ({ onExpenseCreated, closeModal }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    category: 'Other',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setCurrencies(Object.keys(data.rates));
      } catch (err) {
        console.error('Failed to fetch currencies');
      }
    };
    fetchCurrencies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setReceipt(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const submissionData = new FormData();
    Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));
    if (receipt) {
      submissionData.append('receipt', receipt);
    }

    try {
      const { data } = await api.post('/expenses', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onExpenseCreated(data.expense);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField label="Amount" name="amount" type="number" value={formData.amount} onChange={handleChange} />
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Currency</label>
          <input 
            list="currencies" 
            name="currency" 
            value={formData.currency} 
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" 
            required 
          />
          <datalist id="currencies">
            {currencies.map(curr => <option key={curr} value={curr} />)}
          </datalist>
        </div>
      </div>
      <InputField label="Description" name="description" value={formData.description} onChange={handleChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField label="Category" name="category" value={formData.category} onChange={handleChange}>
          <option>Travel</option>
          <option>Food</option>
          <option>Accommodation</option>
          <option>Transport</option>
          <option>Office Supplies</option>
          <option>Other</option>
        </SelectField>
        <InputField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Receipt</label>
        <input type="file" name="receipt" onChange={handleFileChange} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"/>
      </div>
      <div className="flex justify-end space-x-4 pt-2">
        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-300 bg-gray-600 hover:bg-gray-700 transition">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition flex items-center">
          {isSubmitting && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <input {...props} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
  </div>
);

const SelectField = ({ label, children, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <select {...props} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
      {children}
    </select>
  </div>
);

export default ExpenseForm;
