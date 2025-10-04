import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/expenses');
        const expenses = data.expenses;
        setStats({
          total: expenses.length,
          pending: expenses.filter(e => e.status === 'Pending').length,
          approved: expenses.filter(e => e.status === 'Approved').length,
          rejected: expenses.filter(e => e.status === 'Rejected').length,
        });
      } catch (err) {
        console.error('Failed to fetch stats');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <p className="text-2xl">Welcome, <span className="font-semibold text-indigo-400">{user.name}</span>!</p>
        <p className="text-gray-400 mt-2">Role: <span className="font-semibold text-white">{user.role}</span></p>
        {user.company && <p className="text-gray-400">Company: <span className="font-semibold text-white">{user.company.name}</span></p>}
        
      </div>

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Expenses" value={stats.total} color="bg-indigo-600" />
            <StatCard title="Pending" value={stats.pending} color="bg-yellow-600" />
            <StatCard title="Approved" value={stats.approved} color="bg-green-600" />
            <StatCard title="Rejected" value={stats.rejected} color="bg-red-600" />
          </div>
          {stats.total === 0 && (
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-400 text-lg mb-4">You haven't submitted any expenses yet.</p>
              <p className="text-gray-500 text-sm">Go to "My Expenses" to submit your first expense.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`${color} p-6 rounded-lg shadow-lg`}>
    <p className="text-white text-sm font-medium">{title}</p>
    <p className="text-white text-4xl font-bold mt-2">{value}</p>
  </div>
);

export default DashboardPage;
