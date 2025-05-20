import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  Briefcase,
  Users,
  User,
  PenSquare,
  Menu,
  LogIn
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const publicNavigationItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: Users, label: 'Communities', path: '/communities' },
  ];

  const privateNavigationItems = [
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Mail, label: 'Messages', path: '/messages' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const navigationItems = user ? [...publicNavigationItems, ...privateNavigationItems] : publicNavigationItems;

  return (
    <div className="h-full flex flex-col justify-between p-4">
      <div className="space-y-2">
        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-full">
          <Menu size={24} />
        </button>

        {/* Navigation Items */}
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 p-3 rounded-full hover:bg-gray-100 transition-colors ${
              location.pathname === item.path ? 'font-bold' : ''
            }`}
          >
            <item.icon size={24} />
            <span className="text-xl">{item.label}</span>
          </Link>
        ))}

        {/* Post/Login Button */}
        {user ? (
          <button className="w-full mt-4 bg-blue-500 text-white rounded-full py-3 px-6 font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
            <PenSquare size={20} />
            <span>Post</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="w-full mt-4 bg-blue-500 text-white rounded-full py-3 px-6 font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            <span>Sign In</span>
          </Link>
        )}
      </div>

      {/* User Profile */}
      {user && (
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user.email?.split('@')[0]}</p>
              <p className="text-sm text-gray-500 truncate">@{user.email?.split('@')[0]}</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;