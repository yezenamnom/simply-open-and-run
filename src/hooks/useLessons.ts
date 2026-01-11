import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  created_at: string;
  updated_at: string;
}

export const useLessons = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

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
        title: 'Error',
        description: 'Failed to save lesson',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast, t]);

  const updateLessonPlan = useCallback(async (
    lessonId: string,
    plan: any
  ) => {
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
        title: 'تم حفظ الخطة الدراسية',
      });
      return data;
    } catch (error) {
      console.error('Error updating lesson plan:', error);
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الخطة الدراسية',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const deleteLesson = useCallback(async (id: string) => {
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
    }
  }, [toast, t]);

  return {
    lessons,
    loading,
    saveLesson,
    deleteLesson,
    updateLessonPlan,
    refreshLessons: fetchLessons,
  };
};
