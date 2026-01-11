import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { analyzeImageFile, ImageAnalysisResult } from '@/lib/api/imageAnalysis';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface ImageWithAnalysis {
  url: string;
  analysis?: ImageAnalysisResult;
}

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imagesWithAnalysis, setImagesWithAnalysis] = useState<ImageWithAnalysis[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const { language } = useLanguage();

  // File validation constants
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      };
    }
    if (file.size > MAX_SIZE) {
      return { 
        valid: false, 
        error: 'File too large. Maximum size is 5MB.' 
      };
    }
    return { valid: true };
  };

  const uploadImage = useCallback(async (file: File, analyze: boolean = true): Promise<string | null> => {
    // Validate file before upload
    const validation = validateFile(file);
    if (!validation.valid) {
      console.error('File validation failed:', validation.error);
      return null;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      // Ensure safe file extension
      const safeExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!fileExt || !safeExts.includes(fileExt)) {
        throw new Error('Invalid file extension');
      }
      
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lesson-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('lesson-images')
        .getPublicUrl(filePath);

      const url = data.publicUrl;
      setUploadedImages(prev => [...prev, url]);

      // تحليل الصورة بالذكاء الاصطناعي
      if (analyze) {
        setAnalyzing(true);
        try {
          const analysis = await analyzeImageFile(file, language);
          setImagesWithAnalysis(prev => [...prev, { url, analysis }]);
        } catch (error) {
          console.error('Error analyzing image:', error);
          setImagesWithAnalysis(prev => [...prev, { url }]);
        } finally {
          setAnalyzing(false);
        }
      } else {
        setImagesWithAnalysis(prev => [...prev, { url }]);
      }

      return url;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  }, [language]);

  const removeImage = useCallback((url: string) => {
    setUploadedImages(prev => prev.filter(img => img !== url));
    setImagesWithAnalysis(prev => prev.filter(img => img.url !== url));
  }, []);

  const clearImages = useCallback(() => {
    setUploadedImages([]);
    setImagesWithAnalysis([]);
  }, []);

  const getImageAnalysis = useCallback((url: string): ImageAnalysisResult | undefined => {
    return imagesWithAnalysis.find(img => img.url === url)?.analysis;
  }, [imagesWithAnalysis]);

  return {
    uploading,
    analyzing,
    uploadedImages,
    imagesWithAnalysis,
    uploadImage,
    removeImage,
    clearImages,
    getImageAnalysis,
  };
};
