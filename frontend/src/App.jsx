import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import UsersPage from './pages/UsersPage';
import ApprovalRulesPage from './pages/ApprovalRulesPage';
import ApprovalsPage from './pages/ApprovalsPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Loading from './components/Loading';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="approval-rules" element={<ProtectedRoute roles={['Admin']}><ApprovalRulesPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['Admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="approvals" element={<ProtectedRoute roles={['Admin', 'Manager']}><ApprovalsPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
