import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  query: string;
  citations: string[];
  images: string[];
  plan?: any; // LessonPlan structure (JSON)
  workflow?: any; // WorkflowPlan structure (JSON)
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export const useLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const isRtl = language === 'ar';

  const fetchLessons = useCallback(async () => {
    // جلب الدروس من localStorage (الكاش)
    try {
      const stored = localStorage.getItem('lessons_cache');
      if (stored) {
        const lessons = JSON.parse(stored);
        setLessons(lessons);
      } else {
        setLessons([]);
      }
    } catch (error) {
      console.error('Error fetching lessons from cache:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
    try {
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

      console.log('Attempting to save lesson to cache:', { title, queryLength: query.length, contentLength: content.length });

      // إنشاء درس جديد مع ID فريد
      const newLesson: Lesson = {
        id: `lesson-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: title.trim(),
        query: query.trim(),
        content: content.trim(),
        citations: citations || [],
        images: images || [],
        summary: null,
        plan: plan || null,
        workflow: null,
        user_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // جلب الدروس الحالية من localStorage
      const stored = localStorage.getItem('lessons_cache');
      const existingLessons: Lesson[] = stored ? JSON.parse(stored) : [];

      // إضافة الدرس الجديد في البداية
      const updatedLessons = [newLesson, ...existingLessons];

      // حفظ في localStorage
      localStorage.setItem('lessons_cache', JSON.stringify(updatedLessons));

      // تحديث الـ state
      setLessons(updatedLessons);

      toast({
        title: t.lessonSaved || 'تم الحفظ',
        description: 'تم حفظ الدرس بنجاح في الكاش',
      });

      return newLesson;
    } catch (error) {
      console.error('Error saving lesson:', error);
      const errorMessage = error instanceof Error ? error.message : 'فشل حفظ الدرس';
      toast({
        title: isRtl ? 'خطأ' : 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast, t, isRtl]);

  const updateLessonPlan = useCallback(async (
    lessonId: string,
    plan: any
  ) => {
    try {
      // جلب الدروس من localStorage
      const stored = localStorage.getItem('lessons_cache');
      const lessons: Lesson[] = stored ? JSON.parse(stored) : [];

      // تحديث الدرس
      const updatedLessons = lessons.map(l => 
        l.id === lessonId 
          ? { ...l, plan, updated_at: new Date().toISOString() }
          : l
      );

      // حفظ في localStorage
      localStorage.setItem('lessons_cache', JSON.stringify(updatedLessons));

      // تحديث الـ state
      setLessons(updatedLessons);

      const updatedLesson = updatedLessons.find(l => l.id === lessonId);

      toast({
        title: isRtl ? 'تم حفظ الخطة الدراسية' : 'Lesson plan saved',
      });
      return updatedLesson || null;
    } catch (error) {
      console.error('Error updating lesson plan:', error);
      toast({
        title: isRtl ? 'خطأ' : 'Error',
        description: isRtl ? 'فشل حفظ الخطة الدراسية' : 'Failed to save lesson plan',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast, isRtl]);

  const updateLessonWorkflow = useCallback(async (
    lessonId: string,
    workflow: any
  ) => {
    try {
      // جلب الدروس من localStorage
      const stored = localStorage.getItem('lessons_cache');
      const lessons: Lesson[] = stored ? JSON.parse(stored) : [];

      // تحديث الدرس
      const updatedLessons = lessons.map(l => 
        l.id === lessonId 
          ? { ...l, workflow, updated_at: new Date().toISOString() }
          : l
      );

      // حفظ في localStorage
      localStorage.setItem('lessons_cache', JSON.stringify(updatedLessons));

      // تحديث الـ state
      setLessons(updatedLessons);

      const updatedLesson = updatedLessons.find(l => l.id === lessonId);

      toast({
        title: 'تم حفظ المخطط الدراسي',
      });
      return updatedLesson || null;
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
    try {
      // جلب الدروس من localStorage
      const stored = localStorage.getItem('lessons_cache');
      const lessons: Lesson[] = stored ? JSON.parse(stored) : [];

      // حذف الدرس
      const updatedLessons = lessons.filter(l => l.id !== id);

      // حفظ في localStorage
      localStorage.setItem('lessons_cache', JSON.stringify(updatedLessons));

      // تحديث الـ state
      setLessons(updatedLessons);

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
  }, [toast, t, isRtl]);

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
