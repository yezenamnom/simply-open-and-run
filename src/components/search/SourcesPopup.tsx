import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ExternalLink, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

interface SourcesPopupProps {
  citations: string[];
  searchType?: 'general' | 'news' | 'smart';
}

export const SourcesPopup = ({ citations, searchType = 'general' }: SourcesPopupProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  // Don't show for smart answers
  if (searchType === 'smart' || citations.length === 0) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 px-3"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span className="text-xs">{t.sources}</span>
          <span className="text-xs text-muted-foreground">({citations.length})</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t.sources} ({citations.length})
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-3">
          {citations.map((citation, index) => (
            <a
              key={index}
              href={citation}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all",
                "hover:bg-accent hover:border-primary/50",
                "group"
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0 mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">
                    {getDomain(citation)}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {citation}
                </p>
              </div>
            </a>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
