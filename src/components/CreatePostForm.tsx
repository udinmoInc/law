import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Image, X } from 'lucide-react';
import ImageUpload from './ImageUpload';
import toast from 'react-hot-toast';

interface CreatePostFormProps {
  onPostCreated: () => void;
  selectedGroup?: string | null;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostCreated, selectedGroup }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

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
      const { data, error } = await supabase.from('posts').insert([
        {
          user_id: user.id,
          content: content.trim(),
          image_url: imageUrl.trim() || null,
          group_id: selectedGroup || null,
        },
      ]).select();

      if (error) throw error;

      setContent('');
      setImageUrl('');
      setShowImageUpload(false);
      toast.success('Post created successfully!');
      onPostCreated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    setShowImageUpload(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={selectedGroup ? "Share something with your group..." : "What's on your mind?"}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[100px]"
          disabled={isSubmitting}
        />

        {imageUrl && (
          <div className="relative mt-4">
            <img
              src={imageUrl}
              alt="Post preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 p-1 bg-gray-900/70 text-white rounded-full hover:bg-gray-900"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {showImageUpload && !imageUrl && (
          <div className="mt-4">
            <ImageUpload onUpload={handleImageUpload} />
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => setShowImageUpload(!showImageUpload)}
            className={`p-2 rounded-full transition-colors ${
              showImageUpload ? 'text-blue-500 bg-blue-50' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Image size={20} />
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-full hover:bg-blue-600 transition-colors disabled:bg-blue-300"
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