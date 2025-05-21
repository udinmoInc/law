import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Image } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreatePostFormProps {
  onPostCreated: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a post');
      return;
    }

    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('posts').insert([
        {
          user_id: user.id,
          content: content.trim(),
          image_url: imageUrl.trim() || null,
        },
      ]);

      if (error) throw error;

      setContent('');
      setImageUrl('');
      setShowImageInput(false);
      toast.success('Post created successfully!');
      onPostCreated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-0 py-2 bg-transparent border-0 resize-none placeholder:text-gray-500 focus:ring-0 text-sm"
          rows={2}
          disabled={isSubmitting}
        />

        {showImageInput && (
          <div className="relative mt-2 mb-3">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Add image URL"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Image size={18} />
          </button>

          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;