import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-3xl font-bold text-center text-white">Sign In</h2>
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-gray-400">
          Don't have an account? <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

const InputField = ({ label, type, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <input 
      type={type} 
      value={value}
      onChange={onChange} 
      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      required 
    />
  </div>
);

export default LoginPage;
