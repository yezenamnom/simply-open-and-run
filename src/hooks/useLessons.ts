import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  query: string;
  citations: string[];
  images: string[];
  plan?: any; // LessonPlan structure (JSON)
<<<<<<< HEAD
  workflow?: any; // WorkflowPlan structure (JSON)
=======
  user_id: string | null;
>>>>>>> fccdaed98097d6beccc152ee27ba94363b7828a0
  created_at: string;
  updated_at: string;
}

export const useLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const isRtl = language === 'ar';

  const fetchLessons = useCallback(async () => {
    // Only fetch lessons if user is authenticated (RLS requires auth)
    if (!user) {
      setLessons([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const saveLesson = useCallback(async (
    title: string,
    query: string,
    content: string,
    citations: string[],
    images: string[],
    plan?: any
  ) => {
    if (!user) {
      toast({
        title: isRtl ? 'يرجى تسجيل الدخول' : 'Please sign in',
        description: isRtl ? 'يجب تسجيل الدخول لحفظ الدروس' : 'You must be signed in to save lessons',
        variant: 'destructive',
      });
      return null;
    }

    try {
      // التحقق من إعدادات Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('إعدادات Supabase غير موجودة. يرجى إضافة VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY في ملف .env');
      }

      // التحقق من صحة البيانات
      if (!title || !title.trim()) {
        throw new Error('عنوان الدرس مطلوب');
      }
      if (!content || !content.trim()) {
        throw new Error('محتوى الدرس مطلوب');
      }
      if (!query || !query.trim()) {
        throw new Error('السؤال مطلوب');
      }

      console.log('Attempting to save lesson:', { title, queryLength: query.length, contentLength: content.length });

      // بناء البيانات - لا نضيف plan أبداً لتجنب خطأ العمود غير الموجود
      // يمكن إضافة plan لاحقاً بعد التأكد من وجود العمود في قاعدة البيانات
      const insertData: Record<string, any> = {
        title: title.trim(),
        query: query.trim(),
        content: content.trim(),
        citations: citations || [],
        images: images || [],
      };

      // لا نضيف plan الآن لتجنب أخطاء RLS والعمود غير الموجود
      // يمكن إضافة plan لاحقاً بعد تطبيق migrations
      // if (plan) {
      //   insertData.plan = plan;
      // }

      const { data, error } = await supabase
        .from('lessons')
<<<<<<< HEAD
        .insert(insertData)
=======
        .insert({
          title,
          query,
          content,
          citations,
          images,
          plan: plan || null,
          user_id: user.id,
        })
>>>>>>> fccdaed98097d6beccc152ee27ba94363b7828a0
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        
        // إذا كان الخطأ بسبب عمود plan غير موجود، حاول بدون plan
        if (error.message?.includes("'plan' column") || error.code === 'PGRST204') {
          console.warn('Column "plan" not found in database. Saving without plan. Please run migration: 20260115000000_add_lesson_plan.sql');
          
          // إزالة plan من البيانات والمحاولة مرة أخرى
          delete insertData.plan;
          
          const { data: dataWithoutPlan, error: errorWithoutPlan } = await supabase
            .from('lessons')
            .insert(insertData)
            .select()
            .single();

          if (errorWithoutPlan) {
            console.error('Error saving without plan:', errorWithoutPlan);
            throw errorWithoutPlan;
          }
          
          if (!dataWithoutPlan) {
            throw new Error('لم يتم إرجاع بيانات من Supabase');
          }

          setLessons(prev => [dataWithoutPlan, ...prev]);
          toast({
            title: t.lessonSaved || 'تم الحفظ',
            description: 'تم حفظ الدرس بنجاح (ملاحظة: عمود plan غير موجود في قاعدة البيانات)',
          });
          return dataWithoutPlan;
        }
        
        // عرض رسالة خطأ أكثر تفصيلاً
        let errorMessage = 'فشل حفظ الدرس';
        if (error.code === '23505') {
          errorMessage = 'يوجد درس بنفس العنوان مسبقاً';
        } else if (error.code === '42501') {
          errorMessage = 'خطأ في الصلاحيات (RLS). يجب إصلاح إعدادات Supabase:\n\nافتح Supabase Dashboard → SQL Editor → نفّذ الكود من ملف FIX_RLS_ISSUE.md';
        } else if (error.code === 'PGRST116') {
          errorMessage = 'الجدول غير موجود. يرجى التحقق من migrations في Supabase';
        } else if (error.message) {
          errorMessage = `خطأ: ${error.message}`;
          if (error.details) {
            errorMessage += ` (${error.details})`;
          }
        }
        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error('لم يتم إرجاع بيانات من Supabase');
      }

      setLessons(prev => [data, ...prev]);
      toast({
        title: t.lessonSaved || 'تم الحفظ',
        description: 'تم حفظ الدرس بنجاح',
      });
      return data;
    } catch (error) {
      console.error('Error saving lesson:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل حفظ الدرس';
      toast({
<<<<<<< HEAD
        title: 'خطأ',
        description: errorMessage,
=======
        title: isRtl ? 'خطأ' : 'Error',
        description: isRtl ? 'فشل حفظ الدرس' : 'Failed to save lesson',
>>>>>>> fccdaed98097d6beccc152ee27ba94363b7828a0
        variant: 'destructive',
      });
      return null;
    }
  }, [toast, t, user, isRtl]);

  const updateLessonPlan = useCallback(async (
    lessonId: string,
    plan: any
  ) => {
    if (!user) {
      toast({
        title: isRtl ? 'يرجى تسجيل الدخول' : 'Please sign in',
        description: isRtl ? 'يجب تسجيل الدخول لتحديث الدروس' : 'You must be signed in to update lessons',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .update({ plan, updated_at: new Date().toISOString() })
        .eq('id', lessonId)
        .select()
        .single();

      if (error) throw error;

      setLessons(prev => prev.map(l => l.id === lessonId ? data : l));
      toast({
        title: isRtl ? 'تم حفظ الخطة الدراسية' : 'Lesson plan saved',
      });
      return data;
    } catch (error) {
      console.error('Error updating lesson plan:', error);
      toast({
        title: isRtl ? 'خطأ' : 'Error',
        description: isRtl ? 'فشل حفظ الخطة الدراسية' : 'Failed to save lesson plan',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast, user, isRtl]);

  const updateLessonWorkflow = useCallback(async (
    lessonId: string,
    workflow: any
  ) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .update({ workflow, updated_at: new Date().toISOString() })
        .eq('id', lessonId)
        .select()
        .single();

      if (error) throw error;

      setLessons(prev => prev.map(l => l.id === lessonId ? data : l));
      toast({
        title: 'تم حفظ المخطط الدراسي',
      });
      return data;
    } catch (error) {
      console.error('Error updating lesson workflow:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ المخطط الدراسي',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const deleteLesson = useCallback(async (id: string) => {
    if (!user) {
      toast({
        title: isRtl ? 'يرجى تسجيل الدخول' : 'Please sign in',
        description: isRtl ? 'يجب تسجيل الدخول لحذف الدروس' : 'You must be signed in to delete lessons',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLessons(prev => prev.filter(l => l.id !== id));
      toast({
        title: t.lessonDeleted,
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: isRtl ? 'خطأ' : 'Error',
        description: isRtl ? 'فشل حذف الدرس' : 'Failed to delete lesson',
        variant: 'destructive',
      });
    }
  }, [toast, t, user, isRtl]);

  return {
    lessons,
    loading,
    saveLesson,
    deleteLesson,
    updateLessonPlan,
    updateLessonWorkflow,
    refreshLessons: fetchLessons,
  };
};
