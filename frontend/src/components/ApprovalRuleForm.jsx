import { useState, useEffect } from 'react';
import api from '../services/api';

const ApprovalRuleForm = ({ rule, onRuleSaved, closeModal }) => {
  const [formData, setFormData] = useState({
    name: rule?.name || '',
    amountThreshold: rule?.amountThreshold || 0,
    isManagerDefaultApprover: rule?.isManagerDefaultApprover || false,
    isSequential: rule?.isSequential || false,
    approvalType: rule?.approvalType || 'all',
    percentageRequired: rule?.percentageRequired || 50,
    specificApprover: rule?.specificApprover?._id || rule?.specificApprover || '',
    approvers: rule?.approvers || [],
  });
  const [allApprovers, setAllApprovers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetches users who can be approvers (Managers, Admins)
        const { data } = await api.get('/users/managers'); 
        setAllApprovers(data.managers);
      } catch (err) {
        console.error('Failed to fetch approvers');
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddApprover = (e) => {
    const userId = e.target.value;
    if (userId) {
      // Check if approver already exists (handle both populated and unpopulated data)
      const alreadyExists = formData.approvers.some(a => {
        const existingId = a.user?._id || a.user;
        return existingId === userId;
      });
      
      if (!alreadyExists) {
        const newApprover = { user: userId, sequence: formData.approvers.length + 1 };
        setFormData({ ...formData, approvers: [...formData.approvers, newApprover] });
      }
    }
  };

  const handleRemoveApprover = (userId) => {
    const updatedApprovers = formData.approvers
      .filter(a => {
        const approverId = a.user?._id || a.user;
        return approverId !== userId;
      })
      .map((a, index) => ({ 
        user: a.user?._id || a.user, // Normalize to just the ID
        sequence: index + 1 
      }));
    setFormData({ ...formData, approvers: updatedApprovers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let response;
      if (rule) {
        response = await api.put(`/approval-rules/${rule._id}`, formData);
      } else {
        response = await api.post('/approval-rules', formData);
      }
      onRuleSaved(response.data.rule);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save rule');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}
      
      <InputField label="Rule Name" name="name" value={formData.name} onChange={handleChange} />
      <InputField label="Amount Threshold" name="amountThreshold" type="number" value={formData.amountThreshold} onChange={handleChange} />

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Approval Type</label>
        <select name="approvalType" value={formData.approvalType} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white">
          <option value="all">All Must Approve</option>
          <option value="percentage">Percentage-Based</option>
          <option value="specific">Specific Approver</option>
          <option value="hybrid">Hybrid (Specific OR Percentage)</option>
        </select>
      </div>

      {(formData.approvalType === 'percentage' || formData.approvalType === 'hybrid') && (
        <InputField label="Percentage Required (%)" name="percentageRequired" type="number" min="1" max="100" value={formData.percentageRequired} onChange={handleChange} />
      )}

      {(formData.approvalType === 'specific' || formData.approvalType === 'hybrid') && (
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Specific Approver (Auto-approve if they approve)</label>
          <select name="specificApprover" value={formData.specificApprover} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white">
            <option value="">-- Select Specific Approver --</option>
            {allApprovers.map(a => (
              <option key={a._id} value={a._id}>{a.name} ({a.role})</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center space-x-6">
        <CheckboxField label="Manager is default approver?" name="isManagerDefaultApprover" checked={formData.isManagerDefaultApprover} onChange={handleChange} />
        <CheckboxField label="Approval is sequential?" name="isSequential" checked={formData.isSequential} onChange={handleChange} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Approvers</label>
        <select onChange={handleAddApprover} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white mb-3">
          <option value="">-- Add an approver --</option>
          {allApprovers.map(a => (
            <option key={a._id} value={a._id}>{a.name} ({a.role})</option>
          ))}
        </select>
        <div className="space-y-2">
          {formData.approvers.map((approver, index) => {
            // Handle both populated (from edit) and unpopulated (from add) approver data
            const approverId = approver.user?._id || approver.user;
            const approverDetails = allApprovers.find(a => a._id === approverId) || approver.user;
            const displayName = approverDetails?.name || 'Loading...';
            const displayRole = approverDetails?.role || '';
            
            return (
              <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                <span className="text-white">
                  {formData.isSequential ? `${index + 1}. ` : ''}{displayName}
                  {displayRole && <span className="text-gray-400 text-sm"> ({displayRole})</span>}
                </span>
                <button type="button" onClick={() => handleRemoveApprover(approverId)} className="text-red-400 hover:text-red-300 font-bold transition">Remove</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-300 bg-gray-600 hover:bg-gray-700 transition">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition">
          Save Rule
        </button>
      </div>
    </form>
  );
};

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <input {...props} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white" required />
  </div>
);

const CheckboxField = ({ label, ...props }) => (
  <div className="flex items-center">
    <input {...props} type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-600 rounded focus:ring-indigo-500 bg-gray-700" />
    <label className="ml-2 block text-sm text-gray-300">{label}</label>
  </div>
);

export default ApprovalRuleForm;
