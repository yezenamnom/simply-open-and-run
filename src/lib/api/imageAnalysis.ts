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
 * @returns نتيجة التحليل
 */
export const analyzeImageFile = async (
  file: File,
  language: string = 'ar'
): Promise<ImageAnalysisResult> => {
  try {
    // رفع الصورة أولاً
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `temp/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lesson-images')
      .upload(filePath, file);

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // الحصول على رابط الصورة
    const { data: { publicUrl } } = supabase.storage
      .from('lesson-images')
      .getPublicUrl(filePath);

    // تحليل الصورة
    const analysisResult = await analyzeImage(publicUrl, language);

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

