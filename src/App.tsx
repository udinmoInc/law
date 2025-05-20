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
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          {/* Main Layout */}
          <div className="pt-12 md:pt-14">
            {/* Desktop 3-Column Layout */}
            <div className="container mx-auto flex">
              {/* Left Sidebar - Hidden on mobile */}
              <div className="hidden md:block w-64 fixed top-14 bottom-0 left-0 overflow-y-auto border-r border-gray-200 bg-white">
                <Sidebar />
              </div>

              {/* Main Content */}
              <main className="w-full md:ml-64 md:mr-72 px-4">
                <div className="max-w-2xl mx-auto">
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
              <div className="hidden md:block w-72 fixed top-14 bottom-0 right-0 overflow-y-auto border-l border-gray-200 bg-white">
                <TrendingSidebar />
              </div>
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