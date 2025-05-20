import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import MobileNavbar from './components/MobileNavbar';
import Sidebar from './components/Sidebar';
import TrendingSidebar from './components/TrendingSidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import GroupsPage from './pages/GroupsPage';
import PostPage from './pages/PostPage';
import ExplorePage from './pages/ExplorePage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-white">
          {/* Top Navigation - Mobile Only */}
          <div className="md:hidden">
            <Navbar />
          </div>

          {/* Main Layout */}
          <div className="flex min-h-screen">
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden md:block w-[275px] fixed top-0 left-0 h-screen border-r border-gray-100 bg-white overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4">
                <h1 className="text-xl font-bold text-gray-900">SocialApp</h1>
              </div>
              <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0 md:ml-[275px] md:mr-[350px]">
              <div className="max-w-[600px] mx-auto border-x border-gray-100">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/create" element={<CreatePostPage />} />
                  <Route path="/groups" element={<GroupsPage />} />
                  <Route path="/post/:id" element={<PostPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                </Routes>
              </div>
            </main>

            {/* Right Sidebar - Hidden on mobile */}
            <div className="hidden md:block w-[350px] fixed top-0 right-0 h-screen bg-white overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search"
                    className="w-full bg-gray-100 border border-transparent rounded-full py-2.5 px-4 focus:bg-white focus:border-gray-200 focus:outline-none text-sm"
                  />
                </div>
              </div>
              <TrendingSidebar />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNavbar />
          </div>

          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#334155',
                border: '1px solid #e2e8f0'
              }
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;