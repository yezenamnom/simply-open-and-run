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
  user_id: string | null;
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
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
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
    if (!user) {
      toast({
        title: isRtl ? 'يرجى تسجيل الدخول' : 'Please sign in',
        description: isRtl ? 'يجب تسجيل الدخول لحفظ الدروس' : 'You must be signed in to save lessons',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          title,
          query,
          content,
          citations,
          images,
          plan: plan || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setLessons(prev => [data, ...prev]);
      toast({
        title: t.lessonSaved,
      });
      return data;
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: isRtl ? 'خطأ' : 'Error',
        description: isRtl ? 'فشل حفظ الدرس' : 'Failed to save lesson',
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
    refreshLessons: fetchLessons,
  };
};
