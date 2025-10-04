import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
const Sidebar = () => {
  const { user } = useAuth();

  const commonLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/expenses', label: 'My Expenses' },
  ];

  const adminLinks = [
    { to: '/users', label: 'User Management' },
    { to: '/approval-rules', label: 'Approval Rules' },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 flex items-center justify-center">
        <img src="/src/assets/logo.jpg" alt="ExpenseApp Logo" className="w-20 h-20" />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {commonLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `block px-4 py-2 rounded-lg transition duration-200 ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
        
        {(user.role === 'Admin' || user.role === 'Manager') && (
          <NavLink
            to="/approvals"
            className={({ isActive }) => 
              `block px-4 py-2 rounded-lg transition duration-200 ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}`
            }
          >
            Pending Approvals
          </NavLink>
        )}

        {user.role === 'Admin' && adminLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `block px-4 py-2 rounded-lg transition duration-200 ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
