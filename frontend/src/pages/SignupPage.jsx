import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { fetchCurrencies } from '../utils/currencies';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    country: '',
    currency: '',
  });
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrencies = async () => {
      const currencyList = await fetchCurrencies();
      setCurrencies(currencyList);
    };
    getCurrencies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign up');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200 p-4">
      <div className="max-w-4xl w-full bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-3xl font-bold text-center text-white">Admin & Company Signup</h2>
        {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <InputField label="Full Name" type="text" name="name" onChange={handleChange} />
              <InputField label="Email" type="email" name="email" onChange={handleChange} />
              <InputField label="Password" type="password" name="password" onChange={handleChange} />
              <InputField label="Confirm Password" type="password" name="passwordConfirmation" onChange={(e) => setPasswordConfirmation(e.target.value)} />
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <InputField label="Company Name" type="text" name="companyName" onChange={handleChange} />
              <InputField label="Country" type="text" name="country" onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Company Currency</label>
                <input 
                  list="currencies"
                  name="currency"
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required 
                />
                <datalist id="currencies">
                  {currencies.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

const InputField = ({ label, type, name, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    <input 
      type={type} 
      name={name} 
      onChange={onChange} 
      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      required 
    />
  </div>
);

export default SignupPage;
