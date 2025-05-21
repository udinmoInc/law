import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
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
import ChatPage from './pages/ChatPage';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, delay: 0.1 }
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <motion.div 
          className="min-h-screen bg-gray-50"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Navbar />
          
          <div className="pt-12 md:pt-14">
            <div className="container mx-auto max-w-6xl px-4">
              <div className="flex gap-6">
                {/* Left Sidebar - Hidden on mobile */}
                <motion.div 
                  className="hidden md:block w-64 sticky top-14 h-[calc(100vh-3.5rem)]"
                  variants={sidebarVariants}
                >
                  <div className="bg-white rounded-xl border border-gray-200 h-full overflow-y-auto">
                    <Sidebar />
                  </div>
                </motion.div>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                  <AnimatePresence mode="wait">
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
                      <Route path="/chat" element={<ChatPage />} />
                    </Routes>
                  </AnimatePresence>
                </main>

                {/* Right Sidebar - Hidden on mobile */}
                <motion.div 
                  className="hidden md:block w-72 sticky top-14 h-[calc(100vh-3.5rem)]"
                  variants={sidebarVariants}
                >
                  <div className="bg-white rounded-xl border border-gray-200 h-full overflow-y-auto">
                    <TrendingSidebar />
                  </div>
                </motion.div>
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
        </motion.div>
      </AuthProvider>
    </Router>
  );
}

export default App;