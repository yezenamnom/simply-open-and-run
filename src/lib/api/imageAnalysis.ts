import { supabase } from '@/integrations/supabase/client';

export interface ImageAnalysisResult {
  success: boolean;
  description?: string;
  text?: string;
  objects?: string[];
  concepts?: string[];
  error?: string;
}

/**
 * تحليل الصورة بالذكاء الاصطناعي
 * @param imageUrl رابط الصورة
 * @param language لغة التحليل
 * @returns نتيجة التحليل
 */
export const analyzeImage = async (
  imageUrl: string,
  language: string = 'ar'
): Promise<ImageAnalysisResult> => {
  try {
    // استدعاء Edge Function لتحليل الصورة
    const { data, error } = await supabase.functions.invoke('image-analysis', {
      body: { 
        imageUrl,
        language 
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return data || { success: false, error: 'No data returned' };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * تحليل الصورة من ملف مباشرة
 * @param file ملف الصورة
 * @param language لغة التحليل
 * @param userId معرف المستخدم (اختياري)
 * @returns نتيجة التحليل
 */
export const analyzeImageFile = async (
  file: File,
  language: string = 'ar',
  userId?: string
): Promise<ImageAnalysisResult> => {
  try {
    // Get current user if userId not provided
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = userId || user?.id;
    
    if (!currentUserId) {
      return {
        success: false,
        error: 'User must be authenticated to analyze images',
      };
    }

    // رفع الصورة أولاً مع مسار يتضمن user.id للتوافق مع RLS
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const safeExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!fileExt || !safeExts.includes(fileExt)) {
      return {
        success: false,
        error: 'Invalid file type',
      };
    }
    
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${currentUserId}/temp/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('lesson-images')
      .upload(filePath, file);

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // الحصول على رابط موقع للصورة
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('lesson-images')
      .createSignedUrl(filePath, 60 * 5); // 5 minutes expiry

    if (signedUrlError) {
      return {
        success: false,
        error: signedUrlError.message,
      };
    }

    // تحليل الصورة
    const analysisResult = await analyzeImage(signedUrlData.signedUrl, language);

    // حذف الملف المؤقت
    await supabase.storage
      .from('lesson-images')
      .remove([filePath]);

    return analysisResult;
  } catch (error) {
    console.error('Error analyzing image file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

