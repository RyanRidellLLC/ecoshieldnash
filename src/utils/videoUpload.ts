import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

export interface VideoUploadResult {
  url: string;
  filename: string;
  size: number;
}

export const uploadVideo = async (file: File): Promise<VideoUploadResult> => {
  // Validate file size
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error('Video file size must be less than 100MB');
  }

  // Validate file type
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error('Only MP4, MOV, AVI, and WebM video formats are allowed');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();
  const uniqueFilename = `${timestamp}-${randomString}.${fileExtension}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('application-videos')
    .upload(uniqueFilename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload video: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('application-videos')
    .getPublicUrl(data.path);

  return {
    url: publicUrl,
    filename: file.name,
    size: file.size,
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
