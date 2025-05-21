import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Post } from '../lib/supabase';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

const PostPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (*),
          likes_count: likes(count),
          comments_count: comments(count)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Post not found
          toast.error('Post not found');
          navigate('/');
          return;
        }
        throw error;
      }

      if (!data) {
        toast.error('Post not found');
        navigate('/');
        return;
      }

      // Transform the data to match the expected structure
      const processedPost = {
        ...data,
        likes_count: data.likes_count?.[0]?.count || 0,
        comments_count: data.comments_count?.[0]?.count || 0,
        user_has_liked: false // We'll fetch this separately if user is logged in
      };

      // If user is authenticated, check if they liked the post
      const { data: auth } = await supabase.auth.getSession();
      if (auth.session?.user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', auth.session.user.id)
          .single();

        processedPost.user_has_liked = !!likeData;
      }

      setPost(processedPost);
    } catch (error: any) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 mt-16">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 mt-16">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Post not found</h2>
          <p className="mt-2 text-gray-600">The post you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 mt-16">
      <PostCard post={post} onPostUpdate={fetchPost} />
    </div>
  );
};

export default PostPage;