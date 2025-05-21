import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Post, type Profile } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, MapPin, Link as LinkIcon, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

const PublicProfilePage: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          toast.error('Profile not found');
          navigate('/');
          return;
        }
        throw profileError;
      }

      setProfile(profileData);

      // Only fetch posts if profile is not private
      if (!profileData.is_private) {
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles(*),
            likes_count: likes(count),
            comments_count: comments(count)
          `)
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        const processedPosts = postsData?.map((post: any) => ({
          ...post,
          likes_count: post.likes_count?.[0]?.count || 0,
          comments_count: post.comments_count?.[0]?.count || 0
        }));

        setPosts(processedPosts || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Profile not found</h2>
        <p className="mt-2 text-gray-600">The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto px-4 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 md:h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        <div className="p-4 md:p-6 relative">
          <div className="absolute -top-16 left-4 md:left-6">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white bg-white overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="ml-28 md:ml-40 pt-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {profile.full_name || profile.username}
              </h1>
              {profile.is_private && (
                <Lock className="h-5 w-5 text-gray-500" />
              )}
            </div>
            <p className="text-gray-500">@{profile.username}</p>

            {profile.bio && <p className="mt-2 text-gray-700">{profile.bio}</p>}

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>
                  Joined{' '}
                  {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </span>
              </div>
              {profile.location && (
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center">
                  <LinkIcon size={16} className="mr-1" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {profile.is_private ? (
        <div className="mt-6 text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <Lock className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">This account is private</h3>
          <p className="mt-1 text-gray-500">Follow this account to see their posts</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdate={fetchProfile} />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
              <p className="mt-1 text-gray-500">When they post, you'll see their posts here</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PublicProfilePage;