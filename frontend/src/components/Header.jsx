import useAuth from '../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-800 shadow-lg p-4 flex justify-between items-center border-b border-gray-700">
      <div>
        <h1 className="text-xl font-semibold text-white">Welcome, {user?.name}</h1>
        <p className="text-sm text-gray-400">Role: <span className="text-indigo-400 font-semibold">{user?.role}</span></p>
      </div>
      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
