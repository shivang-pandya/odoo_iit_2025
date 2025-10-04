import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import Loading from '../components/Loading';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data.users);
      } catch (err) {
        setError('Failed to fetch users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleUserSaved = (savedUser) => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map(u => u._id === savedUser._id ? savedUser : u));
      // Add new user
      setUsers([savedUser, ...users]);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="container mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          + New User
        </button>
      </div>

      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Manager</th>
              <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-900 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="hover:bg-gray-700">
                <td className="px-5 py-4 border-b border-gray-700 text-sm">{user.name}</td>
                <td className="px-5 py-4 border-b border-gray-700 text-sm">{user.email}</td>
                <td className="px-5 py-4 border-b border-gray-700 text-sm">
                  <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${user.role === 'Admin' ? 'bg-red-200 text-red-900' : user.role === 'Manager' ? 'bg-blue-200 text-blue-900' : 'bg-green-200 text-green-900'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-700 text-sm">{user.manager?.name || 'N/A'}</td>
                <td className="px-5 py-4 border-b border-gray-700 text-sm space-x-2">
                  <button onClick={() => handleOpenModal(user)} className="text-indigo-400 hover:text-indigo-300">Edit</button>
                  <button className="text-gray-400 hover:text-gray-300">Send Password</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedUser ? 'Edit User' : 'Create New User'}>
        <UserForm user={selectedUser} onUserSaved={handleUserSaved} closeModal={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default UsersPage;

