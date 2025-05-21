import React, { useCallback } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/hygraph';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  className?: string;
  accept?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  className = '',
  accept = 'image/*'
}) => {
  const [uploading, setUploading] = React.useState(false);

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const url = await uploadImage(file);
      onUpload(url);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  return (
    <div className={className}>
      <label className="relative flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
        <input
          type="file"
          className="hidden"
          onChange={handleUpload}
          accept={accept}
          disabled={uploading}
        />
        <div className="flex flex-col items-center">
          {uploading ? (
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-500">Click to upload image</span>
            </>
          )}
        </div>
      </label>
    </div>
  );
};

export default ImageUpload;