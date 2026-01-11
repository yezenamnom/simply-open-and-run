import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Search, ArrowUp, Newspaper, Globe, Sparkles, GraduationCap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ImageUploadButton } from "./ImageUploadButton";
import { PDFUploader } from "@/components/lessons/PDFUploader";

interface SearchInputProps {
  onSearch: (query: string, type: 'general' | 'news' | 'smart', images?: string[]) => void;
  disabled?: boolean;
  variant?: 'hero' | 'compact';
  lessonMode?: boolean;
  uploadedImages?: string[];
  onUploadImage?: (file: File) => Promise<string | null>;
  onRemoveImage?: (url: string) => void;
  uploading?: boolean;
  analyzing?: boolean;
  imagesWithAnalysis?: Array<{ url: string; analysis?: any }>;
  onUploadPDF?: (file: File) => Promise<void>;
}

export const SearchInput = ({ 
  onSearch, 
  disabled, 
  variant = 'hero',
  lessonMode = false,
  uploadedImages = [],
  onUploadImage,
  onRemoveImage,
  uploading = false,
  analyzing = false,
  imagesWithAnalysis = [],
  onUploadPDF,
}: SearchInputProps) => {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<'general' | 'news' | 'smart'>('general');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        variant === 'hero' ? 150 : 100
      )}px`;
    }
  }, [query, variant]);

  const handleSubmit = () => {
    if (query.trim() && !disabled) {
      onSearch(query.trim(), searchType, uploadedImages);
      if (variant === 'compact') {
        setQuery("");
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isHero = variant === 'hero';
  const suggestions = lessonMode 
    ? [t.lessonSuggestion1, t.lessonSuggestion2, t.lessonSuggestion3]
    : [t.suggestion1, t.suggestion2, t.suggestion3];

  return (
    <div className={cn(
      "w-full",
      isHero ? "max-w-3xl" : "max-w-3xl mx-auto"
    )}>
      <div className={cn(
        "relative rounded-2xl border-2 bg-card transition-all duration-300",
        "focus-within:border-primary focus-within:shadow-lg",
        isHero ? "border-search-border shadow-md" : "border-border",
        lessonMode && "border-primary/50"
      )}>
        {/* Search Type Tabs */}
        {!lessonMode && (
          <div className="flex items-center gap-1 px-4 pt-3 pb-1">
            <button
              type="button"
              onClick={() => setSearchType('general')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                searchType === 'general'
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Globe className="h-3.5 w-3.5" />
              {t.generalSearch}
            </button>
            <button
              type="button"
              onClick={() => setSearchType('news')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                searchType === 'news'
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Newspaper className="h-3.5 w-3.5" />
              {t.news}
            </button>
            <button
              type="button"
              onClick={() => setSearchType('smart')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                searchType === 'smart'
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Brain className="h-3.5 w-3.5" />
              {t.smartAnswer}
            </button>
          </div>
        )}

        {/* Lesson Mode Indicator */}
        {lessonMode && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary">
              <GraduationCap className="h-3.5 w-3.5" />
              {t.lessonModeActive}
            </div>
          </div>
        )}

        {/* Image & PDF Upload for Lesson Mode */}
        {lessonMode && isHero && (
          <div className="px-4 py-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              {onUploadImage && onRemoveImage && (
                <ImageUploadButton
                  onUpload={onUploadImage}
                  uploadedImages={uploadedImages}
                  onRemove={onRemoveImage}
                  uploading={uploading}
                  analyzing={analyzing}
                  imagesWithAnalysis={imagesWithAnalysis}
                  disabled={disabled}
                />
              )}
              {onUploadPDF && (
                <PDFUploader
                  onUpload={onUploadPDF}
                  disabled={disabled}
                  variant="icon"
                />
              )}
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="flex items-end gap-3 px-4 pb-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0 mb-2" />
          <Textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              lessonMode 
                ? t.lessonModeDescription
                : searchType === 'news' 
                  ? t.newsPlaceholder 
                  : searchType === 'smart'
                    ? t.searchPlaceholder
                    : t.searchPlaceholder
            }
            className={cn(
              "flex-1 resize-none border-0 bg-transparent p-0 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
              isHero ? "text-lg min-h-[32px]" : "text-base min-h-[24px]"
            )}
            disabled={disabled}
            rows={1}
            dir="auto"
          />
          <Button
            onClick={handleSubmit}
            disabled={!query.trim() || disabled}
            size="icon"
            className={cn(
              "shrink-0 rounded-xl transition-all mb-0.5",
              query.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground"
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions for hero variant */}
      {isHero && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            {lessonMode ? <GraduationCap className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            {t.trySuggestions}
          </span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuery(suggestion);
                if (!lessonMode && (suggestion.toLowerCase().includes('news') || 
                    suggestion.includes('أخبار') || 
                    suggestion.toLowerCase().includes('nachrichten'))) {
                  setSearchType('news');
                }
              }}
              className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
