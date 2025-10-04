import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ApprovalRuleForm from '../components/ApprovalRuleForm';
import Loading from '../components/Loading';

const ApprovalRulesPage = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const { data } = await api.get('/approval-rules');
        setRules(data.rules);
      } catch (err) {
        setError('Failed to fetch approval rules');
      }
      setLoading(false);
    };
    fetchRules();
  }, []);

  const handleOpenModal = (rule = null) => {
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRule(null);
    setIsModalOpen(false);
  };

  const handleRuleSaved = (savedRule) => {
    if (selectedRule) {
      // Update existing rule
      setRules(rules.map(r => r._id === savedRule._id ? savedRule : r));
    } else {
      // Add new rule
      setRules([savedRule, ...rules]);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Approval Rules</h1>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          + New Rule
        </button>
      </div>

      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rule Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Threshold</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Approval Type</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Flow Type</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule._id} className="hover:bg-gray-700">
                <td className="px-5 py-4 border-b border-gray-700 text-sm">{rule.name}</td>
                <td className="px-5 py-4 border-b border-gray-700 text-sm">{`>= ${rule.amountThreshold}`}</td>
                <td className="px-5 py-4 border-b border-gray-700 text-sm">
                  <span className="capitalize">{rule.approvalType || 'all'}</span>
                  {rule.approvalType === 'percentage' && ` (${rule.percentageRequired}%)`}
                  {rule.approvalType === 'hybrid' && ` (${rule.percentageRequired}%)`}
                </td>
                <td className="px-5 py-4 border-b border-gray-700 text-sm">{rule.isSequential ? 'Sequential' : 'Parallel'}</td>
                <td className="px-5 py-4 border-b border-gray-700 text-sm">
                  <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${rule.isActive ? 'bg-green-200 text-green-900' : 'bg-gray-500 text-gray-100'}`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-700 text-sm">
                  <button onClick={() => handleOpenModal(rule)} className="text-indigo-400 hover:text-indigo-300">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedRule ? 'Edit Approval Rule' : 'Create New Approval Rule'}>
        <ApprovalRuleForm rule={selectedRule} onRuleSaved={handleRuleSaved} closeModal={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default ApprovalRulesPage;

