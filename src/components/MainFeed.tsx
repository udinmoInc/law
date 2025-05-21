import React, { useState, useEffect } from 'react';
import { Image, MapPin, BarChart2 } from 'lucide-react';
import CreatePostForm from './CreatePostForm';
import PostCard from './PostCard';
import { supabase, type Post, type Group } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MainFeed: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('for-you');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostTools, setShowPostTools] = useState(false);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserGroups();
    }
  }, [activeTab, selectedGroup, user]);

  const fetchUserGroups = async () => {
    if (!user) return;
    try {
      const { data: groupMembers, error: groupError } = await supabase
        .from('group_members')
        .select('groups(*)')
        .eq('user_id', user.id);

      if (groupError) throw groupError;

      const groups = groupMembers?.map(member => member.groups).filter(Boolean) || [];
      setUserGroups(groups);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      toast.error('Failed to load groups');
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles (*),
          groups (*),
          likes_count: likes(count),
          comments_count: comments(count)
          ${user ? ', user_has_liked: likes!inner(user_id)' : ''}
        `)
        .order('created_at', { ascending: false });

      if (selectedGroup) {
        query = query.eq('group_id', selectedGroup);
      } else if (activeTab === 'following' && user) {
        const { data: following } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = following?.map(f => f.following_id) || [];
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        }
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) throw postsError;

      const processedPosts = postsData?.map((post: any) => ({
        ...post,
        likes_count: post.likes_count?.[0]?.count || 0,
        comments_count: post.comments_count?.[0]?.count || 0,
        user_has_liked: user ? (post.user_has_liked?.some((like: any) => like.user_id === user?.id) || false) : false
      }));

      setPosts(processedPosts || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Feed Tabs */}
      <div className="flex border-b border-gray-100 bg-white">
        <button
          onClick={() => {
            setActiveTab('for-you');
            setSelectedGroup(null);
          }}
          className={`flex-1 py-3 text-center font-medium text-sm hover:bg-gray-50 transition-colors ${
            activeTab === 'for-you' && !selectedGroup ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'
          }`}
        >
          For You
        </button>
        {user && (
          <button
            onClick={() => {
              setActiveTab('following');
              setSelectedGroup(null);
            }}
            className={`flex-1 py-3 text-center font-medium text-sm hover:bg-gray-50 transition-colors ${
              activeTab === 'following' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'
            }`}
          >
            Following
          </button>
        )}
        <button
          onClick={() => {
            setActiveTab('nearby');
            setSelectedGroup(null);
          }}
          className={`flex-1 py-3 text-center font-medium text-sm hover:bg-gray-50 transition-colors ${
            activeTab === 'nearby' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-600'
          }`}
        >
          Nearby
        </button>
      </div>

      {/* Group Selection */}
      {user && userGroups.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <select
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value || null)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Posts</option>
            {userGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Post Creation */}
      {user && (
        <div className="px-4 py-3 border-b border-gray-100 bg-white">
          <CreatePostForm onPostCreated={fetchPosts} selectedGroup={selectedGroup} />
          {showPostTools && (
            <div className="flex gap-4 mt-3 overflow-x-auto pb-2 scrollbar-hide">
              <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap">
                <Image size={18} />
                <span className="text-sm font-medium">Image</span>
              </button>
              <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap">
                <BarChart2 size={18} />
                <span className="text-sm font-medium">Poll</span>
              </button>
              <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors whitespace-nowrap">
                <MapPin size={18} />
                <span className="text-sm font-medium">Location</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Posts Feed */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchPosts}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdate={fetchPosts} />
          ))
        ) : (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="mt-1 text-sm text-gray-500">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainFeed;