import { ExternalLink, BookOpen, Sparkles, Copy, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Image as ImageIcon } from 'lucide-react';
import { SourcesPopup } from "./SourcesPopup";
import { ThinkDeeperButton } from "../ThinkDeeperButton";
import { formatContent } from "@/lib/sanitize";

interface SearchResultProps {
  query: string;
  content: string;
  citations: string[];
  isLoading?: boolean;
  images?: string[];
  searchType?: 'general' | 'news' | 'smart';
  onThinkDeeper?: () => void;
}

export const SearchResult = ({ query, content, citations, isLoading, images = [], searchType = 'general', onThinkDeeper }: SearchResultProps) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
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

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        {/* Query Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2" dir="auto">{query}</h2>
        </div>

        {/* Loading State */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">{t.searching}</span>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
            <div className="h-4 bg-muted rounded animate-pulse w-full" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Query Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold" dir="auto">{query}</h2>
      </div>

      {/* Attached Images */}
      {images.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {t.attachedImages} ({images.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {images.map((img, idx) => (
              <a key={idx} href={img} target="_blank" rel="noopener noreferrer" 
                 className="block w-20 h-20 rounded-lg overflow-hidden border hover:border-primary">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {citations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <SourcesPopup citations={citations} searchType={searchType} />
          </div>
        </div>
      )}

      {/* Answer */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">{t.answer}</span>
          <div className="flex-1" />
          {searchType === 'smart' && (
            <ThinkDeeperButton onClick={onThinkDeeper || (() => {})} />
          )}
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
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
      </div>
    </div>
  );
};
