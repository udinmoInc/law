import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar';
import NotificationPanel from './NotificationPanel';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <nav className="h-12 md:h-14 bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
      <div className="h-full flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-lg font-bold text-blue-500">
          SocialApp
        </Link>

        {/* Search Bar - Only show on desktop */}
        <div className="hidden md:block flex-1 max-w-xl px-4">
          <SearchBar />
        </div>

        {/* Right Navigation */}
        <div className="flex items-center space-x-4">
          {user && <NotificationPanel />}
          
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-full"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.email?.[0].toUpperCase()}
                </div>
                <ChevronDown size={16} className="text-gray-600 hidden md:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setShowProfileMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;