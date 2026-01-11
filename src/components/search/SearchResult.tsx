import { ExternalLink, BookOpen, Sparkles, Copy, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Image as ImageIcon } from 'lucide-react';
import { SourcesPopup } from "./SourcesPopup";
import { ThinkDeeperButton } from "../ThinkDeeperButton";

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

function formatContent(content: string): string {
  // Convert markdown-like formatting to HTML with enhanced table support
  let html = content
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mb-3 mt-4 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mb-4 mt-6 text-foreground">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-5 mt-8 text-foreground">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic text-foreground">$1</em>')
    // Tables - Enhanced support
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(cell => cell.trim());
      const isHeader = match.includes('---') || cells.some(cell => cell.includes('**'));
      
      if (isHeader) {
        const headerCells = cells.map(cell => 
          `<th class="px-4 py-3 text-right font-semibold text-sm bg-muted/50 border border-border">${cell.replace(/\*\*/g, '')}</th>`
        ).join('');
        return `<table class="w-full border-collapse border border-border rounded-lg overflow-hidden mb-6 shadow-sm"><thead><tr>${headerCells}</tr></thead><tbody>`;
      }
      
      const dataCells = cells.map(cell => 
        `<td class="px-4 py-3 text-right text-sm border border-border bg-card">${cell}</td>`
      ).join('');
      return `<tr class="hover:bg-muted/30 transition-colors">${dataCells}</tr>`;
    })
    // Close table tags
    .replace(/<tbody><tr>/g, '</tbody><tbody><tr>')
    .replace(/<tbody>$/, '</tbody></table>')
    // Lists
    .replace(/^- (.+)$/gm, '<li class="mb-2 flex items-start"><span class="text-primary mr-2">•</span><span>$1</span></li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="mb-2 flex items-start"><span class="text-primary mr-2 font-semibold">$1.</span><span>$2</span></li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br/>');
  
  // Wrap in paragraph
  html = `<p class="text-foreground leading-relaxed mb-4">${html}</p>`;
  
  // Fix list items
  html = html.replace(/(<li>.*?<\/li>)+/gs, (match) => `<ul class="space-y-2 mb-4">${match}</ul>`);
  
  // Clean up table structure
  html = html.replace(/<table>.*?<\/table>/gs, (match) => {
    return match.replace(/<p class="text-foreground leading-relaxed mb-4">/g, '').replace(/<\/p>/g, '');
  });
  
  return html;
}
