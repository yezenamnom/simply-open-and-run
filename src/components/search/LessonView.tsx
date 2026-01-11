import { ExternalLink, BookOpen, Sparkles, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Lesson } from '@/hooks/useLessons';
import { LessonPlanManager } from '@/components/lessons/LessonPlanManager';
import { formatLessonContent } from '@/lib/sanitize';

interface LessonViewProps {
  lesson: Lesson;
}

export const LessonView = ({ lesson }: LessonViewProps) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lesson.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">{t.savedLessons}</span>
          </div>
          <div className="flex items-center gap-2">
            <LessonPlanManager lesson={lesson} />
          </div>
        </div>
        <h2 className="text-2xl font-semibold" dir="auto">{lesson.title}</h2>
        <p className="text-sm text-muted-foreground mt-1" dir="auto">{lesson.query}</p>
      </div>

      {/* Images */}
      {lesson.images.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {t.attachedImages} ({lesson.images.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {lesson.images.map((img, idx) => (
              <a
                key={idx}
                href={img}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-24 h-24 rounded-lg overflow-hidden border hover:border-primary transition-colors"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {lesson.citations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {t.sources} ({lesson.citations.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lesson.citations.map((citation, index) => (
              <a
                key={index}
                href={citation}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
                  "bg-source-bg border border-source-border text-source-text",
                  "hover:bg-accent transition-colors"
                )}
              >
                <span className="font-medium">{index + 1}</span>
                <span className="truncate max-w-[150px]">{getDomain(citation)}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">{t.answer}</span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div
          className="prose-perplexity text-foreground leading-relaxed"
          dir="auto"
          dangerouslySetInnerHTML={{ __html: formatLessonContent(lesson.content) }}
        />
      </div>
    </div>
  );
};
