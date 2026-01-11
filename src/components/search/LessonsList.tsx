import { BookOpen, Trash2, Clock, Download, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Lesson } from '@/hooks/useLessons';
import { LessonExport } from '@/components/lessons/LessonExport';
import { LessonSummary } from '@/components/lessons/LessonSummary';

interface LessonsListProps {
  lessons: Lesson[];
  currentId: string | null;
  onSelect: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

export const LessonsList = ({
  lessons,
  currentId,
  onSelect,
  onDelete,
  loading,
}: LessonsListProps) => {
  const { t, language } = useLanguage();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      language === 'ar' ? 'ar' : language === 'de' ? 'de' : 'en',
      { month: 'short', day: 'numeric' }
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <BookOpen className="mb-3 h-8 w-8" />
        <p className="text-sm">{t.noLessons}</p>
        <p className="text-xs">{t.noLessonsDesc}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/20">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{t.savedLessons}</span>
          {lessons.length > 0 && (
            <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {lessons.length}
            </span>
          )}
        </div>
        {lessons.length > 0 && (
          <div className="flex items-center gap-1">
            <LessonExport lessons={lessons} />
            <LessonSummary lessons={lessons} />
          </div>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={cn(
                "group flex items-center gap-3 rounded-xl p-3 transition-all cursor-pointer border",
                "hover:shadow-md hover:border-primary/50",
                currentId === lesson.id
                  ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary shadow-md"
                  : "bg-card border-border"
              )}
              onClick={() => onSelect(lesson)}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                currentId === lesson.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary"
              )}>
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate mb-1" dir="auto">{lesson.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(lesson.created_at)}</span>
                  {lesson.images.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        📷 {lesson.images.length}
                      </span>
                    </>
                  )}
                  {lesson.plan && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-primary">
                        📋 خطة
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 shrink-0 transition-opacity",
                  "opacity-0 group-hover:opacity-100",
                  "hover:bg-destructive/10 hover:text-destructive"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(lesson.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
