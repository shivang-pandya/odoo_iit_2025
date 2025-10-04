import { useState, useEffect } from 'react';
import api from '../services/api';

const UserForm = ({ user, onUserSaved, closeModal }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'Employee',
    manager: user?.manager?._id || '',
  });
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const { data } = await api.get('/users/managers');
        setManagers(data.managers);
      } catch (err) {
        console.error('Failed to fetch managers');
      }
    };
    fetchManagers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    const payload = { ...formData };
    if (!payload.manager) {
      delete payload.manager;
    }

    try {
      let response;
      if (user) {
        response = await api.put(`/users/${user._id}`, payload);
      } else {
        response = await api.post('/users', payload);
      }
      onUserSaved(response.data.user);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}
      <InputField label="Name" name="name" value={formData.name} onChange={handleChange} />
      <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
      {!user && <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
        <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="Employee">Employee</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Manager</label>
        <select name="manager" value={formData.manager} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">None</option>
          {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
      </div>
      <div className="flex justify-end space-x-4 pt-2">
        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-300 bg-gray-600 hover:bg-gray-700 transition">
          Cancel
        </button>
        <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition flex items-center">
          {isSaving ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isSaving ? 'Saving...' : 'Save User'}
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

export default UserForm;
