import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { HardDrive, LogOut, Upload as UploadIcon, Users } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex flex-shrink-0 items-center">
              <HardDrive className="h-8 w-8 text-brand-600" />
              <span className="ml-2 text-xl font-bold text-slate-800">DigiVault</span>
            </Link>
            
            {user && (
              <div className="hidden sm:flex space-x-4">
                <Link to="/" className="text-slate-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium">My Documents</Link>
                <Link to="/shared" className="flex items-center text-slate-600 hover:text-brand-600 px-3 py-2 rounded-md text-sm font-medium">
                  <Users className="w-4 h-4 mr-1"/> Shared With Me
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/upload" 
                  className="bg-brand-600 text-white flex items-center px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700 transition"
                >
                  <UploadIcon className="w-4 h-4 mr-2"/>
                  Upload
                </Link>
                <div className="flex items-center border-l pl-4 border-slate-200">
                  <div className="text-sm font-medium text-slate-700 mr-4">{user.name}</div>
                  <button 
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-500 transition focus:outline-none"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium">Log in</Link>
                <Link to="/register" className="bg-brand-600 text-white hover:bg-brand-700 px-3 py-2 rounded-md text-sm font-medium transition">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
